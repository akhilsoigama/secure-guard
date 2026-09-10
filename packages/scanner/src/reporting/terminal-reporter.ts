import { Finding } from '../findings/finding';
import { ScoreResult } from '../scoring/security-score';
import chalk from 'chalk';

export class TerminalReporter {
  report(findings: Finding[], scoreResult: ScoreResult) {
    console.log(chalk.bold('\nSecureGuard Security Report'));
    console.log('────────────────────────────\n');

    console.log(`Security Score: ${scoreResult.score}/${scoreResult.maxScore}\n`);

    if (findings.length === 0) {
      console.log(chalk.green('No vulnerabilities detected!\n'));
      return;
    }

    // Sort by severity (simplistic sort for MVP)
    const severityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'INFO': 4 };
    findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    for (const finding of findings) {
      const sevColor = this.getSeverityColor(finding.severity);
      console.log(`${sevColor(finding.severity.padEnd(8))} ${finding.title}`);
      console.log(`${chalk.gray(finding.file + ':' + finding.line)}`);
      console.log(`\n${finding.description}\n`);
      console.log(`${chalk.bold('Risk:')}\n${finding.risk}\n`);
      console.log(`${chalk.bold('Fix:')}\n${finding.recommendation}\n`);
      
      if (finding.metadata?.aiExplanation) {
         console.log(chalk.cyan('--- AI Explanation ---'));
         console.log(finding.metadata.aiExplanation.summary);
         console.log(chalk.bold('Secure Example:'));
         console.log(finding.metadata.aiExplanation.secureCodeExample);
         console.log(chalk.cyan('----------------------\n'));
      } else {
        console.log('────────────────────────────\n');
      }
    }

    console.log(chalk.bold('Summary:'));
    for (const [sev, count] of Object.entries(scoreResult.breakdown)) {
      if (count > 0) {
         console.log(`${sev}: ${count}`);
      }
    }
    console.log('');
  }

  private getSeverityColor(sev: string) {
    switch(sev) {
      case 'CRITICAL': return chalk.bgRed.white.bold;
      case 'HIGH': return chalk.red.bold;
      case 'MEDIUM': return chalk.yellow.bold;
      case 'LOW': return chalk.blue.bold;
      default: return chalk.white;
    }
  }
}
