import { Finding } from '../findings/finding';
import { Severity } from '../findings/severity';
import { Rule, RuleContext } from './rule';
import { walkAst } from '../analyzers/ast/ast-walker';

export class SqliRule implements Rule {
  id = 'SQLI-001';
  name = 'SQL Injection (SQLi)';
  description = 'Detects interpolated or concatenated user-controlled values inside raw SQL / ORM query APIs.';
  supportedLanguages = ['javascript', 'typescript'];

  detect(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    
    walkAst(context.ast, {
      enter: (node, parent) => {
        if (node.type === 'CallExpression') {
          // Detect knex.raw, sequelize.query, prisma.$queryRawUnsafe
          const isDangerousCall = node.callee.type === 'MemberExpression' 
            && node.callee.property.type === 'Identifier'
            && ['raw', 'query', '$queryRawUnsafe'].includes(node.callee.property.name);
          
          if (isDangerousCall && node.arguments.length > 0) {
            const firstArg = node.arguments[0];

            // If it's a template literal with expressions, it might be SQL injection
            if (firstArg.type === 'TemplateLiteral' && firstArg.expressions.length > 0) {
              findings.push({
                id: crypto.randomUUID(),
                ruleId: this.id,
                title: this.name,
                severity: 'CRITICAL',
                confidence: 0.8,
                file: context.file,
                line: node.loc.start.line,
                codeSnippet: context.content.split('\n')[node.loc.start.line - 1].trim(),
                description: 'Detected string interpolation within a raw SQL query execution. This is a potential SQL Injection vulnerability.',
                risk: 'An attacker could alter the SQL statement structure to access or modify unauthorized data.',
                recommendation: 'Use parameterized queries, prepared statements, or the ORM\'s safe tag functions (like Prisma\'s $queryRaw`...`) instead of unsafe string interpolation.'
              });
            }

            // Also check for string concatenation like knex.raw("SELECT * FROM users WHERE id = " + id)
            if (firstArg.type === 'BinaryExpression' && firstArg.operator === '+') {
               findings.push({
                id: crypto.randomUUID(),
                ruleId: this.id,
                title: this.name,
                severity: 'CRITICAL',
                confidence: 0.8,
                file: context.file,
                line: node.loc.start.line,
                codeSnippet: context.content.split('\n')[node.loc.start.line - 1].trim(),
                description: 'Detected string concatenation within a raw SQL query execution. This is a potential SQL Injection vulnerability.',
                risk: 'An attacker could alter the SQL statement structure to access or modify unauthorized data.',
                recommendation: 'Use parameterized queries instead of unsafe string concatenation.'
              });
            }
          }
        }
      }
    });

    return findings;
  }
}
