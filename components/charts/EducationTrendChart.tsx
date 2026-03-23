import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EducationDataPoint } from '../../types';

interface EducationTrendChartProps {
  data: EducationDataPoint[];
}

const EducationTrendChart: React.FC<EducationTrendChartProps> = ({ data }) => {
  return (
    <>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
            <YAxis yAxisId="left" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#333333' }} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)} tick={{ fontSize: 12, fill: '#333333' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: '#4b5563',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
              cursor={{ stroke: 'rgba(75, 85, 99, 0.4)' }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line yAxisId="left" type="monotone" dataKey="students" name="الطلبة" stroke="#93c5fd" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="teachers" name="المعلمون" stroke="#6ee7b7" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default EducationTrendChart;
