import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EconomicEmpowermentDataPoint } from '../../types';

interface EconomicEmpowermentChartProps {
  data: EconomicEmpowermentDataPoint[];
  height?: number;
}

const EconomicEmpowermentChart: React.FC<EconomicEmpowermentChartProps> = ({ data, height = 250 }) => {
  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
          <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 12, fill: '#333333' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: '#4b5563',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            cursor={{ stroke: 'rgba(75, 85, 99, 0.4)' }}
            formatter={(value: number) => `${value.toFixed(1)}%`}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line type="monotone" dataKey="female_insured" name="نسبة الإناث" stroke="#c4b5fd" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="male_insured" name="نسبة الذكور" stroke="#93c5fd" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EconomicEmpowermentChart;
