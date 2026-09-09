import { useNavigate } from 'react-router-dom';
import { History, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockScanHistory } from '../data/mockScanHistory';
import { StatCard } from '../components/ui/StatCard';
import { SeverityBadge } from '../components/ui/SeverityBadge';

const statusConfig = {
  needs_attention: { label: 'Needs Attention', color: 'text-red-600 bg-red-50 border-red-200', icon: TrendingDown },
  improved: { label: 'Improved', color: 'text-green-600 bg-green-50 border-green-200', icon: TrendingUp },
  good: { label: 'Good', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: TrendingUp },
  excellent: { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: TrendingUp },
};

export function ScanHistory() {
  const navigate = useNavigate();
  const totalScans = mockScanHistory.length;
  const latestScore = mockScanHistory[0].score;
  const avgScore = Math.round(mockScanHistory.reduce((s, r) => s + r.score, 0) / totalScans);

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scan History</h1>
        <p className="text-slate-500 text-sm mt-1">Review all previous security scans and track your improvement over time.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Scans" value={totalScans} icon={<History size={20} className="text-blue-500" />} />
        <StatCard title="Latest Score" value={`${latestScore}/100`} color={latestScore >= 70 ? 'green' : 'high'} />
        <StatCard title="Average Score" value={`${avgScore}/100`} subtitle="Across all scans" />
      </div>

      {/* Scan history table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Project</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</div>
          <div className="col-span-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Findings</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {mockScanHistory.map((scan, idx) => {
            const prevScore = idx < mockScanHistory.length - 1 ? mockScanHistory[idx + 1].score : null;
            const scoreDelta = prevScore !== null ? scan.score - prevScore : null;
            const status = statusConfig[scan.status];
            const StatusIcon = status.icon;
            const scoreColor = scan.score >= 80 ? 'text-green-600' : scan.score >= 60 ? 'text-amber-600' : scan.score >= 40 ? 'text-orange-600' : 'text-red-600';

            return (
              <div key={scan.id} className={`grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors ${idx === 0 ? 'bg-blue-50/50' : ''}`}>
                <div className="col-span-3">
                  {idx === 0 && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 mb-1 inline-block">LATEST</span>
                  )}
                  <p className="text-sm font-semibold text-slate-800">{scan.date}</p>
                  <p className="text-xs text-slate-500">{scan.project}</p>
                  <p className="text-xs text-slate-400">{scan.filesScanned} files · {scan.duration}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-black ${scoreColor}`}>{scan.score}</span>
                    {scoreDelta !== null && (
                      <span className={`text-xs font-semibold flex items-center gap-0.5 ${scoreDelta > 0 ? 'text-green-500' : scoreDelta < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        {scoreDelta > 0 ? <TrendingUp size={11} /> : scoreDelta < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                        {Math.abs(scoreDelta)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {scan.critical > 0 && <SeverityBadge severity="critical" size="sm" showIcon={false} />}
                    <span className="text-xs text-slate-600">
                      {scan.critical}C · {scan.high}H · {scan.medium}M · {scan.low}L
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border font-semibold ${status.color}`}>
                    <StatusIcon size={11} />
                    {status.label}
                  </span>
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => navigate('/findings')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    aria-label={`View scan from ${scan.date}`}
                  >
                    View <ChevronRight size={11} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement note */}
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <TrendingUp size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-green-800">
          <strong>Progress:</strong> Score improved from 31 to {latestScore} across 5 scans. 
          Fix remaining critical and high findings to reach 80+ (Good).
        </p>
      </div>
    </div>
  );
}
