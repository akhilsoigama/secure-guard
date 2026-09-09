import { useState } from 'react';
import { Search, ExternalLink, Package, AlertCircle } from 'lucide-react';
import { mockDependencies } from '../data/mockDependencies';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { StatCard } from '../components/ui/StatCard';
import { useApp } from '../context/AppContext';

export function Dependencies() {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'vulnerable' | 'outdated' | 'safe'>('all');

  const filtered = mockDependencies.filter(dep => {
    const matchesFilter = filter === 'all' ? true : dep.status === filter;
    const matchesSearch = !search ||
      dep.name.toLowerCase().includes(search.toLowerCase()) ||
      (dep.cve && dep.cve.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const vulnerableCount = mockDependencies.filter(d => d.status === 'vulnerable').length;
  const criticalCount = mockDependencies.filter(d => d.severity === 'critical').length;
  const outdatedCount = mockDependencies.filter(d => d.status === 'outdated').length;

  const handleFix = (name: string) => {
    showToast({ type: 'info', title: `Run: npm update ${name}`, message: 'Copy and run in your terminal.' });
  };

  const statusBadge = (status: string) => {
    if (status === 'vulnerable') return 'bg-red-100 text-red-700 border-red-200';
    if (status === 'outdated') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dependency Security</h1>
        <p className="text-slate-500 text-sm mt-1">Audit your project's third-party dependencies for known vulnerabilities.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Dependencies" value={mockDependencies.length} icon={<Package size={20} className="text-blue-500" />} />
        <StatCard title="Vulnerable" value={vulnerableCount} color="high" icon={<AlertCircle size={20} className="text-orange-500" />} />
        <StatCard title="Critical" value={criticalCount} color="critical" icon={<AlertCircle size={20} className="text-red-500" />} />
        <StatCard title="Outdated" value={outdatedCount} color="medium" subtitle="No active CVE" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search packages or CVEs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search dependencies"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'vulnerable', 'outdated', 'safe'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Package</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Version</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</div>
          <div className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue</div>
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</div>
          <div className="col-span-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filtered.map(dep => (
            <div key={dep.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-3">
                <p className="text-sm font-semibold text-slate-900 font-mono">{dep.name}</p>
                <p className="text-xs text-slate-500">{dep.license}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-mono text-slate-700">{dep.version}</span>
                {dep.fixVersion && (
                  <p className="text-xs text-green-600 mt-0.5">→ {dep.fixVersion}</p>
                )}
              </div>
              <div className="col-span-2">
                {dep.severity !== 'safe' ? (
                  <SeverityBadge severity={dep.severity} size="sm" />
                ) : (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded uppercase">Safe</span>
                )}
              </div>
              <div className="col-span-3">
                {dep.issue ? (
                  <div>
                    <p className="text-xs text-slate-700 line-clamp-2">{dep.issue}</p>
                    {dep.cve && (
                      <a
                        href={`https://nvd.nist.gov/vuln/detail/${dep.cve}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 mt-0.5 font-mono"
                      >
                        {dep.cve} <ExternalLink size={9} />
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">No known issues</span>
                )}
              </div>
              <div className="col-span-1">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold capitalize ${statusBadge(dep.status)}`}>
                  {dep.status}
                </span>
              </div>
              <div className="col-span-1">
                {dep.status !== 'safe' && (
                  <button
                    type="button"
                    onClick={() => handleFix(dep.name)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    Fix
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
