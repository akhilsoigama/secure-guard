import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, CheckCircle, FileCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { EmptyState } from '../components/ui/EmptyState';
import type { Severity, FindingStatus } from '../data/types';

type TabFilter = 'all' | Severity | 'fixed';

export function Findings() {
  const { findings, fixedFindings } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: { id: TabFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: findings.length },
    { id: 'critical', label: 'Critical', count: findings.filter(f => f.severity === 'critical').length },
    { id: 'high', label: 'High', count: findings.filter(f => f.severity === 'high').length },
    { id: 'medium', label: 'Medium', count: findings.filter(f => f.severity === 'medium').length },
    { id: 'low', label: 'Low', count: findings.filter(f => f.severity === 'low').length },
    { id: 'fixed', label: 'Fixed', count: fixedFindings.size },
  ];

  const filtered = findings.filter(f => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'fixed' ? fixedFindings.has(f.id) :
      f.severity === activeTab;
    const matchesSearch =
      !searchQuery ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const tabColors: Record<string, string> = {
    critical: 'text-red-600 border-red-500 bg-red-50',
    high: 'text-orange-600 border-orange-500 bg-orange-50',
    medium: 'text-amber-600 border-amber-500 bg-amber-50',
    low: 'text-blue-600 border-blue-500 bg-blue-50',
    fixed: 'text-green-600 border-green-500 bg-green-50',
    all: 'text-blue-600 border-blue-500 bg-blue-50',
  };

  const statusColor: Record<FindingStatus, string> = {
    open: 'text-red-600 bg-red-50',
    fixed: 'text-green-600 bg-green-50',
    ignored: 'text-slate-600 bg-slate-100',
    in_progress: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security Findings</h1>
          <p className="text-slate-500 text-sm mt-1">{findings.length} findings detected · {fixedFindings.size} fixed</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* Search + Tabs */}
      <div className="bg-white rounded-xl border border-slate-200">
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search by vulnerability type, file, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              aria-label="Search findings"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-100 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? `border-blue-500 text-blue-600`
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${activeTab === tab.id ? tabColors[tab.id] : 'text-slate-400 bg-slate-100'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Findings list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<CheckCircle size={32} />}
            title={searchQuery ? 'No findings match your search' : 'No findings in this category'}
            description={searchQuery ? 'Try a different search term or clear the filter.' : 'All clear in this severity level.'}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(finding => {
              const isFixed = fixedFindings.has(finding.id);
              return (
                <div
                  key={finding.id}
                  className={`flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer group ${isFixed ? 'opacity-60' : ''}`}
                  onClick={() => navigate(`/findings/${finding.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/findings/${finding.id}`)}
                  aria-label={`View finding: ${finding.title}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <SeverityBadge severity={finding.severity} size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <p className="font-semibold text-slate-900 text-sm">{finding.title}</p>
                      {isFixed && (
                        <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold border border-green-200">
                          <CheckCircle size={9} /> FIXED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2 line-clamp-2">{finding.risk}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FileCode size={11} />
                        <span className="font-mono">{finding.file}</span>
                        <span className="text-slate-400">:{finding.line}</span>
                      </span>
                      {finding.cwe && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono border border-slate-200">{finding.cwe}</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${statusColor[isFixed ? 'fixed' : finding.status]}`}>
                        {isFixed ? 'Fixed' : finding.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {finding.cvss && (
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        CVSS {finding.cvss}
                      </span>
                    )}
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
