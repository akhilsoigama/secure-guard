import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockFindings } from '../data/mockFindings';
import { SeverityBadge } from '../components/ui/SeverityBadge';

interface RemediationItem {
  id: string;
  priority: number;
  title: string;
  file: string;
  whyItMatters: string;
  fix: string;
  effort: 'Low' | 'Medium' | 'High';
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  severity: 'critical' | 'high' | 'medium' | 'low';
}

const remediationQueue: RemediationItem[] = [
  {
    id: 'SG-SSRF-001',
    priority: 1,
    title: 'Fix Server-Side Request Forgery (SSRF)',
    file: 'src/routes/preview.js',
    whyItMatters: 'Attacker can access internal services and steal cloud credentials.',
    fix: 'Validate URL hostname against an allow-list, block private IP ranges.',
    effort: 'Low',
    impact: 'Critical',
    severity: 'critical',
  },
  {
    id: 'SG-MASS-002',
    priority: 2,
    title: 'Fix Mass Assignment Vulnerability',
    file: 'src/routes/users.js',
    whyItMatters: 'Any user can escalate to admin by sending role field in the request.',
    fix: 'Use Zod/Joi schema to allow only specific fields in update operation.',
    effort: 'Low',
    impact: 'Critical',
    severity: 'critical',
  },
  {
    id: 'dep-001',
    priority: 3,
    title: 'Update Compromised axios Package',
    file: 'package.json',
    whyItMatters: 'Malicious code injected in npm registry version 1.14.1.',
    fix: 'Run: npm install axios@1.7.4',
    effort: 'Low',
    impact: 'Critical',
    severity: 'critical',
  },
  {
    id: 'SG-IDOR-003',
    priority: 4,
    title: 'Fix IDOR in Invoice Endpoint',
    file: 'src/routes/invoices.js',
    whyItMatters: 'Any authenticated user can view any other user\'s invoices.',
    fix: 'Add userId: req.user.id filter to all resource queries.',
    effort: 'Low',
    impact: 'High',
    severity: 'high',
  },
  {
    id: 'sec-001',
    priority: 5,
    title: 'Remove Exposed Stripe Secret Key',
    file: '.env',
    whyItMatters: 'Live Stripe key exposed with NEXT_PUBLIC_ prefix — visible to browsers.',
    fix: 'Revoke key in Stripe dashboard. Remove NEXT_PUBLIC_ prefix. Move to server-only env.',
    effort: 'Low',
    impact: 'Critical',
    severity: 'critical',
  },
];

export function Remediation() {
  const { fixedFindings, runRescan } = useApp();
  const navigate = useNavigate();

  const handleStartFixing = (id: string) => {
    const finding = mockFindings.find(f => f.id === id);
    if (finding) navigate(`/findings/${id}`);
  };

  const completedCount = remediationQueue.filter(item => fixedFindings.has(item.id)).length;
  const totalCount = remediationQueue.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  const effortColor = { Low: 'text-green-600 bg-green-50', Medium: 'text-amber-600 bg-amber-50', High: 'text-red-600 bg-red-50' };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fix Security Issues</h1>
          <p className="text-slate-500 text-sm mt-1">Prioritized remediation queue — tackle the highest impact issues first.</p>
        </div>
        <button
          type="button"
          onClick={runRescan}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Re-scan to Verify
        </button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Remediation Progress</h2>
          <span className="text-sm font-bold text-slate-800">{completedCount}/{totalCount} fixed</span>
        </div>
        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">{progress}% complete — {totalCount - completedCount} issues remaining</p>
      </div>

      {/* Queue */}
      <div className="space-y-3">
        {remediationQueue.map((item) => {
          const isFixed = fixedFindings.has(item.id);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${isFixed ? 'border-green-200 opacity-70' : 'border-slate-200'}`}
            >
              <div className="flex items-start gap-4">
                {/* Priority number */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isFixed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                  {isFixed ? <CheckCircle size={16} /> : item.priority}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <SeverityBadge severity={item.severity} size="sm" />
                    {isFixed && (
                      <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-semibold">Fixed</span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">{item.file}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">{item.whyItMatters}</p>

                  {/* Fix hint */}
                  <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                    <Wrench size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 font-mono">{item.fix}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${effortColor[item.effort]}`}>
                      {item.effort} effort
                    </span>
                    <span className="text-xs text-slate-500">Impact: <strong>{item.impact}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  {!isFixed ? (
                    <button
                      type="button"
                      onClick={() => handleStartFixing(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Start Fixing <ArrowRight size={12} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">
                      <CheckCircle size={13} /> Done
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {completedCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <AlertCircle size={16} className="text-blue-500" />
          <p className="text-sm text-blue-800 flex-1">
            You've fixed {completedCount} issue{completedCount > 1 ? 's' : ''}. Run a re-scan to verify the fixes are working.
          </p>
          <button
            type="button"
            onClick={() => navigate('/verification')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            Verify Fixes <ArrowRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
