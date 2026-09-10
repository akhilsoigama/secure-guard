import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RefreshCw, Copy, ExternalLink, AlertTriangle, Lightbulb, FileCode, Bug } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockFindings } from '../data/mockFindings';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { CodeViewer } from '../components/ui/CodeViewer';

export function FindingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { markFixed, fixedFindings, runRescan, showToast } = useApp();

  const finding = mockFindings.find(f => f.id === id);
  const isFixed = finding ? fixedFindings.has(finding.id) : false;

  if (!finding) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Bug size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Finding not found</h2>
        <button type="button" onClick={() => navigate('/findings')} className="mt-4 text-blue-600 hover:underline">
          ← Back to Findings
        </button>
      </div>
    );
  }

  const handleCopyFix = async () => {
    await navigator.clipboard.writeText(finding.fixCode);
    showToast({ type: 'success', title: 'Fix code copied to clipboard' });
  };

  const handleMarkFixed = () => {
    markFixed(finding.id);
  };

  const handleRescan = () => {
    runRescan();
    navigate('/verification');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/findings')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        aria-label="Back to findings list"
      >
        <ArrowLeft size={16} />
        Back to Findings
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <SeverityBadge severity={finding.severity} size="lg" />
              {isFixed && (
                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 font-semibold">
                  <CheckCircle size={12} /> Fixed
                </span>
              )}
              {finding.cwe && (
                <a
                  href={`https://cwe.mitre.org/data/definitions/${finding.cwe.split('-')[1]}.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 border border-blue-200 bg-blue-50 px-2 py-1 rounded"
                >
                  {finding.cwe} <ExternalLink size={10} />
                </a>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">{finding.title}</h1>
            <p className="text-sm text-slate-500">Finding ID: <code className="font-mono bg-slate-100 px-1 rounded">{finding.id}</code></p>
          </div>
          <div className="text-right flex-shrink-0">
            {finding.cvss && (
              <div className="inline-block text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Risk Score</p>
                <div className={`text-3xl font-black ${finding.cvss >= 9 ? 'text-red-600' : finding.cvss >= 7 ? 'text-orange-500' : 'text-amber-500'}`}>
                  {finding.cvss}
                  <span className="text-base text-slate-400 font-normal">/10</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">CVSS v3.1</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {!isFixed ? (
            <button
              type="button"
              onClick={handleMarkFixed}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              <CheckCircle size={15} />
              Mark as Fixed
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200">
              <CheckCircle size={15} />
              Marked as Fixed
            </div>
          )}
          <button
            type="button"
            onClick={handleCopyFix}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Copy size={15} />
            Copy Fix
          </button>
          <button
            type="button"
            onClick={handleRescan}
            className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <RefreshCw size={15} />
            Re-scan
          </button>
        </div>
      </div>

      {/* What happened */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileCode size={16} className="text-slate-400" />
          What happened?
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">{finding.description}</p>
      </section>

      {/* Vulnerable code */}
      <section>
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          Vulnerable Code
        </h2>
        <CodeViewer
          code={finding.vulnerableCode}
          title={finding.file}
          highlightLine={finding.vulnerableCodeHighlightLine}
          variant="vulnerable"
        />
        <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{finding.risk}</p>
        </div>
      </section>

      {/* Attack scenario */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="text-base font-bold text-amber-900 mb-2 flex items-center gap-2">
          <Bug size={16} className="text-amber-600" />
          Attack Scenario
        </h2>
        <p className="text-sm text-amber-800 leading-relaxed">{finding.attackScenario}</p>
      </section>

      {/* AI Explanation */}
      <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Lightbulb size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-blue-900">AI Security Explanation</h2>
            <p className="text-[11px] text-blue-600">AI analyzes this confirmed finding only. Detection is performed by static analysis rules.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-blue-800 mb-1.5">What is wrong?</h3>
            <p className="text-sm text-blue-900 leading-relaxed">{finding.aiExplanation.whatIsWrong}</p>
          </div>
          <div className="border-t border-blue-200 pt-4">
            <h3 className="text-sm font-bold text-blue-800 mb-1.5">Why does it matter?</h3>
            <p className="text-sm text-blue-900 leading-relaxed">{finding.aiExplanation.whyItMatters}</p>
          </div>
          <div className="border-t border-blue-200 pt-4">
            <h3 className="text-sm font-bold text-blue-800 mb-1.5">What should you do?</h3>
            <p className="text-sm text-blue-900 leading-relaxed">{finding.aiExplanation.whatToDo}</p>
          </div>
        </div>
      </section>

      {/* Recommended fix */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Recommended Fix
          </h2>
          <button
            type="button"
            onClick={handleCopyFix}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Copy size={12} />
            Copy fix
          </button>
        </div>
        <CodeViewer
          code={finding.fixCode}
          title={`${finding.file} (fixed)`}
          variant="fixed"
        />
      </section>

      {/* Tags */}
      {finding.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <span className="text-xs text-slate-400 font-medium">Tags:</span>
          {finding.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200 font-mono">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
