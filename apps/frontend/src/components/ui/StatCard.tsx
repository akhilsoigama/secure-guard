import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'blue' | 'green';
  onClick?: () => void;
  className?: string;
}

const colorMap = {
  default: 'border-slate-200',
  critical: 'border-red-200 bg-red-50',
  high: 'border-orange-200 bg-orange-50',
  medium: 'border-amber-200 bg-amber-50',
  low: 'border-blue-200 bg-blue-50',
  blue: 'border-blue-200 bg-blue-50',
  green: 'border-green-200 bg-green-50',
};

const valueColorMap = {
  default: 'text-slate-900',
  critical: 'text-red-700',
  high: 'text-orange-700',
  medium: 'text-amber-700',
  low: 'text-blue-700',
  blue: 'text-blue-700',
  green: 'text-green-700',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'default',
  onClick,
  className = '',
}: StatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`bg-white rounded-xl border p-5 ${colorMap[color]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} animate-fade-in ${className}`}
      {...(Tag === 'button' ? { type: 'button' } : {})}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className={`text-3xl font-bold ${valueColorMap[color]}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-white/80">
            {icon}
          </div>
        )}
      </div>
    </Tag>
  );
}
