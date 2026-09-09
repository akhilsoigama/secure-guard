import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, GitBranch, FolderOpen, Terminal, FileCode, Package, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScanProgress } from '../components/ui/ScanProgress';
import { SecurityScoreRing } from '../components/ui/SecurityScoreRing';

const SCAN_STAGES = [
  'Project uploaded',
  'Project structure analyzed',
  'Source code analyzed',
  'Dependencies analyzed',
  'Secrets scanned',
  'Security rules executed',
  'Risk scoring',
  'AI explanation',
];

export function ScanProject() {
  const { scanStatus, scanProgress, scanStage, startScan, securityScore } = useApp();
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<'upload' | 'repo' | 'path'>('upload');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file.name);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file.name);
  };

  if (scanStatus === 'complete') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Scan Complete</h2>
          <p className="text-slate-500 mb-6">Your project has been analyzed. Here's a summary of the results.</p>

          <SecurityScoreRing score={securityScore.total} size={160} />

          <div className="grid grid-cols-4 gap-3 mt-6 mb-8">
            {[
              { label: 'Critical', count: 2, color: 'critical' as const },
              { label: 'High', count: 3, color: 'high' as const },
              { label: 'Medium', count: 2, color: 'medium' as const },
              { label: 'Low', count: 1, color: 'low' as const },
            ].map(item => (
              <div key={item.label} className={`p-3 rounded-xl border severity-${item.color}`}>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs font-semibold uppercase tracking-wide mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/findings')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <AlertCircle size={16} />
              View Findings
            </button>
            <button
              type="button"
              onClick={() => navigate('/security-score')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              <Shield size={16} />
              Security Score
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (scanStatus === 'scanning') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Scanning Your Project</h2>
              <p className="text-sm text-slate-500">Please wait while SecureGuard analyzes your code...</p>
            </div>
          </div>
          <ScanProgress
            progress={scanProgress}
            currentStage={scanStage}
            stages={SCAN_STAGES}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scan Your Project</h1>
        <p className="text-slate-500 mt-1 text-sm">Upload or connect your project to start a security scan.</p>
      </div>

      {/* Option tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1">
        {[
          { id: 'upload' as const, icon: Upload, label: 'Upload ZIP' },
          { id: 'repo' as const, icon: GitBranch, label: 'Connect Repository' },
          { id: 'path' as const, icon: FolderOpen, label: 'Project Path' },
        ].map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedOption(opt.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              selectedOption === opt.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <opt.icon size={15} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Main scan card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        {selectedOption === 'upload' && (
          <div>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                accept=".zip,.json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileInput}
                aria-label="Upload project file"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dragActive ? 'bg-blue-100' : 'bg-slate-100'}`}>
                  <Upload size={24} className={dragActive ? 'text-blue-500' : 'text-slate-400'} />
                </div>
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={16} />
                    <span className="font-medium">{selectedFile}</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-slate-800">Drop your project ZIP here</p>
                      <p className="text-sm text-slate-500 mt-1">or <span className="text-blue-600 font-medium">browse files</span></p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-center">
                      {['ZIP', 'Source Code', 'package.json', 'package-lock.json'].map(fmt => (
                        <span key={fmt} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded font-mono">{fmt}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedOption === 'repo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="repo-url">Repository URL</label>
              <input
                id="repo-url"
                type="url"
                defaultValue="https://github.com/user/my-project"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Repository URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="branch-name">Branch</label>
              <input
                id="branch-name"
                type="text"
                defaultValue="main"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Branch name"
              />
            </div>
          </div>
        )}

        {selectedOption === 'path' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="project-path">Local Project Path</label>
              <input
                id="project-path"
                type="text"
                defaultValue="./my-project"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Local project path"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={startScan}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-base"
          id="start-scan-button"
        >
          <Shield size={18} />
          Start Security Scan
        </button>
      </div>

      {/* CLI alternative */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Or use the CLI</span>
        </div>
        <div className="terminal rounded-lg overflow-hidden">
          <div className="terminal-bar">
            <span className="terminal-dot bg-[#ff5f57]" /><span className="terminal-dot bg-[#febc2e]" /><span className="terminal-dot bg-[#28c840]" />
          </div>
          <div className="terminal-body py-3">
            <span className="text-slate-500">$</span> <span className="text-cyan-400">npx secureguard scan</span> <span className="text-yellow-300">./my-project</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cli')}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
        >
          <FileCode size={14} />
          Try CLI Playground
        </button>
      </div>

      {/* Scan capabilities */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">What SecureGuard scans</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: FileCode, label: 'Static Code Analysis', desc: 'OWASP rules, injection patterns' },
            { icon: Package, label: 'Dependency Security', desc: 'CVE database, compromised packages' },
            { icon: '🔑', label: 'Secret Detection', desc: 'API keys, credentials, tokens' },
            { icon: '🌐', label: 'API Security', desc: 'Endpoint auth, IDOR, CORS' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
              <span className="text-lg flex-shrink-0">{typeof item.icon === 'string' ? item.icon : <item.icon size={18} className="text-blue-500" />}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
