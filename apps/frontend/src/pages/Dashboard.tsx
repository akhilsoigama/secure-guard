import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, AlertTriangle, Package, KeyRound, ArrowRight, RefreshCw, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/ui/StatCard';
import { SecurityScoreRing } from '../components/ui/SecurityScoreRing';
import { SecurityTrendChart } from '../components/charts/SecurityTrendChart';
import { VulnDistributionChart } from '../components/charts/VulnDistributionChart';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { mockScanTrend } from '../data/mockScanHistory';
import { mockFindings } from '../data/mockFindings';

export function Dashboard() {
  const { securityScore, fixedFindings } = useApp();
  const navigate = useNavigate();

  const topFindings = mockFindings.filter(f => !fixedFindings.has(f.id)).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">Understand your project's security posture at a glance.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate('/scan')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={15} />
            Run New Scan
          </button>
        </div>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Critical Issues"
          value={2}
          icon={<AlertCircle size={20} className="text-red-500" />}
          color="critical"
          onClick={() => navigate('/findings')}
          subtitle="Requires immediate action"
        />
        <StatCard
          title="High Issues"
          value={3}
          icon={<AlertTriangle size={20} className="text-orange-500" />}
          color="high"
          onClick={() => navigate('/findings')}
          subtitle="Fix before production"
        />
        <StatCard
          title="Medium Issues"
          value={2}
          icon={<Info size={20} className="text-amber-500" />}
          color="medium"
          onClick={() => navigate('/findings')}
          subtitle="Plan remediation"
        />
        <StatCard
          title="Low Issues"
          value={1}
          icon={<Shield size={20} className="text-blue-500" />}
          color="low"
          onClick={() => navigate('/findings')}
          subtitle="Informational"
        />
      </div>

      {/* Second row: score + trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Score */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center gap-4">
          <div className="w-full flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Security Score</h2>
            <button
              type="button"
              onClick={() => navigate('/security-score')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Details <ArrowRight size={12} />
            </button>
          </div>
          <SecurityScoreRing score={securityScore.total} size={180} />
          <div className="w-full grid grid-cols-2 gap-2">
            {[
              { label: 'Code', value: securityScore.codeSecurity },
              { label: 'Dependencies', value: securityScore.dependencySecurity },
              { label: 'Secrets', value: securityScore.secretSecurity },
              { label: 'API Security', value: securityScore.apiSecurity },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <span className="text-xs text-slate-600">{item.label}</span>
                <span className={`text-sm font-bold ${item.value >= 70 ? 'text-green-600' : item.value >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">Security Score Trend</h2>
            <span className="text-xs text-slate-400">Last 5 scans</span>
          </div>
          <SecurityTrendChart data={mockScanTrend} />
        </div>
      </div>

      {/* Third row: distribution + dependencies + secrets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vulnerability Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Vulnerability Distribution</h2>
          <VulnDistributionChart />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { label: 'Critical', count: 2, color: 'bg-red-500' },
              { label: 'High', count: 3, color: 'bg-orange-500' },
              { label: 'Medium', count: 2, color: 'bg-amber-500' },
              { label: 'Low', count: 1, color: 'bg-blue-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-xs text-slate-600">{item.label}: <strong>{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Dependencies + Secrets */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Total Dependencies"
              value={127}
              subtitle="8 vulnerable · 14 outdated"
              icon={<Package size={20} className="text-blue-500" />}
              onClick={() => navigate('/dependencies')}
            />
            <StatCard
              title="Secrets Detected"
              value={3}
              subtitle="2 critical · 1 warning"
              icon={<KeyRound size={20} className="text-red-500" />}
              color="critical"
              onClick={() => navigate('/secrets')}
            />
          </div>

          {/* Top priority findings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-800">Top Priority Findings</h2>
              <button
                type="button"
                onClick={() => navigate('/findings')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {topFindings.map(finding => (
                <div
                  key={finding.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/findings/${finding.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/findings/${finding.id}`)}
                  aria-label={`View finding: ${finding.title}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SeverityBadge severity={finding.severity} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{finding.title}</p>
                      <p className="text-xs text-slate-500 font-mono truncate">{finding.file}:{finding.line}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); navigate(`/findings/${finding.id}`); }}
                    className="flex-shrink-0 text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Analyze
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
