import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import type { SecurityScore } from '../../data/types';

interface SecurityRadarChartProps {
  score: SecurityScore;
}

export function SecurityRadarChart({ score }: SecurityRadarChartProps) {
  const data = [
    { subject: 'Code', value: score.codeSecurity, fullMark: 100 },
    { subject: 'Dependencies', value: score.dependencySecurity, fullMark: 100 },
    { subject: 'Secrets', value: score.secretSecurity, fullMark: 100 },
    { subject: 'API Security', value: score.apiSecurity, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          formatter={(val) => [`${val}/100`, 'Score']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
