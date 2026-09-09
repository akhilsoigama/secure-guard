import { useState } from 'react';
import { Globe, Shield, AlertCircle, Lock, Unlock, ChevronRight } from 'lucide-react';
import { mockApiEndpoints } from '../data/mockApiEndpoints';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatCard } from '../components/ui/StatCard';

const methodColors: Record<string, string> = {
  GET: 'text-green-700 bg-green-100 border-green-200',
  POST: 'text-blue-700 bg-blue-100 border-blue-200',
  PUT: 'text-amber-700 bg-amber-100 border-amber-200',
  DELETE: 'text-red-700 bg-red-100 border-red-200',
  PATCH: 'text-purple-700 bg-purple-100 border-purple-200',
};

const authDisplay: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  authenticated: { label: 'Authenticated', icon: Lock, color: 'text-green-600' },
  unauthenticated: { label: 'Unauthenticated', icon: Unlock, color: 'text-red-600' },
  api_key: { label: 'API Key', icon: Lock, color: 'text-blue-600' },
};

export function ApiSecurity() {
  const [filter, setFilter] = useState<'all' | 'open' | 'protected' | 'review'>('all');

  const filtered = mockApiEndpoints.filter(ep =>
    filter === 'all' ? true : ep.status === filter
  );

  const criticalCount = mockApiEndpoints.filter(e => e.severity === 'critical').length;
  const highCount = mockApiEndpoints.filter(e => e.severity === 'high').length;
  const protectedCount = mockApiEndpoints.filter(e => e.status === 'protected').length;

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Security</h1>
        <p className="text-slate-500 text-sm mt-1">Analyze your API endpoints for authentication gaps and authorization issues.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Endpoints" value={mockApiEndpoints.length} icon={<Globe size={20} className="text-blue-500" />} />
        <StatCard title="Critical" value={criticalCount} color="critical" icon={<AlertCircle size={20} className="text-red-500" />} />
        <StatCard title="High" value={highCount} color="high" icon={<AlertCircle size={20} className="text-orange-500" />} />
        <StatCard title="Protected" value={protectedCount} color="green" icon={<Shield size={20} className="text-green-500" />} subtitle={`${Math.round((protectedCount / mockApiEndpoints.length) * 100)}% of endpoints`} />
      </div>

      {/* Endpoint table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Filter tabs */}
        <div className="p-4 border-b border-slate-100 flex gap-2">
          {(['all', 'open', 'protected', 'review'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f} ({mockApiEndpoints.filter(e => f === 'all' || e.status === f).length})
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</div>
          <div className="col-span-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Endpoint</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Auth</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue</div>
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.map(ep => {
            const authInfo = authDisplay[ep.auth];
            const AuthIcon = authInfo.icon;
            return (
              <div key={ep.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-1">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded border font-mono ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                </div>
                <div className="col-span-4">
                  <code className="text-sm text-slate-800 font-mono">{ep.path}</code>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{ep.description}</p>
                </div>
                <div className="col-span-2">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${authInfo.color}`}>
                    <AuthIcon size={12} />
                    {authInfo.label}
                  </span>
                </div>
                <div className="col-span-2">
                  {ep.severity !== 'safe' ? (
                    <SeverityBadge severity={ep.severity} size="sm" />
                  ) : (
                    <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded uppercase">Safe</span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-700 line-clamp-2">{ep.issue || <span className="text-slate-400">No issues</span>}</p>
                </div>
                <div className="col-span-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold capitalize ${
                    ep.status === 'protected' ? 'bg-green-50 text-green-700 border-green-200' :
                    ep.status === 'open' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {ep.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Authorization note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Authentication alone is not sufficient. Always verify that authenticated users can only access resources they own (authorization). 
          Unauthenticated endpoints exposing sensitive operations are the most critical risk.
        </p>
      </div>
    </div>
  );
}
