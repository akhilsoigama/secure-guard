import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VulnData {
  name: string;
  count: number;
  color: string;
}

const data: VulnData[] = [
  { name: 'Critical', count: 2, color: '#dc2626' },
  { name: 'High', count: 3, color: '#ea580c' },
  { name: 'Medium', count: 2, color: '#d97706' },
  { name: 'Low', count: 1, color: '#2563eb' },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: VulnData }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
          {payload[0].value} <span className="text-xs text-slate-400 font-normal">findings</span>
        </p>
      </div>
    );
  }
  return null;
};

export function VulnDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
