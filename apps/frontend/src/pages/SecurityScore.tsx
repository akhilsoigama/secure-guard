import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SecurityScoreRing } from '../components/ui/SecurityScoreRing';
import { SecurityRadarChart } from '../components/charts/SecurityRadarChart';
import { SecurityTrendChart } from '../components/charts/SecurityTrendChart';
import { mockScanTrend } from '../data/mockScanHistory';

interface ScoreBarProps {
  label: string;
  score: number;
  description: string;
}

function ScoreBar({ label, score, description }: ScoreBarProps) {
  const color = score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <span className="text-sm font-semibold text-slate-800">{label}</span>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <span className={`text-xl font-bold ${textColor}`}>{score}<span className="text-xs text-slate-400 font-normal">/100</span></span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function SecurityScore() {
  const { securityScore } = useApp();
  const navigate = useNavigate();

  const scoreBreakdown = [
    { label: 'Code Security', score: securityScore.codeSecurity, description: 'Static analysis, injection, auth patterns' },
    { label: 'Dependency Security', score: securityScore.dependencySecurity, description: 'CVE database, compromised packages' },
    { label: 'Secret Security', score: securityScore.secretSecurity, description: 'Hardcoded credentials, API keys, tokens' },
    { label: 'API Security', score: securityScore.apiSecurity, description: 'Endpoint authentication and authorization' },
  ];

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    if (score >= 60) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    if (score >= 40) return { label: 'Needs Attention', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    return { label: 'Critical Risk', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  };

  const risk = getRiskLevel(securityScore.total);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security Score</h1>
        <p className="text-slate-500 text-sm mt-1">A comprehensive view of your project's security posture.</p>
      </div>

      {/* Main score row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ring */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center gap-4 md:col-span-1">
          <SecurityScoreRing score={securityScore.total} size={200} />
          <div className={`w-full p-3 rounded-lg border text-center ${risk.bg}`}>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-0.5">Current Status</p>
            <p className={`text-base font-bold ${risk.color}`}>{risk.label}</p>
          </div>
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Your project contains multiple high-impact issues that should be fixed before production deployment.
          </p>
          <button
            type="button"
            onClick={() => navigate('/remediation')}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Fix Issues <ArrowRight size={14} />
          </button>
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-slate-400" />
            <h2 className="text-base font-semibold text-slate-800">Score Breakdown</h2>
          </div>
          <SecurityRadarChart score={securityScore} />
        </div>
      </div>

      {/* Score bars */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-5">Category Scores</h2>
        <div className="space-y-5">
          {scoreBreakdown.map(item => (
            <ScoreBar key={item.label} label={item.label} score={item.score} description={item.description} />
          ))}
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-slate-400" />
          <h2 className="text-base font-semibold text-slate-800">Score History</h2>
        </div>
        <SecurityTrendChart data={mockScanTrend} />
      </div>

      {/* Score explanation */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">How scores are calculated</h3>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold flex-shrink-0">80-100:</span>
            <span>Good — Production ready with minor improvements needed</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-500 font-bold flex-shrink-0">60-79:</span>
            <span>Fair — Address high/medium findings before production</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-orange-500 font-bold flex-shrink-0">40-59:</span>
            <span>Needs Attention — Critical or multiple high findings present</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-red-500 font-bold flex-shrink-0">0-39:</span>
            <span>Critical Risk — Do not deploy to production</span>
          </div>
        </div>
      </div>
    </div>
  );
}
