import { useApp } from '../../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X, XCircle } from 'lucide-react';
import type { ToastMessage } from '../../data/types';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-l-4 border-l-green-500 bg-white',
  error: 'border-l-4 border-l-red-500 bg-white',
  warning: 'border-l-4 border-l-amber-500 bg-white',
  info: 'border-l-4 border-l-blue-500 bg-white',
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

function Toast({ toast }: { toast: ToastMessage }) {
  const { dismissToast } = useApp();
  const Icon = icons[toast.type];
  return (
    <div className={`animate-toast flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg ${colors[toast.type]} max-w-sm w-full`}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="alert" aria-live="polite">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
