import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Shield, Play, Loader2, Activity, FileLock2, ServerCrash, CheckCircle2, History as HistoryIcon } from 'lucide-react';

export function Dashboard() {
  const [path, setPath] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ message: '', percent: 0 });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!path.trim()) {
      setError('Please enter a project path');
      return;
    }

    try {
      setIsScanning(true);
      const scan = await apiClient.createScan(path, true);
      setScanId(scan.id);
    } catch (err: any) {
      setError(err.message || 'Failed to start scan');
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (!scanId || !isScanning) return;

    const interval = setInterval(async () => {
      try {
        const scan = await apiClient.getScan(scanId);
        if (scan.progress) {
          setProgress(scan.progress);
        }
        if (scan.status === 'completed') {
          clearInterval(interval);
          setIsScanning(false);
          navigate(`/report/${scanId}`);
        } else if (scan.status === 'failed') {
          clearInterval(interval);
          setIsScanning(false);
          setError('Scan failed: ' + (scan.progress?.message || 'Internal error'));
        }
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scanId, isScanning, navigate]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Security Dashboard</h1>
          <p className="mt-1 text-slate-400">Overview of your application security posture</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-500/10 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Scans</p>
            <p className="text-2xl font-bold text-white mt-1">1,248</p>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <FileLock2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Critical Issues</p>
            <p className="text-2xl font-bold text-white mt-1">12</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-yellow-500/10 rounded-xl">
            <ServerCrash className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">High Issues</p>
            <p className="text-2xl font-bold text-white mt-1">45</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Resolved</p>
            <p className="text-2xl font-bold text-white mt-1">892</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* New Scan Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl shadow-black/20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-indigo-500" />
            <h2 className="text-xl font-semibold text-white">Start New Scan</h2>
          </div>
          <p className="text-slate-400 text-sm mb-6">Enter the absolute path to your project directory to initiate a comprehensive AI-powered security analysis.</p>

          <form className="space-y-6" onSubmit={handleScan}>
            <div>
              <label htmlFor="path" className="block text-sm font-medium text-slate-300 mb-2">Project Path</label>
              <input
                id="path"
                name="path"
                type="text"
                required
                disabled={isScanning}
                className="block w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                placeholder="/absolute/path/to/project"
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </div>
            
            {error && <div className="text-red-400 text-sm font-medium bg-red-950/50 p-3 rounded-xl border border-red-900/50 flex items-center gap-2"><ServerCrash className="w-4 h-4"/> {error}</div>}

            <button
              type="submit"
              disabled={isScanning}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-indigo-500/25"
            >
              {isScanning ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>{progress.message || 'Scanning...'} {progress.percent}%</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Run Security Analysis</span>
                </span>
              )}
            </button>
            
            {isScanning && (
               <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-4">
                  <div 
                     className="bg-indigo-500 h-2 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                     style={{ width: `${progress.percent}%` }}
                  ></div>
               </div>
            )}
          </form>
        </div>

        {/* Recent Scans Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/50">
             <div className="text-center p-6">
                <HistoryIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-slate-300 font-medium mb-1">No recent scans</h3>
                <p className="text-sm text-slate-500">Run a new scan to see your history here.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
