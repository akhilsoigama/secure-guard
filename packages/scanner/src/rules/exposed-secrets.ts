import { Finding } from '../findings/finding';
import { Severity } from '../findings/severity';
import { Rule, RuleContext } from './rule';
import { walkAst } from '../analyzers/ast/ast-walker';

export class ExposedSecretsRule implements Rule {
  id = 'SECRETS-001';
  name = 'Client-Exposed Secrets';
  description = 'Detects sensitive environment variables exposed through client-side prefixes.';
  supportedLanguages = ['javascript', 'typescript'];

  detect(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    const prefixes = ['NEXT_PUBLIC_', 'VITE_', 'REACT_APP_'];
    const sensitiveWords = ['secret', 'key', 'token', 'password', 'private', 'credentials'];

    walkAst(context.ast, {
      enter: (node, parent) => {
        // Detect process.env.NEXT_PUBLIC_SECRET_KEY
        if (node.type === 'MemberExpression' 
            && node.object.type === 'MemberExpression' 
            && node.object.object.name === 'process' 
            && node.object.property.name === 'env') {
            
            if (node.property.type === 'Identifier') {
                const varName = node.property.name.toUpperCase();
                
                for (const prefix of prefixes) {
                    if (varName.startsWith(prefix)) {
                        for (const word of sensitiveWords) {
                            if (varName.includes(word.toUpperCase())) {
                                findings.push({
                                    id: crypto.randomUUID(),
                                    ruleId: this.id,
                                    title: this.name,
                                    severity: Severity.HIGH,
                                    confidence: 0.85,
                                    file: context.file,
                                    line: node.loc.start.line,
                                    column: node.loc.start.column,
                                    codeSnippet: context.content.split('\n')[node.loc.start.line - 1].trim(),
                                    description: `Environment variable '${node.property.name}' uses a client-side exposure prefix but appears to contain sensitive data.`,
                                    risk: 'Client-exposed variables are bundled into the frontend JavaScript, allowing any user to easily extract the secret.',
                                    recommendation: 'Remove the client-side prefix (e.g. NEXT_PUBLIC_) and move the secret to a secure backend service that proxies the required operations.'
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }
      }
    });

    return findings;
  }
}
