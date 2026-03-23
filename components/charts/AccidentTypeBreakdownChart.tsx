import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrafficAccidentsData } from '../../types';

interface AccidentTypeBreakdownChartProps {
  data: TrafficAccidentsData[];
}

const AccidentTypeBreakdownChart: React.FC<AccidentTypeBreakdownChartProps> = ({ data }) => {
    const sortedData = [...data].sort((a, b) => b.total - a.total);
    
    return (
        <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <BarChart
            data={sortedData}
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
            <Bar dataKey="collision" name="صدم" stackId="a" fill="#93c5fd" />
            <Bar dataKey="run_over" name="دهس" stackId="a" fill="#fdba74" />
            <Bar dataKey="rollover" name="تدهور" stackId="a" fill="#fca5a5" />
            </BarChart>
        </ResponsiveContainer>
        </div>
    );
};

export default AccidentTypeBreakdownChart;
