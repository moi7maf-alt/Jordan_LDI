import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CrimeData2024 } from '../../types';

interface CrimeBreakdownChartProps {
  data: CrimeData2024[];
  key1: keyof CrimeData2024;
  key2: keyof CrimeData2024;
  name1: string;
  name2: string;
  color1: string;
  color2: string;
}

const CrimeBreakdownChart: React.FC<CrimeBreakdownChartProps> = ({ data, key1, key2, name1, name2, color1, color2 }) => {
    const sortedData = [...data].sort((a, b) => (((b[key1] as number) + (b[key2] as number)) - ((a[key1] as number) + (a[key2] as number))));
    
    return (
        <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
            <BarChart
            data={sortedData}
            margin={{
                top: 20,
                right: 30,
                left: 0,
                bottom: 100,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="region" interval={0} angle={-60} textAnchor="end" height={110} tick={{ fontSize: 12, fill: '#333333' }} />
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
            <Bar dataKey={key1} name={name1} stackId="a" fill={color1} />
            <Bar dataKey={key2} name={name2} stackId="a" fill={color2} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
};

export default CrimeBreakdownChart;
