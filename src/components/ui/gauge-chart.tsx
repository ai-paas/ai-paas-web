import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

// 색상 설정
const COLORS = {
  red: {
    completed: '#DC4646',
    remaining: '#FAE5E5',
  },
  green: {
    completed: '#31AB17',
    remaining: '#DDFAD6',
  },
  yellow: {
    completed: '#F5AB00',
    remaining: '#FCF5CA',
  },
  blue: {
    completed: '#0066FF',
    remaining: '#E5F0FF',
  },
};

interface GaugeChartProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  value: number;
  color?: 'red' | 'blue' | 'green' | 'yellow';
  startAngle?: number;
  endAngle?: number;
}

export const GaugeChart = ({
  children,
  className,
  value,
  color = 'red',
  startAngle,
  endAngle,
  ...props
}: GaugeChartProps) => {
  const data = [
    { name: 'completed', value: value },
    { name: 'remaining', value: 100 - value },
  ];

  return (
    <div className={cn(`relative`, className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius="92%"
            outerRadius="100%"
            startAngle={startAngle}
            endAngle={endAngle}
            cornerRadius={72}
            dataKey="value"
            stroke="none"
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? COLORS[color].completed : COLORS[color].remaining}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {children}
    </div>
  );
};
