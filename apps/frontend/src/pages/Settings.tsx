import { useState } from 'react';
import { Shield, Bell, Eye, RefreshCw, Palette, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ id, checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-slate-800 cursor-pointer">{label}</label>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}
        aria-label={`${label}: ${checked ? 'enabled' : 'disabled'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

interface SettingSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const sections: SettingSection[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'scanning', label: 'Scanning', icon: Shield },
  { id: 'ai', label: 'AI Explanation', icon: Eye },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export function Settings() {
  const { showToast } = useApp();
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General
    autoSaveFindings: true,
    shareAnonymousStats: false,
    // Scanning
    scanOnPush: true,
    includeTestFiles: false,
    scanDependencies: true,
    scanSecrets: true,
    maxFileSize: '10',
    // AI
    aiExplanations: true,
    explainCritical: true,
    explainHigh: true,
    explainMedium: false,
    autoRescan: false,
    showCodeSuggestions: true,
    // Notifications
    emailCritical: true,
    emailWeeklyReport: true,
    slackIntegration: false,
    // Appearance
    compactMode: false,
    showCVSS: true,
    showCWE: true,
  });

  const update = (key: keyof typeof settings) => (val: boolean) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    showToast({ type: 'success', title: 'Settings saved', message: 'Your preferences have been updated.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure SecureGuard to match your workflow.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="w-44 flex-shrink-0" aria-label="Settings navigation">
          <div className="space-y-0.5">
            {sections.map(section => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <section.icon size={15} />
                {section.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content panel */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
          {activeSection === 'general' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">General</h2>
              <p className="text-sm text-slate-500 mb-5">General SecureGuard preferences.</p>
              <div className="divide-y divide-slate-100">
                <Toggle id="auto-save" checked={settings.autoSaveFindings} onChange={update('autoSaveFindings')} label="Auto-save Findings" description="Automatically save finding status between sessions" />
                <Toggle id="share-stats" checked={settings.shareAnonymousStats} onChange={update('shareAnonymousStats')} label="Share Anonymous Statistics" description="Help improve SecureGuard by sharing anonymous usage data" />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="project-path-setting">Default Project Path</label>
                <input id="project-path-setting" type="text" defaultValue="./src" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {activeSection === 'scanning' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Scanning</h2>
              <p className="text-sm text-slate-500 mb-5">Configure what and how SecureGuard scans.</p>
              <div className="divide-y divide-slate-100">
                <Toggle id="scan-on-push" checked={settings.scanOnPush} onChange={update('scanOnPush')} label="Scan on Git Push" description="Automatically trigger a scan when you push code" />
                <Toggle id="include-tests" checked={settings.includeTestFiles} onChange={update('includeTestFiles')} label="Include Test Files" description="Also scan test files (may increase false positives)" />
                <Toggle id="scan-deps" checked={settings.scanDependencies} onChange={update('scanDependencies')} label="Dependency Scanning" description="Check all dependencies for known CVEs" />
                <Toggle id="scan-secrets" checked={settings.scanSecrets} onChange={update('scanSecrets')} label="Secret Detection" description="Detect hardcoded API keys and credentials" />
                <Toggle id="auto-rescan" checked={settings.autoRescan} onChange={update('autoRescan')} label="Automatic Re-scan" description="Re-scan after you mark findings as fixed" />
              </div>
            </div>
          )}

          {activeSection === 'ai' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">AI Explanation</h2>
              <p className="text-sm text-slate-500 mb-5">Control when and how AI-assisted explanations are shown.</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-xs text-blue-700"><strong>Note:</strong> AI explains confirmed findings only. Vulnerability detection is performed by static analysis rules, not AI.</p>
              </div>
              <div className="divide-y divide-slate-100">
                <Toggle id="ai-explain" checked={settings.aiExplanations} onChange={update('aiExplanations')} label="AI Explanations" description="Show AI-assisted explanations for findings" />
                <Toggle id="explain-critical" checked={settings.explainCritical} onChange={update('explainCritical')} label="Explain Critical Findings" description="Always generate explanations for critical severity" />
                <Toggle id="explain-high" checked={settings.explainHigh} onChange={update('explainHigh')} label="Explain High Findings" description="Generate explanations for high severity findings" />
                <Toggle id="explain-medium" checked={settings.explainMedium} onChange={update('explainMedium')} label="Explain Medium Findings" description="Generate explanations for medium severity findings" />
                <Toggle id="code-suggestions" checked={settings.showCodeSuggestions} onChange={update('showCodeSuggestions')} label="Show Code Suggestions" description="Display before/after code examples for each finding" />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Notifications</h2>
              <p className="text-sm text-slate-500 mb-5">Manage how and when you receive alerts.</p>
              <div className="divide-y divide-slate-100">
                <Toggle id="email-critical" checked={settings.emailCritical} onChange={update('emailCritical')} label="Email on Critical Findings" description="Receive an email when critical vulnerabilities are detected" />
                <Toggle id="weekly-report" checked={settings.emailWeeklyReport} onChange={update('emailWeeklyReport')} label="Weekly Security Report" description="Get a summary of your security posture every Monday" />
                <Toggle id="slack" checked={settings.slackIntegration} onChange={update('slackIntegration')} label="Slack Integration" description="Post findings to a Slack channel" />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="notify-email">Notification Email</label>
                <input id="notify-email" type="email" defaultValue="dev@example.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1">Appearance</h2>
              <p className="text-sm text-slate-500 mb-5">Customize how SecureGuard looks and displays information.</p>
              <div className="divide-y divide-slate-100">
                <Toggle id="compact-mode" checked={settings.compactMode} onChange={update('compactMode')} label="Compact Mode" description="Reduce spacing for higher information density" />
                <Toggle id="show-cvss" checked={settings.showCVSS} onChange={update('showCVSS')} label="Show CVSS Scores" description="Display CVSS severity scores alongside findings" />
                <Toggle id="show-cwe" checked={settings.showCWE} onChange={update('showCWE')} label="Show CWE References" description="Display CWE classification for each finding" />
              </div>
              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="theme-select">Theme</label>
                <select id="theme-select" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="light">Light (default)</option>
                  <option value="dark">Dark</option>
                  <option value="system">System preference</option>
                </select>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end mt-8 pt-5 border-t border-slate-100">
            <div className="flex gap-2">
              <button
                type="button"
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Reset to defaults
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={14} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
