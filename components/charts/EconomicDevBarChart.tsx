import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EconomicDevDataPoint } from '../../types';

interface EconomicDevBarChartProps {
  data: EconomicDevDataPoint[];
}

const EconomicDevBarChart: React.FC<EconomicDevBarChartProps> = ({ data }) => {

  const chartData = [
    { name: 'عدد القروض', '2023': data[0].loans_count, '2024': data[1].loans_count },
    { name: 'فرص التشغيل', '2023': data[0].employment_opportunities, '2024': data[1].employment_opportunities },
  ];

  return (
    <>
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">مؤشرات صندوق التنمية والتشغيل</h4>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#333333' }} />
            <YAxis tick={{ fontSize: 12, fill: '#333333' }} />
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
            <Bar dataKey="2023" fill="#c7d2fe" name="2023" radius={[4, 4, 0, 0]} />
            <Bar dataKey="2024" fill="#a5b4fc" name="2024" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default EconomicDevBarChart;
