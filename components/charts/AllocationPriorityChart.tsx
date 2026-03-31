import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

interface AllocationData {
  name: string;
  value: number;
  color: string;
}

interface AllocationPriorityChartProps {
  data: AllocationData[];
}

const AllocationPriorityChart: React.FC<AllocationPriorityChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[400px] mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={180} 
            tick={(props: any) => {
              const { x, y, payload } = props;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={-10} y={0} dy={4} textAnchor="end" fill="#1e293b" fontSize={14} fontWeight={700}>
                    {payload.value}
                  </text>
                </g>
              );
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`${value}%`, 'الأولوية']}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={45}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList 
              dataKey="value" 
              position="right" 
              formatter={(value: number) => `${value}%`}
              style={{ fill: '#0f172a', fontSize: 16, fontWeight: 900 }}
              offset={15}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AllocationPriorityChart;
