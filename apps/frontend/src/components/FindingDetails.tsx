import { useState } from 'react';
import type { Finding } from '@secureguard/shared';
import { X, Sparkles, AlertCircle, FileCode, ShieldAlert } from 'lucide-react';
import { apiClient } from '../api/client';

export function FindingDetails({ finding, onClose, onUpdate }: { finding: Finding, onClose: () => void, onUpdate: (f: Finding) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateAI = async () => {
    try {
      setLoading(true);
      setError('');
      const explanation = await apiClient.explainFinding(finding.id);
      onUpdate({ ...finding, aiExplanation: explanation, aiStatus: 'success' });
    } catch (e: any) {
      setError(e.message || 'Failed to generate explanation');
      onUpdate({ ...finding, aiStatus: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl max-h-full bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
          <div className="flex-1 pr-4">
             <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${finding.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : finding.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                   {finding.severity}
                </span>
                <span className="text-sm font-medium text-slate-400 font-mono">{finding.ruleId}</span>
             </div>
             <h2 className="text-2xl font-bold text-white leading-tight">{finding.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-900 custom-scrollbar">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                 <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <FileCode className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Location</span>
                 </div>
                 <div className="font-mono text-sm text-indigo-400 break-all bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {finding.file} <span className="text-slate-500">:{finding.line}</span>
                 </div>
              </div>

              {/* Vulnerable Code */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                 <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Vulnerable Code</span>
                 </div>
                 <pre className="font-mono text-sm text-red-400 bg-red-950/20 p-3 rounded-lg border border-red-900/30 overflow-x-auto">
                    {finding.codeSnippet}
                 </pre>
              </div>
           </div>

           {/* Deterministic Details */}
           <div className="space-y-6">
              <div>
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                 <p className="text-slate-300 leading-relaxed">{finding.description}</p>
              </div>
              <div>
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Risk</h3>
                 <p className="text-slate-300 leading-relaxed">{finding.risk}</p>
              </div>
              <div>
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Recommended Fix</h3>
                 <p className="text-slate-300 leading-relaxed">{finding.recommendation}</p>
              </div>
           </div>

           {/* AI Explanation Section */}
           <div className="mt-10 border-t border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                       <Sparkles className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white">AI Analysis</h3>
                       <p className="text-sm text-slate-400">Context-aware explanation and specific remediation</p>
                    </div>
                 </div>
                 
                 {!finding.aiExplanation && (
                    <button 
                       onClick={handleGenerateAI}
                       disabled={loading}
                       className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                    >
                       {loading ? (
                          <>
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Generating...
                          </>
                       ) : (
                          <>Generate Explanation</>
                       )}
                    </button>
                 )}
              </div>

              {error && (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <div>
                       <span className="font-semibold block mb-1">AI Request Failed</span>
                       {error}
                    </div>
                 </div>
              )}

              {finding.aiExplanation && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-6">
                       <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">What is wrong?</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{finding.aiExplanation.whatIsWrong}</p>
                       </div>
                       <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-2">Why it matters</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{finding.aiExplanation.whyItMatters}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-6">
                       <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-red-400 mb-2">Attacker Impact</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{finding.aiExplanation.attackerImpact}</p>
                       </div>
                       <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-2">Specific Recommendation</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{finding.aiExplanation.recommendation}</p>
                       </div>
                    </div>

                    <div className="md:col-span-2 bg-slate-950 p-5 rounded-xl border border-slate-800">
                       <h4 className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-3">Secure Code Example</h4>
                       <pre className="font-mono text-sm text-green-400 bg-green-950/20 p-4 rounded-lg border border-green-900/30 overflow-x-auto">
                          {finding.aiExplanation.secureCodeExample}
                       </pre>
                    </div>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
}
