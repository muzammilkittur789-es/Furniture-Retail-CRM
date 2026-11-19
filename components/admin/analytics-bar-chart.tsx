'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatINR } from '@/lib/utils';

export interface DailyChartData {
  date: string;
  pipelineValue: number;
  closedValue: number;
}

interface AnalyticsBarChartProps {
  data: DailyChartData[];
}

export function AnalyticsBarChart({ data }: AnalyticsBarChartProps) {
  return (
    <div className="w-full h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.7} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'var(--font-outfit)', fontWeight: 500 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'var(--font-outfit)', fontWeight: 500 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
              padding: '12px 16px',
            }}
            formatter={(val: number) => [formatINR(val), '']}
            labelStyle={{
              fontWeight: 700,
              fontFamily: 'var(--font-outfit)',
              color: '#0F172A',
              marginBottom: '6px',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '24px', fontSize: '12px' }}
            formatter={(value) => (
              <span className="text-xs font-semibold text-slate-700 capitalize tracking-wide">
                {value === 'pipelineValue' ? '● Pending Pipeline' : '● Closed Deal Revenue'}
              </span>
            )}
          />
          {/* Pending Pipeline: Electric Indigo */}
          <Bar
            dataKey="pipelineValue"
            name="pipelineValue"
            fill="#6366F1"
            radius={[8, 8, 0, 0]}
            maxBarSize={44}
          />
          {/* Closed Revenue: Vibrant Emerald Mint */}
          <Bar
            dataKey="closedValue"
            name="closedValue"
            fill="#10B981"
            radius={[8, 8, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
