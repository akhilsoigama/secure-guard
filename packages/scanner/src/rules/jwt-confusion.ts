import { Finding } from '../findings/finding';
import { Severity } from '../findings/severity';
import { Rule, RuleContext } from './rule';
import { walkAst } from '../analyzers/ast/ast-walker';

export class JwtMisconfigRule implements Rule {
  id = 'JWT-001';
  name = 'JWT Algorithm Confusion / Misconfiguration';
  description = 'Detects jwt.verify() usage where accepted algorithms are not explicitly restricted.';
  supportedLanguages = ['javascript', 'typescript'];

  detect(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    
    walkAst(context.ast, {
      enter: (node, parent) => {
        if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
          const isJwtVerify = (node.callee.object.type === 'Identifier' && (node.callee.object.name === 'jwt' || node.callee.object.name === 'jsonwebtoken')) 
                            && node.callee.property.type === 'Identifier' && node.callee.property.name === 'verify';

          if (isJwtVerify) {
            let hasAlgorithms = false;
            
            // Check if third argument exists and has an 'algorithms' property
            if (node.arguments.length >= 3) {
              const optionsArg = node.arguments[2];
              if (optionsArg.type === 'ObjectExpression') {
                for (const prop of optionsArg.properties) {
                  if (prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'algorithms') {
                    hasAlgorithms = true;
                  }
                }
              }
            }

            if (!hasAlgorithms) {
              findings.push({
                id: crypto.randomUUID(),
                ruleId: this.id,
                title: this.name,
                severity: 'HIGH',
                confidence: 0.95,
                file: context.file,
                line: node.loc.start.line,
                codeSnippet: context.content.split('\n')[node.loc.start.line - 1].trim(),
                description: 'The jwt.verify() function is called without explicitly specifying the allowed algorithms.',
                risk: 'An attacker could supply a JWT signed with a different algorithm (e.g., "none" or symmetric instead of asymmetric), bypassing signature validation.',
                recommendation: 'Explicitly specify the allowed algorithms when verifying a JWT. For example: jwt.verify(token, key, { algorithms: ["RS256"] }).'
              });
            }
          }
        }
      }
    });

    return findings;
  }
}
