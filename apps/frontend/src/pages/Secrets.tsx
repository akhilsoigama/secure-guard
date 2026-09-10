import { useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, Eye, EyeOff, CheckCircle, FileCode } from 'lucide-react';
import { useState } from 'react';
import { mockSecrets } from '../data/mockSecrets';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatCard } from '../components/ui/StatCard';
import { useApp } from '../context/AppContext';

export function Secrets() {
  const navigate = useNavigate();
  const { showToast, markFixed, fixedFindings } = useApp();
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealedSecrets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const criticalCount = mockSecrets.filter(s => s.severity === 'critical').length;
  const openCount = mockSecrets.filter(s => !fixedFindings.has(s.id)).length;

  const handleViewFix = (_id: string) => {
    showToast({ type: 'info', title: 'Viewing fix guidance', message: 'See remediation page for details.' });
    navigate('/remediation');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Secret Detection</h1>
        <p className="text-slate-500 text-sm mt-1">Detect hardcoded credentials, API keys, and tokens in your codebase.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Secrets Found" value={mockSecrets.length} icon={<KeyRound size={20} className="text-red-500" />} color="critical" />
        <StatCard title="Critical" value={criticalCount} color="critical" icon={<AlertCircle size={20} className="text-red-500" />} />
        <StatCard title="Still Open" value={openCount} color="high" icon={<AlertCircle size={20} className="text-orange-500" />} subtitle="Requires remediation" />
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Immediate action required</p>
          <p className="text-xs text-red-700 mt-0.5">Exposed secrets must be revoked immediately, even if you fix the code. An attacker may have already copied them.</p>
        </div>
      </div>

      {/* Secret cards */}
      <div className="space-y-4">
        {mockSecrets.map(secret => {
          const isFixed = fixedFindings.has(secret.id);
          const isRevealed = revealedSecrets.has(secret.id);
          return (
            <div key={secret.id} className={`bg-white rounded-xl border p-5 shadow-sm ${isFixed ? 'border-green-200 opacity-70' : 'border-slate-200'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <SeverityBadge severity={secret.severity} />
                    {isFixed && (
                      <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-semibold">
                        <CheckCircle size={10} /> Remediated
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{secret.type}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileCode size={12} />
                    <span className="font-mono">{secret.file}</span>
                    <span>:{secret.line}</span>
                  </div>
                </div>
              </div>

              {/* Secret value display */}
              <div className="mb-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-mono">{secret.envKey}</span>
                  <button
                    type="button"
                    onClick={() => toggleReveal(secret.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label={isRevealed ? 'Hide secret value' : 'Reveal (masked) secret value'}
                  >
                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                    {isRevealed ? 'Hide' : 'Reveal'}
                  </button>
                </div>
                <p className="font-mono text-sm text-red-400">
                  {isRevealed ? secret.maskedValue : '••••••••••••••••••••••••••••••••'}
                </p>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-700 mb-4">{secret.description}</p>

              {/* Recommendation */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-xs font-semibold text-blue-800 mb-1">Recommended Fix</p>
                <p className="text-xs text-blue-700">{secret.recommendation}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!isFixed && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleViewFix(secret.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Fix
                    </button>
                    <button
                      type="button"
                      onClick={() => markFixed(secret.id)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <CheckCircle size={13} />
                      Mark Remediated
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
