import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Finding, ScanStatus, SecurityScore, ToastMessage, Project } from '../data/types';
import { mockFindings } from '../data/mockFindings';
import { mockProjects } from '../data/mockProjects';

interface AppState {
  findings: Finding[];
  scanStatus: ScanStatus;
  scanProgress: number;
  scanStage: string;
  securityScore: SecurityScore;
  fixedFindings: Set<string>;
  currentProject: Project;
  toasts: ToastMessage[];
  isRescanned: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
}

interface AppContextValue extends AppState {
  startScan: () => void;
  markFixed: (findingId: string) => void;
  runRescan: () => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  setCurrentProject: (project: Project) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const defaultScore: SecurityScore = {
  total: 47,
  codeSecurity: 52,
  dependencySecurity: 41,
  secretSecurity: 35,
  apiSecurity: 48,
};

const rescanScore: SecurityScore = {
  total: 82,
  codeSecurity: 88,
  dependencySecurity: 78,
  secretSecurity: 91,
  apiSecurity: 85,
};

const AppContext = createContext<AppContextValue | null>(null);

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [findings, setFindings] = useState<Finding[]>(mockFindings);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [securityScore, setSecurityScore] = useState<SecurityScore>(defaultScore);
  const [fixedFindings, setFixedFindings] = useState<Set<string>>(new Set());
  const [currentProject, setCurrentProject] = useState<Project>(mockProjects[0]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRescanned, setIsRescanned] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sg_fixed_findings');
    if (stored) {
      setFixedFindings(new Set(JSON.parse(stored)));
    }
    const rescan = localStorage.getItem('sg_rescanned');
    if (rescan === 'true') {
      setIsRescanned(true);
      setSecurityScore(rescanScore);
    }
  }, []);

  const showToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const startScan = useCallback(() => {
    setScanStatus('scanning');
    setScanProgress(0);
    setScanStage(SCAN_STAGES[0]);

    let stage = 0;
    const stageInterval = setInterval(() => {
      stage += 1;
      if (stage < SCAN_STAGES.length) {
        setScanStage(SCAN_STAGES[stage]);
      }
    }, 1200);

    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(stageInterval);
          setScanStatus('complete');
          setScanStage('Scan complete');
          return 100;
        }
        return Math.min(prev + Math.random() * 8 + 2, 100);
      });
    }, 400);
  }, []);

  const markFixed = useCallback((findingId: string) => {
    setFixedFindings(prev => {
      const next = new Set(prev);
      next.add(findingId);
      localStorage.setItem('sg_fixed_findings', JSON.stringify([...next]));
      return next;
    });
    setFindings(prev =>
      prev.map(f => (f.id === findingId ? { ...f, status: 'fixed' as const } : f))
    );
    // Update security score slightly
    setSecurityScore(prev => ({
      ...prev,
      total: Math.min(prev.total + 5, 100),
      codeSecurity: Math.min(prev.codeSecurity + 6, 100),
    }));
    showToast({
      type: 'success',
      title: 'Finding marked as fixed',
      message: 'Run a re-scan to verify the fix.',
    });
  }, [showToast]);

  const runRescan = useCallback(() => {
    setScanStatus('scanning');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanStatus('complete');
          setSecurityScore(rescanScore);
          setIsRescanned(true);
          localStorage.setItem('sg_rescanned', 'true');
          showToast({
            type: 'success',
            title: 'Re-scan complete!',
            message: 'Security score improved to 82/100.',
          });
          return 100;
        }
        return Math.min(prev + Math.random() * 10 + 5, 100);
      });
    }, 300);
  }, [showToast]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider
      value={{
        findings,
        scanStatus,
        scanProgress,
        scanStage,
        securityScore,
        fixedFindings,
        currentProject,
        toasts,
        isRescanned,
        sidebarCollapsed,
        mobileSidebarOpen,
        startScan,
        markFixed,
        runRescan,
        showToast,
        dismissToast,
        setCurrentProject,
        toggleSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
