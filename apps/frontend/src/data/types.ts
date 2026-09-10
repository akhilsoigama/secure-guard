export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type FindingStatus = 'open' | 'fixed' | 'ignored' | 'in_progress';
export type ScanStatus = 'idle' | 'scanning' | 'complete' | 'failed';

export interface Finding {
  id: string;
  title: string;
  type: string;
  severity: Severity;
  file: string;
  line: number;
  risk: string;
  impact: string;
  status: FindingStatus;
  cwe?: string;
  cvss?: number;
  description: string;
  attackScenario: string;
  aiExplanation: {
    whatIsWrong: string;
    whyItMatters: string;
    whatToDo: string;
  };
  vulnerableCode: string;
  fixCode: string;
  vulnerableCodeHighlightLine?: number;
  tags: string[];
}

export interface Dependency {
  id: string;
  name: string;
  version: string;
  severity: Severity | 'safe';
  issue: string;
  cve?: string;
  fixVersion?: string;
  status: 'vulnerable' | 'outdated' | 'safe';
  license: string;
}

export interface Secret {
  id: string;
  type: string;
  file: string;
  line: number;
  severity: Severity;
  description: string;
  maskedValue: string;
  envKey: string;
  recommendation: string;
  status: FindingStatus;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  auth: 'authenticated' | 'unauthenticated' | 'api_key';
  severity: Severity | 'safe';
  issue: string;
  description: string;
  status: 'open' | 'protected' | 'review';
}

export interface ScanRecord {
  id: string;
  date: string;
  project: string;
  score: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  status: 'needs_attention' | 'improved' | 'good' | 'excellent';
  duration: string;
  filesScanned: number;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  lastScan: string;
  score: number;
  language: string;
}

export interface SecurityScore {
  total: number;
  codeSecurity: number;
  dependencySecurity: number;
  secretSecurity: number;
  apiSecurity: number;
}

export interface ScanTrendPoint {
  scan: string;
  score: number;
  label: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}
