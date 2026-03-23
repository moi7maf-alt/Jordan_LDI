import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface VisionProgressChartProps {
  name: string;
  currentValue: number;
  targetValue: number;
  maxValue: number; // The top of the scale for the chart
  color: string;
  unit: string;
}

const VisionProgressChart: React.FC<VisionProgressChartProps> = ({ name, currentValue, targetValue, maxValue, color, unit }) => {
  const data = [{ name, value: currentValue }];

  return (
    <div className="flex flex-col items-center text-center">
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="55%"
            innerRadius="75%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, maxValue]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'rgba(128, 128, 128, 0.15)' }}
              dataKey="value"
              angleAxisId={0}
              fill={color}
              cornerRadius={6}
            />
             <text
              x="50%"
              y="55%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-gray-900"
            >
              {currentValue.toFixed(1)}{unit}
            </text>
            <text
              x="50%"
              y="75%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-800"
            >
              Target: {targetValue}{unit}
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
       <p className="text-sm font-medium text-gray-900 -mt-4">{name}</p>
    </div>
  );
};

export default VisionProgressChart;