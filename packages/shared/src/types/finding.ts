export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface AIExplanation {
  summary: string;
  whatIsWrong: string;
  whyItMatters: string;
  attackerImpact: string;
  recommendation: string;
  secureCodeExample: string;
  explanation: string;
}

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: number;
  file: string;
  line: number;
  codeSnippet: string;
  description: string;
  risk: string;
  recommendation: string;
  aiExplanation?: AIExplanation | null;
  aiStatus?: 'loading' | 'success' | 'unavailable' | 'error' | null;
}
