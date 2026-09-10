import { Finding } from '../findings/finding';
import { Severity } from '../findings/severity';
import { Rule, RuleContext } from './rule';
import { walkAst } from '../analyzers/ast/ast-walker';

export class MassAssignmentRule implements Rule {
  id = 'MASS-001';
  name = 'Mass Assignment';
  description = 'Detects patterns where raw request bodies are spread or bulk-assigned into database models.';
  supportedLanguages = ['javascript', 'typescript'];

  detect(context: RuleContext): Finding[] {
    const findings: Finding[] = [];
    
    walkAst(context.ast, {
      enter: (node, parent) => {
        // Look for ObjectExpression containing SpreadElement like {...req.body}
        if (node.type === 'SpreadElement') {
          if (this.isReqBody(node.argument)) {
            this.addFinding(findings, context, node, 'Direct spread of request body into an object without filtering.');
          }
        }

        // Look for CallExpression like Model.create(req.body) or Model.update({...req.body})
        if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
          const propName = node.callee.property.type === 'Identifier' ? node.callee.property.name : '';
          const dangerousMethods = ['create', 'update', 'findByIdAndUpdate', 'updateOne', 'updateMany'];
          
          if (dangerousMethods.includes(propName)) {
            // Check arguments
            for (const arg of node.arguments) {
              if (this.isReqBody(arg) || (arg.type === 'ObjectExpression' && arg.properties.some((p: any) => p.type === 'SpreadElement' && this.isReqBody(p.argument)))) {
                this.addFinding(findings, context, node, `Bulk assignment of request body via ${propName}() without explicit allow-list.`);
              }
            }
          }
        }
      }
    });

    return findings;
  }

  private isReqBody(node: any): boolean {
    return node.type === 'MemberExpression' 
        && node.object.type === 'Identifier' 
        && (node.object.name === 'req' || node.object.name === 'request')
        && node.property.type === 'Identifier'
        && node.property.name === 'body';
  }

  private addFinding(findings: Finding[], context: RuleContext, node: any, description: string) {
    findings.push({
      id: crypto.randomUUID(),
      ruleId: this.id,
      title: this.name,
      severity: 'HIGH',
      confidence: 0.9,
      file: context.file,
      line: node.loc.start.line,
      codeSnippet: context.content.split('\n')[node.loc.start.line - 1].trim(),
      description,
      risk: 'Attackers could assign values to fields they shouldn\'t have access to, such as `isAdmin`, `role`, or `password`.',
      recommendation: 'Explicitly extract and validate only the allowed fields from the request body before using them in database operations.'
    });
  }
}
