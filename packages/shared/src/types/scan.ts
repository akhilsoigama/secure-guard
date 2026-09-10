export type ScanStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ScanProgress {
  message: string;
  percent: number;
}

export interface SecurityScore {
  score: number;
  breakdown: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    INFO: number;
  };
}

export interface Scan {
  id: string;
  projectPath: string;
  status: ScanStatus;
  aiEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  progress?: ScanProgress;
  score?: SecurityScore;
}
