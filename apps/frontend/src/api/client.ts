import type { Scan, Finding, SecurityScore, AIExplanation } from '@secureguard/shared';

const API_BASE = 'http://localhost:3333/api';

export const apiClient = {
  async createScan(projectPath: string, aiEnabled: boolean = true): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath, aiEnabled })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getScan(scanId: string): Promise<Scan> {
    const res = await fetch(`${API_BASE}/scans/${scanId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getFindings(scanId: string, severity?: string): Promise<Finding[]> {
    const url = new URL(`${API_BASE}/scans/${scanId}/findings`);
    if (severity) url.searchParams.append('severity', severity);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getScore(scanId: string): Promise<SecurityScore> {
    const res = await fetch(`${API_BASE}/scans/${scanId}/score`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async explainFinding(findingId: string): Promise<AIExplanation> {
    const res = await fetch(`${API_BASE}/findings/${findingId}/explain`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};
