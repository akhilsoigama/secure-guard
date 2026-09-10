import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { Finding, SecurityScore } from '@secureguard/shared';
import { ShieldAlert, CheckCircle, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { FindingDetails } from '../components/FindingDetails';

export function ScanReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState<SecurityScore | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  useEffect(() => {
    if (!id) return;
    
    Promise.all([
      apiClient.getScore(id),
      apiClient.getFindings(id)
    ])
    .then(([s, f]) => {
      setScore(s);
      setFindings(f);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      navigate('/');
    });
  }, [id, navigate]);

  if (loading) {
     return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-500 animate-pulse">Loading Report...</div>;
  }

  const filteredFindings = filter ? findings.filter(f => f.severity === filter) : findings;
  
  const getSeverityIcon = (sev: string) => {
    switch (sev) {
       case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-red-500" />;
       case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
       case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
       case 'LOW': return <Info className="w-5 h-5 text-blue-500" />;
       default: return <Info className="w-5 h-5 text-slate-500" />;
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
       case 'CRITICAL': return 'bg-red-500/10 text-red-500 border-red-500/20';
       case 'HIGH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
       case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
       case 'LOW': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
       default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Security Scan Report</h1>
            <p className="mt-1 text-sm text-slate-400">Scan ID: {id}</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-8 shadow-xl shadow-black/50">
             <div>
                <div className="text-sm font-medium text-slate-400 mb-1">Security Score</div>
                <div className="flex items-baseline gap-2">
                   <span className={`text-4xl font-extrabold ${score!.score < 50 ? 'text-red-500' : score!.score < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {score!.score}
                   </span>
                   <span className="text-slate-500 font-medium">/ 100</span>
                </div>
             </div>
             <div className="h-12 w-px bg-slate-800"></div>
             <div className="flex gap-4">
                {Object.entries(score!.breakdown).map(([sev, count]) => (
                   count > 0 && (
                      <div key={sev} className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform" onClick={() => setFilter(filter === sev ? null : sev)}>
                         <span className={`text-sm font-bold ${getSeverityColor(sev).split(' ')[1]}`}>{count}</span>
                         <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{sev}</span>
                      </div>
                   )
                ))}
             </div>
          </div>
        </div>

        {/* Findings List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
             <h2 className="text-lg font-semibold text-white">Detected Vulnerabilities</h2>
             {filter && (
                <button onClick={() => setFilter(null)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors font-medium">
                   Clear Filter ({filter})
                </button>
             )}
          </div>
          
          <div className="divide-y divide-slate-800/50">
             {filteredFindings.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                   <CheckCircle className="w-16 h-16 text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
                   <h3 className="text-xl font-semibold text-white">All clear!</h3>
                   <p className="text-slate-400 mt-2">No vulnerabilities found matching this criteria.</p>
                </div>
             ) : (
                filteredFindings.map((finding) => (
                   <div 
                      key={finding.id} 
                      onClick={() => setSelectedFinding(finding)}
                      className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors group flex items-start gap-4"
                   >
                      <div className="mt-1">
                         {getSeverityIcon(finding.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-3 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${getSeverityColor(finding.severity)}`}>
                               {finding.severity}
                            </span>
                            <span className="font-semibold text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                               {finding.title}
                            </span>
                         </div>
                         <div className="text-sm text-slate-500 truncate font-mono">
                            {finding.file}:{finding.line}
                         </div>
                      </div>
                      <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                   </div>
                ))
             )}
          </div>
        </div>

      </div>

      {selectedFinding && (
         <FindingDetails 
            finding={selectedFinding} 
            onClose={() => setSelectedFinding(null)} 
            onUpdate={(updated) => {
               setSelectedFinding(updated);
               setFindings(findings.map(f => f.id === updated.id ? updated : f));
            }}
         />
      )}
    </div>
  );
}
