import { useLocation } from 'react-router-dom';
import { Bell, Search, ChevronDown, Menu, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { mockProjects } from '../../data/mockProjects';
import { useState } from 'react';

const routeLabels: Record<string, string[]> = {
  '/dashboard': ['Overview'],
  '/scan': ['Scanning', 'Scan Project'],
  '/findings': ['Security', 'Findings'],
  '/dependencies': ['Security', 'Dependencies'],
  '/secrets': ['Security', 'Secrets'],
  '/api-security': ['Security', 'API Security'],
  '/security-score': ['Analysis', 'Security Score'],
  '/remediation': ['Analysis', 'Remediation'],
  '/verification': ['Analysis', 'Verification'],
  '/scan-history': ['Scanning', 'Scan History'],
  '/cli': ['Scanning', 'CLI Playground'],
  '/settings': ['System', 'Settings'],
};

export function Header() {
  const location = useLocation();
  const { currentProject, setCurrentProject, toggleMobileSidebar } = useApp();
  const [projectOpen, setProjectOpen] = useState(false);

  const breadcrumbs = routeLabels[location.pathname] ?? ['SecureGuard'];
  const isFindingDetail = location.pathname.startsWith('/findings/');

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Left: burger + breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          <span className="text-slate-400">SecureGuard</span>
          {breadcrumbs.map((crumb, idx) => (
            <span key={crumb} className="flex items-center gap-1.5">
              <span className="text-slate-300">/</span>
              <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                {crumb}
              </span>
            </span>
          ))}
          {isFindingDetail && (
            <>
              <span className="text-slate-300">/</span>
              <span className="font-semibold text-slate-800">Detail</span>
            </>
          )}
        </nav>
      </div>

      {/* Right: search + project + notifications + avatar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 text-sm w-48">
          <Search size={14} />
          <span className="text-slate-400">Search...</span>
          <span className="ml-auto text-[10px] text-slate-400 border border-slate-300 rounded px-1">⌘K</span>
        </div>

        {/* Project selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProjectOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Select project"
            aria-expanded={projectOpen}
            aria-haspopup="listbox"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            <span className="max-w-[120px] truncate">{currentProject.name}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {projectOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 animate-scale-in"
              role="listbox"
              aria-label="Project list"
            >
              {mockProjects.map(project => (
                <button
                  key={project.id}
                  type="button"
                  role="option"
                  aria-selected={project.id === currentProject.id}
                  onClick={() => {
                    setCurrentProject(project);
                    setProjectOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left ${
                    project.id === currentProject.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{project.name}</p>
                    <p className="text-xs text-slate-500">{project.language} · Score: {project.score}</p>
                  </div>
                  {project.id === currentProject.id && (
                    <span className="text-blue-500 text-xs font-bold mt-0.5">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications — 2 unread"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" aria-hidden="true" />
        </button>

        {/* Avatar */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white"
          aria-label="User profile"
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
