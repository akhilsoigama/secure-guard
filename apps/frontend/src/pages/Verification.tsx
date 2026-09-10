import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, RefreshCw, ArrowRight, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SecurityScoreRing } from '../components/ui/SecurityScoreRing';
import { ScanProgress } from '../components/ui/ScanProgress';

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

interface VerificationResult {
  id: string;
  title: string;
  status: 'fixed' | 'still_vulnerable' | 'not_checked';
}

const verificationResults: VerificationResult[] = [
  { id: 'SG-SSRF-001', title: 'Server-Side Request Forgery (SSRF)', status: 'fixed' },
  { id: 'SG-MASS-002', title: 'Mass Assignment Vulnerability', status: 'fixed' },
  { id: 'sec-001', title: 'Exposed Stripe Secret Key', status: 'fixed' },
  { id: 'dep-001', title: 'Compromised axios@1.14.1', status: 'still_vulnerable' },
  { id: 'SG-IDOR-003', title: 'Insecure Direct Object Reference', status: 'not_checked' },
];

export function Verification() {
  const { scanStatus, scanProgress, scanStage, runRescan, isRescanned, securityScore } = useApp();
  const navigate = useNavigate();
  const [hasRun, setHasRun] = useState(isRescanned);

  const handleRunRescan = () => {
    runRescan();
    setHasRun(true);
  };

  if (scanStatus === 'scanning') {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <RefreshCw size={20} className="text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Re-scanning Project</h2>
              <p className="text-sm text-slate-500">Verifying your applied fixes...</p>
            </div>
          </div>
          <ScanProgress progress={scanProgress} currentStage={scanStage} stages={SCAN_STAGES} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Re-scan & Verify</h1>
        <p className="text-slate-500 text-sm mt-1">Confirm that your security fixes are working as intended.</p>
      </div>

      {/* Score comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-6 text-center">Security Score Comparison</h2>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {/* Original */}
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Original Scan</p>
            <SecurityScoreRing score={47} size={140} showStatus={false} />
            <p className="mt-2 text-sm text-orange-600 font-semibold">Needs Attention</p>
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
              <RefreshCw size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">Fix Applied</span>
            </div>
            <ArrowRight size={24} className="text-slate-400" />
            <span className={`text-sm font-bold ${isRescanned ? 'text-green-600' : 'text-slate-400'}`}>
              {isRescanned ? '+35 pts' : 'Pending'}
            </span>
          </div>

          {/* Current */}
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Current Scan</p>
            <SecurityScoreRing score={isRescanned ? securityScore.total : 47} size={140} showStatus={false} />
            <p className={`mt-2 text-sm font-semibold ${isRescanned ? 'text-green-600' : 'text-slate-400'}`}>
              {isRescanned ? 'Good' : 'Run Re-scan'}
            </p>
          </div>
        </div>
      </div>

      {/* Verification results */}
      {(hasRun || isRescanned) && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-fade-in">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-slate-400" />
            Verification Results
          </h2>
          <div className="space-y-3">
            {verificationResults.map(result => (
              <div key={result.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                result.status === 'fixed' ? 'bg-green-50 border-green-200' :
                result.status === 'still_vulnerable' ? 'bg-red-50 border-red-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                {result.status === 'fixed' ? (
                  <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                ) : result.status === 'still_vulnerable' ? (
                  <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                ) : (
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    result.status === 'fixed' ? 'text-green-800' :
                    result.status === 'still_vulnerable' ? 'text-red-800' :
                    'text-slate-600'
                  }`}>
                    {result.title}
                  </p>
                </div>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                  result.status === 'fixed' ? 'text-green-700 bg-green-100' :
                  result.status === 'still_vulnerable' ? 'text-red-700 bg-red-100' :
                  'text-slate-500 bg-slate-200'
                }`}>
                  {result.status === 'fixed' ? '✓ Fixed' : result.status === 'still_vulnerable' ? '⚠ Vulnerable' : 'Not Checked'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {!isRescanned ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <RefreshCw size={32} className="text-blue-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 mb-2">Ready to verify your fixes?</h3>
          <p className="text-sm text-slate-500 mb-4">Apply fixes first, then run a re-scan to confirm the vulnerabilities are resolved.</p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate('/remediation')}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Fix Issues First
            </button>
            <button
              type="button"
              onClick={handleRunRescan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={15} />
              Run Re-scan
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Re-scan Complete!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Your security score improved from 47 to {securityScore.total}. 
              3 of 5 issues are verified as fixed. Address the remaining dependency vulnerability to reach 90+.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
