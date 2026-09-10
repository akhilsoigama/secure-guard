import { Finding } from '../../findings/finding';
import { Severity } from '../../findings/severity';
import * as fs from 'fs';
import * as path from 'path';

export interface VulnerabilityProvider {
  getVulnerabilities(packageName: string, version: string): Promise<any[]>;
}

export class MockVulnerabilityProvider implements VulnerabilityProvider {
  async getVulnerabilities(packageName: string, version: string): Promise<any[]> {
    // Mock intelligence logic: Assume 'express' < 4.16.0 has issues
    if (packageName === 'express' && version.startsWith('^4.15')) {
      return [{ id: 'CVE-MOCK-001', severity: 'HIGH', description: 'Mock vulnerable express version' }];
    }
    // Mock compromised dependency: e.g. event-stream 3.3.6
    if (packageName === 'event-stream' && version.includes('3.3.6')) {
      return [{ id: 'COMPROMISED-MOCK-001', severity: 'CRITICAL', description: 'Malicious flatmap-stream injection' }];
    }
    return [];
  }
}

export class NpmDependencyScanner {
  constructor(private provider: VulnerabilityProvider) {}

  async scan(projectPath: string): Promise<Finding[]> {
    const findings: Finding[] = [];
    const pkgPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(pkgPath)) {
      return findings;
    }

    try {
      const pkgContent = fs.readFileSync(pkgPath, 'utf8');
      const pkg = JSON.parse(pkgContent);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const [pkgName, version] of Object.entries(deps)) {
        const vulns = await this.provider.getVulnerabilities(pkgName, version as string);
        for (const vuln of vulns) {
          findings.push({
             id: crypto.randomUUID(),
             ruleId: 'DEP-001',
             title: `Vulnerable/Compromised Dependency: ${pkgName}`,
             severity: vuln.severity === 'CRITICAL' ? Severity.CRITICAL : Severity.HIGH,
             confidence: 0.95,
             file: 'package.json',
             line: 1, // simplified for MVP
             column: 1,
             codeSnippet: `"${pkgName}": "${version}"`,
             description: vuln.description,
             risk: 'Using compromised or vulnerable dependencies can lead to full system compromise or data exfiltration.',
             recommendation: `Update ${pkgName} to a safe version.`
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse package.json for dependency scanning', e);
    }

    return findings;
  }
}
