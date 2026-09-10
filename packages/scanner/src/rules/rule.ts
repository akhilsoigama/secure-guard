import { Finding } from '../findings/finding';
import { AST } from '@typescript-eslint/typescript-estree';

export interface RuleContext {
  ast: AST<{ loc: true, range: true }>;
  file: string;
  content: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  supportedLanguages: string[]; // e.g., ['javascript', 'typescript']
  detect(context: RuleContext): Finding[] | Promise<Finding[]>;
}
