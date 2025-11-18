import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistoricalBedTrendChartProps {
  data: { year: number; beds: number; }[];
  title: string;
}

const HistoricalBedTrendChart: React.FC<HistoricalBedTrendChartProps> = ({ data, title }) => {
  return (
    <>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">{title}</h4>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis domain={['dataMin - 50', 'dataMax + 50']} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4b5563',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
              cursor={{ stroke: 'rgba(75, 85, 99, 0.4)' }}
            />
            <Line 
              type="monotone" 
              dataKey="beds" 
              name="عدد الأسرّة" 
              stroke="#0ea5e9" 
              strokeWidth={3} 
              dot={{ r: 5 }} 
              activeDot={{ r: 7 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default HistoricalBedTrendChart;
