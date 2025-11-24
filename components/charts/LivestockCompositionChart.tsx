import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GovernorateData } from '../../types';

interface LivestockCompositionChartProps {
  data: (GovernorateData & { sheep: number, goats: number, cows: number })[];
}

const LivestockCompositionChart: React.FC<LivestockCompositionChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="name_ar" tick={{ fontSize: 12, fill: '#333333' }} />
          <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#333333' }} />
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
          <Bar dataKey="sheep" name="ضأن" stackId="a" fill="#fcd34d" radius={[4, 4, 0, 0]} />
          <Bar dataKey="goats" name="ماعز" stackId="a" fill="#6ee7b7" />
          <Bar dataKey="cows" name="أبقار" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LivestockCompositionChart;
