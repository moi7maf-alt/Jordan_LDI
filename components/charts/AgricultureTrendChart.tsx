import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgricultureDataPoint } from '../../types';

interface AgricultureTrendChartProps {
  data: AgricultureDataPoint[];
}

const AgricultureTrendChart: React.FC<AgricultureTrendChartProps> = ({ data }) => {
  return (
    <>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">المساحات المزروعة (دونم)</h4>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
            <YAxis tick={{ fontSize: 12, fill: '#333333' }} />
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
            <Line type="monotone" dataKey="fieldCrops" name="محاصيل حقلية" stroke="#6ee7b7" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="fruitTrees" name="أشجار مثمرة" stroke="#fcd34d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default AgricultureTrendChart;
