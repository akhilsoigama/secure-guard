#!/usr/bin/env node
import { Command } from 'commander';
import { ProjectScanner } from '../scanner/project-scanner';
import { OpenAIProvider } from '../ai/explanation-service';
import { calculateScore } from '../scoring/security-score';
import { TerminalReporter } from '../reporting/terminal-reporter';
import * as fs from 'fs';

const program = new Command();

program
  .name('secureguard')
  .description('SecureGuard Core Engine - Application Security Scanner')
  .version('1.0.0');

program.command('scan')
  .description('Scan a project directory for security vulnerabilities')
  .argument('<path>', 'Path to the project directory')
  .option('--json', 'Output findings in JSON format')
  .option('--no-ai', 'Disable AI explanation layer')
  .action(async (targetPath, options) => {
    if (!fs.existsSync(targetPath)) {
      console.error(`Error: Path ${targetPath} does not exist.`);
      process.exit(2);
    }

    const scanner = new ProjectScanner();
    const findings = await scanner.scan(targetPath);

    // AI Explanation Layer
    if (!options.noAi && process.env.OPENAI_API_KEY) {
      const aiProvider = new OpenAIProvider();
      for (const finding of findings) {
        if (finding.severity === 'CRITICAL' || finding.severity === 'HIGH') {
           const explanation = await aiProvider.explain(finding);
           if (explanation) {
             finding.metadata = { ...finding.metadata, aiExplanation: explanation };
           }
        }
      }
    }

    const scoreResult = calculateScore(findings);

    if (options.json) {
      console.log(JSON.stringify({ score: scoreResult, findings }, null, 2));
    } else {
      const reporter = new TerminalReporter();
      reporter.report(findings, scoreResult);
    }

    // Exit codes
    if (findings.some(f => f.severity === 'CRITICAL' || f.severity === 'HIGH')) {
      process.exit(1);
    }
    process.exit(0);
  });

program.parse();
