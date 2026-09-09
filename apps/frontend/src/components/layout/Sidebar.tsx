import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Search, History, Bug, Package,
  KeyRound, Globe, BarChart3, Wrench, CheckSquare, Terminal,
  Settings, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Scanning',
    items: [
      { to: '/scan', icon: Search, label: 'Scan Project' },
      { to: '/cli', icon: Terminal, label: 'CLI Playground' },
      { to: '/scan-history', icon: History, label: 'Scan History' },
    ],
  },
  {
    label: 'Security',
    items: [
      { to: '/findings', icon: Bug, label: 'Findings' },
      { to: '/dependencies', icon: Package, label: 'Dependencies' },
      { to: '/secrets', icon: KeyRound, label: 'Secrets' },
      { to: '/api-security', icon: Globe, label: 'API Security' },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { to: '/security-score', icon: BarChart3, label: 'Security Score' },
      { to: '/remediation', icon: Wrench, label: 'Remediation' },
      { to: '/verification', icon: CheckSquare, label: 'Verification' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, toggleMobileSidebar } = useApp();
  const location = useLocation();

  const collapsed = sidebarCollapsed;

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <nav
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
          <div className={`flex items-center gap-2.5 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-base whitespace-nowrap">SecureGuard</span>
            )}
          </div>
          {/* Mobile close */}
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="md:hidden text-white/60 hover:text-white p-1"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main nav */}
        <div className="flex-1 overflow-y-auto py-4 px-2">
          {/* Overview */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              } ${collapsed ? 'justify-center' : ''}`
            }
            aria-label="Dashboard overview"
          >
            <LayoutDashboard size={18} strokeWidth={1.75} className="flex-shrink-0" />
            {!collapsed && <span>Overview</span>}
          </NavLink>

          {/* Groups */}
          {navGroups.map(group => (
            <div key={group.label} className="mt-4">
              {!collapsed && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">
                  {group.label}
                </p>
              )}
              {collapsed && <div className="border-t border-white/8 my-2" />}
              {group.items.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-sm font-medium ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/8'
                    } ${collapsed ? 'justify-center' : ''}`}
                    aria-label={item.label}
                  >
                    <item.icon size={18} strokeWidth={1.75} className="flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 p-3">
          {!collapsed && (
            <div className="px-1 mb-2">
              <p className="text-xs font-semibold text-slate-400">SecureGuard MVP</p>
              <p className="text-[10px] text-slate-600">Developer Security Scanner</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/8 transition-colors text-sm"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        </div>
      </nav>
    </>
  );
}
