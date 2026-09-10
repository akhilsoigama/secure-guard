import { CheckCircle, Circle, Loader } from 'lucide-react';

interface ScanProgressProps {
  progress: number;
  currentStage: string;
  stages: string[];
}

const TERMINAL_LINES = [
  'Analyzing src/routes/preview.js...',
  'Analyzing src/routes/users.js...',
  'Checking dependency tree...',
  'Scanning environment variables...',
  'Running OWASP security rules...',
  'Checking authentication patterns...',
  'Checking API endpoint security...',
  'Analyzing src/middleware/auth.js...',
  'Running static analysis...',
  'Cross-referencing CVE database...',
  'Scoring vulnerabilities...',
  'Generating AI explanations...',
];

export function ScanProgress({ progress, currentStage, stages }: ScanProgressProps) {
  const currentStageIdx = stages.indexOf(currentStage);
  const terminalLinesVisible = Math.floor((progress / 100) * TERMINAL_LINES.length);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Scanning progress</span>
          <span className="text-lg font-bold text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {stages.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          return (
            <div key={stage} className={`flex items-center gap-2.5 py-2 px-3 rounded-lg ${isCurrent ? 'bg-blue-50 border border-blue-200' : ''}`}>
              {isDone ? (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader size={16} className="text-blue-500 flex-shrink-0 animate-spin" />
              ) : (
                <Circle size={16} className="text-slate-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${isDone ? 'text-slate-600' : isCurrent ? 'text-blue-700 font-medium' : 'text-slate-400'}`}>
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Terminal output */}
      <div className="terminal">
        <div className="terminal-bar">
          <span className="terminal-dot bg-[#ff5f57]" />
          <span className="terminal-dot bg-[#febc2e]" />
          <span className="terminal-dot bg-[#28c840]" />
          <span className="ml-2 text-xs text-slate-400 font-mono">secureguard — scan</span>
        </div>
        <div className="terminal-body h-40 overflow-y-auto">
          <div className="text-green-400 font-bold mb-2">SecureGuard v1.0 — Scanning...</div>
          {TERMINAL_LINES.slice(0, terminalLinesVisible).map((line, idx) => (
            <div key={idx} className="text-slate-300 text-xs">
              <span className="text-slate-500">{'>'}</span> {line}
            </div>
          ))}
          {progress < 100 && <span className="terminal-cursor" />}
        </div>
      </div>
    </div>
  );
}
