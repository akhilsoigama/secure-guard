import { Severity } from '@secureguard/shared';

export function getSeverityWeight(severity: Severity): number {
  switch (severity) {
    case 'CRITICAL': return 20;
    case 'HIGH': return 10;
    case 'MEDIUM': return 5;
    case 'LOW': return 1;
    case 'INFO': return 0;
  }
}
export { Severity };
