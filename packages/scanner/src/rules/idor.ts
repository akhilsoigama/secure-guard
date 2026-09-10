import { Finding } from '../findings/finding';
import { Severity } from '../findings/severity';
import { Rule, RuleContext } from './rule';
import { walkAst } from '../analyzers/ast/ast-walker';

export class IdorRule implements Rule {
  id = 'IDOR-001';
  name = 'Insecure Direct Object Reference (IDOR)';
  description = 'Detects routes that accept an object ID from request parameters, retrieve the resource, but fail to perform ownership validation.';
  supportedLanguages = ['javascript', 'typescript'];

  detect(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    
    walkAst(context.ast, {
      enter: (node, parent) => {
        // Look for typical Express/Fastify route handlers: app.get('/...', requireAuth, (req, res) => { ... })
        if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
          const method = node.callee.property.name;
          if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
            // Check if arguments have an arrow function or function expression
            const handlerNode = node.arguments.find((arg: any) => arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression');
            
            if (handlerNode && handlerNode.body && handlerNode.body.type === 'BlockStatement') {
                let usesReqParamsId = false;
                let retrievesResource = false;
                let performsOwnershipCheck = false;

                // Simple walk inside the handler to detect patterns
                walkAst(handlerNode.body, {
                    enter: (child) => {
                        // Detect req.params.id or req.params
                        if (child.type === 'MemberExpression' && child.object.name === 'req' && child.property.name === 'params') {
                            usesReqParamsId = true;
                        }
                        // Detect Model.findById or db.query or something similar
                        if (child.type === 'CallExpression' && child.callee.type === 'MemberExpression') {
                            const calleeProp = child.callee.property.name;
                            if (['findById', 'findOne', 'query', 'findUnique', 'findByPk'].includes(calleeProp)) {
                                retrievesResource = true;
                            }
                        }
                        // Detect req.user.id or user.id equality check
                        if (child.type === 'BinaryExpression' && ['===', '==', '!==', '!='].includes(child.operator)) {
                            performsOwnershipCheck = true;
                        }
                    }
                });

                if (usesReqParamsId && retrievesResource && !performsOwnershipCheck) {
                     findings.push({
                        id: crypto.randomUUID(),
                        ruleId: this.id,
                        title: this.name,
                        severity: Severity.HIGH,
                        confidence: 0.6, // IDOR is notoriously hard to detect via AST without full data flow, so lower confidence
                        file: context.file,
                        line: handlerNode.loc.start.line,
                        column: handlerNode.loc.start.column,
                        codeSnippet: context.content.split('\n')[handlerNode.loc.start.line - 1].trim(),
                        description: 'A route handler retrieves a resource using a request parameter but does not seem to perform an ownership or authorization check.',
                        risk: 'An attacker could modify the ID parameter to access or manipulate resources belonging to other users.',
                        recommendation: 'Ensure that the fetched resource is explicitly checked against the authenticated user\'s ID (e.g., `resource.userId === req.user.id`).'
                    });
                }
            }
          }
        }
      }
    });

    return findings;
  }
}
