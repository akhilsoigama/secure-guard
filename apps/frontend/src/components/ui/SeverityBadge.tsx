import type { Severity } from '../../data/types';
import { AlertTriangle, AlertCircle, Info, ChevronDown } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity | 'safe';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const config: Record<string, { label: string; colorClass: string; icon: React.ElementType }> = {
  critical: { label: 'Critical', colorClass: 'severity-critical', icon: AlertCircle },
  high: { label: 'High', colorClass: 'severity-high', icon: AlertTriangle },
  medium: { label: 'Medium', colorClass: 'severity-medium', icon: AlertTriangle },
  low: { label: 'Low', colorClass: 'severity-low', icon: Info },
  safe: { label: 'Safe', colorClass: 'text-green-700 bg-green-50 border-green-200', icon: ChevronDown },
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export function SeverityBadge({ severity, size = 'md', showIcon = true, className = '' }: SeverityBadgeProps) {
  const { label, colorClass, icon: Icon } = config[severity] ?? config.low;
  return (
    <span
      className={`inline-flex items-center font-semibold rounded border uppercase tracking-wide ${colorClass} ${sizeClasses[size]} ${className}`}
      aria-label={`Severity: ${label}`}
    >
      {showIcon && <Icon size={size === 'lg' ? 14 : 11} strokeWidth={2.5} />}
      {label}
    </span>
  );
}
