import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ScanTrendPoint } from '../../data/types';

interface SecurityTrendChartProps {
  data: ScanTrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : score >= 40 ? '#ea580c' : '#dc2626';
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-bold" style={{ color }}>{score}<span className="text-xs text-slate-400 font-normal">/100</span></p>
      </div>
    );
  }
  return null;
};

export function SecurityTrendChart({ data }: SecurityTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={60} stroke="#d97706" strokeDasharray="4 4" label={{ value: 'Fair', position: 'right', fontSize: 10, fill: '#d97706' }} />
        <ReferenceLine y={80} stroke="#16a34a" strokeDasharray="4 4" label={{ value: 'Good', position: 'right', fontSize: 10, fill: '#16a34a' }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ fill: '#2563eb', r: 4, strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
