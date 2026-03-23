import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface GenericBarChartProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
  unit: string;
  title: string;
  barColor: string;
}

const GenericBarChart: React.FC<GenericBarChartProps> = ({ data, dataKey, xAxisKey, unit, title, barColor }) => {
  return (
    <>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">{title}</h4>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4b5563',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }}
              formatter={(value: number) => `${value.toLocaleString()}${unit}`}
            />
            <Bar dataKey={dataKey} fill={barColor} radius={[4, 4, 0, 0]}>
              <LabelList dataKey={dataKey} position="top" formatter={(value: number) => value.toLocaleString()} style={{ fill: '#6b7280', fontSize: '12px' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default GenericBarChart;
