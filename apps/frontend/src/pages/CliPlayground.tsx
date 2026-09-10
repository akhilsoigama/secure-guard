import { useState, useRef, useEffect } from 'react';
import { Terminal, Play, Copy, Check, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DEMO_OUTPUT_LINES = [
  { text: '$ npx secureguard scan ./my-project', type: 'command', delay: 0 },
  { text: '', type: 'blank', delay: 200 },
  { text: 'SecureGuard v1.0 — AI-Powered Security Scanner', type: 'header', delay: 400 },
  { text: 'Scanning: ./my-project', type: 'info', delay: 600 },
  { text: '', type: 'blank', delay: 700 },
  { text: '✓ Project detected (Node.js, 234 files)', type: 'success', delay: 900 },
  { text: '✓ Source files analyzed', type: 'success', delay: 1400 },
  { text: '✓ Dependencies analyzed (127 packages)', type: 'success', delay: 1900 },
  { text: '✓ Secrets checked', type: 'success', delay: 2400 },
  { text: '✓ Security rules executed', type: 'success', delay: 2900 },
  { text: '', type: 'blank', delay: 3100 },
  { text: '━━━ FINDINGS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'separator', delay: 3300 },
  { text: '', type: 'blank', delay: 3400 },
  { text: '[CRITICAL]  SSRF', type: 'critical', delay: 3600 },
  { text: '            src/routes/preview.js:18', type: 'location', delay: 3700 },
  { text: '            User-controlled URL reaches server-side fetch', type: 'desc', delay: 3800 },
  { text: '', type: 'blank', delay: 3900 },
  { text: '[CRITICAL]  Mass Assignment', type: 'critical', delay: 4100 },
  { text: '            src/routes/users.js:41', type: 'location', delay: 4200 },
  { text: '            req.body spread to DB update without filtering', type: 'desc', delay: 4300 },
  { text: '', type: 'blank', delay: 4400 },
  { text: '[HIGH]      Compromised Dependency', type: 'high', delay: 4600 },
  { text: '            axios@1.14.1', type: 'location', delay: 4700 },
  { text: '            Malicious code in npm registry', type: 'desc', delay: 4800 },
  { text: '', type: 'blank', delay: 4900 },
  { text: '[HIGH]      SQL Injection', type: 'high', delay: 5100 },
  { text: '            src/routes/search.js:12', type: 'location', delay: 5200 },
  { text: '            User input concatenated into SQL query', type: 'desc', delay: 5300 },
  { text: '', type: 'blank', delay: 5400 },
  { text: '[HIGH]      Insecure Direct Object Reference', type: 'high', delay: 5600 },
  { text: '            src/routes/invoices.js:27', type: 'location', delay: 5700 },
  { text: '            No ownership check on invoice access', type: 'desc', delay: 5800 },
  { text: '', type: 'blank', delay: 5900 },
  { text: '[SECRET]    Stripe Secret Key exposed', type: 'critical', delay: 6100 },
  { text: '            .env:4 — NEXT_PUBLIC_STRIPE_SECRET_KEY', type: 'location', delay: 6200 },
  { text: '', type: 'blank', delay: 6300 },
  { text: '━━━ SUMMARY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'separator', delay: 6500 },
  { text: '', type: 'blank', delay: 6600 },
  { text: '  Critical   2', type: 'critical', delay: 6700 },
  { text: '  High       3', type: 'high', delay: 6800 },
  { text: '  Medium     2', type: 'medium', delay: 6900 },
  { text: '  Low        1', type: 'low', delay: 7000 },
  { text: '', type: 'blank', delay: 7100 },
  { text: '  Security Score: 47/100 ⚠ Needs Attention', type: 'score', delay: 7300 },
  { text: '', type: 'blank', delay: 7400 },
  { text: 'Run `npx secureguard report` to generate a full report.', type: 'info', delay: 7600 },
  { text: 'Scan complete in 48s.', type: 'success', delay: 7800 },
];

const lineColors: Record<string, string> = {
  command: 'text-white',
  header: 'text-cyan-300 font-bold',
  info: 'text-slate-400',
  success: 'text-green-400',
  critical: 'text-red-400 font-semibold',
  high: 'text-orange-400 font-semibold',
  medium: 'text-yellow-400',
  low: 'text-blue-400',
  separator: 'text-slate-500',
  location: 'text-slate-400 pl-4',
  desc: 'text-slate-500 pl-4 italic',
  score: 'text-yellow-300 font-bold',
  blank: '',
};

const CLI_COMMAND = 'npx secureguard scan ./my-project';

const EXAMPLE_COMMANDS = [
  { cmd: 'npx secureguard scan ./my-project', desc: 'Scan a local project' },
  { cmd: 'npx secureguard scan --severity critical', desc: 'Show only critical findings' },
  { cmd: 'npx secureguard report --format json', desc: 'Export findings as JSON' },
  { cmd: 'npx secureguard fix --auto', desc: 'Apply automatic fixes where possible' },
  { cmd: 'npx secureguard diff --since HEAD~1', desc: 'Scan only changed files' },
];

export function CliPlayground() {
  const { showToast } = useApp();
  const [visibleLines, setVisibleLines] = useState<typeof DEMO_OUTPUT_LINES>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const runDemo = () => {
    if (isRunning) return;
    setIsRunning(true);
    setHasRun(true);
    setVisibleLines([]);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    DEMO_OUTPUT_LINES.forEach((line, idx) => {
      const timeout = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        if (idx === DEMO_OUTPUT_LINES.length - 1) {
          setIsRunning(false);
        }
      }, line.delay);
      timeoutsRef.current.push(timeout);
    });
  };

  const handleCopyCommand = async () => {
    await navigator.clipboard.writeText(CLI_COMMAND);
    setCopiedCmd(true);
    showToast({ type: 'success', title: 'Command copied!' });
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Terminal size={24} className="text-slate-600" />
            SecureGuard CLI
          </h1>
          <p className="text-slate-500 text-sm mt-1">Experience SecureGuard as a command-line tool. Run the demo to see real output.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyCommand}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {copiedCmd ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            Copy Command
          </button>
          <button
            type="button"
            onClick={runDemo}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            id="run-demo-scan-button"
            aria-label="Run demo scan in terminal"
          >
            <Play size={14} />
            {isRunning ? 'Running...' : 'Run Demo Scan'}
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="terminal rounded-xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Window chrome */}
        <div className="terminal-bar">
          <span className="terminal-dot bg-[#ff5f57]" />
          <span className="terminal-dot bg-[#febc2e]" />
          <span className="terminal-dot bg-[#28c840]" />
          <span className="ml-3 text-xs text-slate-400 font-mono">secureguard — bash — 120×32</span>
          <span className="ml-auto text-xs text-slate-500 font-mono">v1.0.0</span>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="terminal-body h-96 overflow-y-auto space-y-0"
          aria-label="Terminal output"
          role="log"
          aria-live="polite"
        >
          {!hasRun ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-1">SecureGuard CLI Playground</p>
                <p className="text-slate-600 text-xs">Click "Run Demo Scan" to see the CLI in action</p>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-slate-500">$</span>
                <span className="text-cyan-400">npx secureguard scan</span>
                <span className="text-yellow-300">./my-project</span>
                <span className="terminal-cursor" />
              </div>
            </div>
          ) : (
            <div>
              {visibleLines.map((line, idx) => (
                <div key={idx} className={`text-xs leading-5 ${lineColors[line.type] ?? 'text-slate-300'} ${line.type === 'blank' ? 'h-2' : ''}`}>
                  {line.type !== 'blank' && line.text}
                </div>
              ))}
              {isRunning && <span className="terminal-cursor" />}
            </div>
          )}
        </div>
      </div>

      {/* Command examples */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Example Commands</h2>
        <div className="space-y-2">
          {EXAMPLE_COMMANDS.map((example, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
              <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <code className="text-sm text-slate-800 font-mono">{example.cmd}</code>
                <p className="text-xs text-slate-500 mt-0.5">{example.desc}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(example.cmd);
                  showToast({ type: 'success', title: 'Command copied!' });
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-slate-600 rounded"
                aria-label={`Copy: ${example.cmd}`}
              >
                <Copy size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Install note */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
        <p className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wide">Quick install</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-cyan-400 flex-1 font-mono">npm install -g @secureguard/cli</code>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText('npm install -g @secureguard/cli');
              showToast({ type: 'success', title: 'Install command copied!' });
            }}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition-colors"
            aria-label="Copy install command"
          >
            <Copy size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
