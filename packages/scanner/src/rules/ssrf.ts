import { Finding } from '../findings/finding';
import { Severity } from '../findings/severity';
import { Rule, RuleContext } from './rule';
import { walkAst } from '../analyzers/ast/ast-walker';

export class SsrfRule implements Rule {
  id = 'SSRF-001';
  name = 'Server-Side Request Forgery (SSRF)';
  description = 'Detects potential SSRF where HTTP request destinations are constructed from user-controlled input without validation.';
  supportedLanguages = ['javascript', 'typescript'];

  detect(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    
    walkAst(context.ast, {
      enter: (node, parent) => {
        if (node.type === 'CallExpression') {
          const isFetch = node.callee.type === 'Identifier' && node.callee.name === 'fetch';
          
          let isAxios = false;
          if (node.callee.type === 'Identifier' && node.callee.name === 'axios') {
            isAxios = true;
          } else if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'axios') {
            isAxios = true; // e.g. axios.get, axios.post
          }

          if (isFetch || isAxios) {
            if (node.arguments && node.arguments.length > 0) {
              const urlArg = node.arguments[0];
              
              // If it's a literal string, it's generally safe (not user-controlled).
              if (urlArg.type === 'Literal') {
                return; 
              }

              // Otherwise (Identifier, TemplateLiteral, BinaryExpression, etc), it's potentially user-controlled.
              findings.push({
                id: crypto.randomUUID(),
                ruleId: this.id,
                title: this.name,
                severity: Severity.CRITICAL,
                confidence: 0.8, // Without data flow, confidence is moderate-high
                file: context.file,
                line: node.loc.start.line,
                column: node.loc.start.column,
                codeSnippet: context.content.split('\n')[node.loc.start.line - 1].trim(),
                description: 'The URL passed to an HTTP client appears to be dynamic. If this originates from user input, it may lead to SSRF.',
                risk: 'An attacker could force the server to make requests to internal services, cloud metadata endpoints, or other unintended destinations.',
                recommendation: 'Validate and sanitize the destination URL against a strict allowlist before making the request. Do not accept arbitrary URLs from users.'
              });
            }
          }
        }
      }
    });

    return findings;
  }
}
