
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import Card from '../ui/Card';
import { GovernorateData } from '../../types';
import { GOVERNORATE_COLORS } from '../../constants/colors';

interface GovernorateBarChartProps {
  data: GovernorateData[];
  dataKey: keyof GovernorateData;
  unit: string;
  title: string;
}

const GovernorateBarChart: React.FC<GovernorateBarChartProps> = ({ data, dataKey, unit, title }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#333333' }} />
            <YAxis tick={{ fontSize: 12, fill: '#333333' }} unit={unit} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4b5563',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(75, 85, 99, 0.2)' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey={dataKey} name={title.replace(/by Governorate/i, '').trim()} radius={[4, 4, 0, 0]}>
                <LabelList dataKey={dataKey} position="top" formatter={(value: number) => value.toFixed(1)} style={{ fill: '#1f2937', fontSize: '12px' }} dy={-4} />
                {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={GOVERNORATE_COLORS[entry.name]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default GovernorateBarChart;
