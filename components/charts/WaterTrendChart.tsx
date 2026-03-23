import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WaterDataPoint } from '../../types';

interface WaterTrendChartProps {
  data: WaterDataPoint[];
}

const WaterTrendChart: React.FC<WaterTrendChartProps> = ({ data }) => {
  return (
    <>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">حصّة الفرد من المياه (م³/سنوياً)</h4>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#333333' }} />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 12, fill: '#333333' }} />
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
              dataKey="per_capita_supply" 
              name="حصّة الفرد" 
              stroke="#7dd3fc" 
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

export default WaterTrendChart;
