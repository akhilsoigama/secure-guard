import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@typescript-eslint/typescript-estree';
import { Finding } from '../findings/finding';
import { Rule, RuleContext } from '../rules/rule';
import { SsrfRule } from '../rules/ssrf';
import { MassAssignmentRule } from '../rules/mass-assignment';
import { JwtMisconfigRule } from '../rules/jwt-confusion';
import { SqliRule } from '../rules/sqli';
import { ExposedSecretsRule } from '../rules/exposed-secrets';
import { IdorRule } from '../rules/idor';
import { SecretScanner } from '../analyzers/secrets/secret-scanner';
import { NpmDependencyScanner, MockVulnerabilityProvider } from '../analyzers/dependencies/dependency-scanner';

export class ProjectScanner {
  private rules: Rule[] = [
    new SsrfRule(),
    new MassAssignmentRule(),
    new JwtMisconfigRule(),
    new SqliRule(),
    new ExposedSecretsRule(),
    new IdorRule()
  ];
  private secretScanner = new SecretScanner();
  private depScanner = new NpmDependencyScanner(new MockVulnerabilityProvider());

  async scan(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    const files = this.discoverFiles(projectPath);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');

        // Run secret scanner on all files
        findings.push(...this.secretScanner.scan(content, file));

        // AST parsing for JS/TS
        if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
          const ast = parse(content, { loc: true, range: true, jsx: true });
          const context: RuleContext = { ast, file, content };

          for (const rule of this.rules) {
            const ruleFindings = await rule.detect(context);
            findings.push(...ruleFindings);
          }
        }
      } catch (e) {
        // Ignore parse errors for MVP to ensure complete scan
        // console.error(`Error processing file ${file}:`, e);
      }
    }

    // Run dependency scanner
    const depFindings = await this.depScanner.scan(projectPath);
    findings.push(...depFindings);

    return findings;
  }

  private discoverFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist') && !filePath.includes('build')) {
          this.discoverFiles(filePath, fileList);
        }
      } else {
        fileList.push(filePath);
      }
    }
    return fileList;
  }
}
