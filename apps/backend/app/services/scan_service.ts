import { Scan, Finding, AIExplanation } from '@secureguard/shared';
import { ProjectScanner, calculateScore } from 'secureguard';
import crypto from 'node:crypto';
import fs from 'node:fs';

const scans: Map<string, Scan> = (globalThis as any)._scans || new Map();
const scanFindings: Map<string, Finding[]> = (globalThis as any)._scanFindings || new Map();
(globalThis as any)._scans = scans;
(globalThis as any)._scanFindings = scanFindings;

export default class ScanService {

  async startScan(projectPath: string, aiEnabled: boolean): Promise<Scan> {
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    const scanId = 'scan_' + crypto.randomUUID();
    const scan: Scan = {
      id: scanId,
      projectPath,
      status: 'queued',
      aiEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: { message: 'Queued', percent: 0 }
    };

    scans.set(scanId, scan);
    scanFindings.set(scanId, []);

    // Start background execution
    this.executeScan(scanId, projectPath);

    return scan;
  }

  private async executeScan(scanId: string, projectPath: string) {
    const scan = scans.get(scanId);
    if (!scan) return;

    scan.status = 'running';
    scan.progress = { message: 'Running security rules...', percent: 10 };
    scan.updatedAt = new Date().toISOString();

    try {
      const scanner = new ProjectScanner();
      const findings = await scanner.scan(projectPath);
      
      scanFindings.set(scanId, findings as any);

      scan.progress = { message: 'Calculating security score...', percent: 90 };
      const scoreResult = calculateScore(findings as any);
      
      scan.score = {
        score: scoreResult.score,
        breakdown: scoreResult.breakdown as any
      };
      
      scan.status = 'completed';
      scan.progress = { message: 'Scan complete.', percent: 100 };
      scan.updatedAt = new Date().toISOString();
    } catch (error) {
      console.error('Scan failed:', error);
      scan.status = 'failed';
      scan.progress = { message: 'Scan failed due to an internal error.', percent: 100 };
      scan.updatedAt = new Date().toISOString();
    }
  }

  getScan(scanId: string): Scan | undefined {
    return scans.get(scanId);
  }

  getFindings(scanId: string): Finding[] | undefined {
    return scanFindings.get(scanId);
  }

  getFindingById(findingId: string): Finding | undefined {
    for (const findings of scanFindings.values()) {
      const f = findings.find(f => f.id === findingId);
      if (f) return f;
    }
    return undefined;
  }

  updateFindingExplanation(findingId: string, explanation: AIExplanation) {
    const finding = this.getFindingById(findingId);
    if (finding) {
      finding.aiExplanation = explanation;
      finding.aiStatus = 'success';
    }
  }

  updateFindingStatus(findingId: string, status: 'loading' | 'success' | 'unavailable' | 'error') {
    const finding = this.getFindingById(findingId);
    if (finding) {
      finding.aiStatus = status;
    }
  }
}
