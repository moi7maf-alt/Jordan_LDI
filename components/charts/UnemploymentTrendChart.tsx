import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { UnemploymentDataPoint } from '../../types';

interface UnemploymentTrendChartProps {
  data: UnemploymentDataPoint[];
  height?: number;
}

const UnemploymentTrendChart: React.FC<UnemploymentTrendChartProps> = ({ data, height = 300 }) => {
  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} unit="%" tick={{ fontSize: 12, fill: '#333333' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: '#4b5563',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            cursor={{ stroke: 'rgba(75, 85, 99, 0.4)' }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'المعدل']}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            name="معدل البطالة" 
            stroke="#fca5a5" 
            strokeWidth={3} 
            dot={{ r: 5 }} 
            activeDot={{ r: 7 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UnemploymentTrendChart;
