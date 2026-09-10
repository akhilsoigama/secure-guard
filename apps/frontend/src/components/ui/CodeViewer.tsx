import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  title?: string;
  highlightLine?: number;
  showLineNumbers?: boolean;
  variant?: 'vulnerable' | 'fixed' | 'neutral';
}

export function CodeViewer({
  code,
  language = 'javascript',
  title,
  highlightLine,
  showLineNumbers = true,
  variant = 'neutral',
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const variantHeader = {
    vulnerable: 'bg-red-950 border-b border-red-800',
    fixed: 'bg-green-950 border-b border-green-800',
    neutral: 'bg-[#161b22] border-b border-[#30363d]',
  };

  const variantBadge = {
    vulnerable: 'text-red-400 bg-red-900/50 border border-red-700',
    fixed: 'text-green-400 bg-green-900/50 border border-green-700',
    neutral: 'text-slate-400 bg-slate-800/50 border border-slate-700',
  };

  return (
    <div className="code-viewer">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${variantHeader[variant]}`}>
        <div className="flex items-center gap-3">
          {variant === 'vulnerable' && <AlertTriangle size={14} className="text-red-400" />}
          <div className="flex gap-1.5">
            <span className="terminal-dot bg-[#ff5f57]" />
            <span className="terminal-dot bg-[#febc2e]" />
            <span className="terminal-dot bg-[#28c840]" />
          </div>
          {title && <span className="text-xs text-slate-400 ml-2 font-mono">{title}</span>}
          {language && (
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wide ${variantBadge[variant]}`}>
              {language}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-white/10"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code lines */}
      <div className="py-3 overflow-x-auto">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isHighlighted = highlightLine === lineNum;
          return (
            <div key={idx} className={`code-line ${isHighlighted ? 'highlighted' : ''}`}>
              {showLineNumbers && (
                <span className="code-line-number">{lineNum}</span>
              )}
              {isHighlighted && (
                <span className="flex-shrink-0 px-2 text-red-400">
                  <AlertTriangle size={11} />
                </span>
              )}
              <span className="code-line-content">{line || ' '}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
