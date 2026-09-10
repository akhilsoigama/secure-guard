import { Finding } from '../findings/finding';
import { getSeverityWeight } from '../findings/severity';

export interface ScoreResult {
  score: number;
  maxScore: number;
  breakdown: Record<string, number>;
}

export function calculateScore(findings: Finding[]): ScoreResult {
  const maxScore = 100;
  let penalty = 0;
  const breakdown: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0
  };

  for (const finding of findings) {
    breakdown[finding.severity] += 1;
    // penalty is weight * confidence.
    penalty += getSeverityWeight(finding.severity) * finding.confidence;
  }

  const score = Math.max(0, Math.round(maxScore - penalty));

  return {
    score,
    maxScore,
    breakdown
  };
}
