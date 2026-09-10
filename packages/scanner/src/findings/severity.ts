export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO'
}

export function getSeverityWeight(severity: Severity): number {
  switch (severity) {
    case Severity.CRITICAL: return 20;
    case Severity.HIGH: return 10;
    case Severity.MEDIUM: return 5;
    case Severity.LOW: return 1;
    case Severity.INFO: return 0;
  }
}
