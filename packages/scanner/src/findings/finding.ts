import { Severity } from './severity';

export interface Finding {
  id: string; // Unique UUID for this specific instance of the finding
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: number; // 0.0 to 1.0
  file: string;
  line: number;
  column: number;
  codeSnippet: string;
  description: string;
  risk: string;
  recommendation: string;
  references?: string[];
  metadata?: Record<string, any>;
}
