import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { usePuffSessions } from '@/hooks/usePuffSessions';

const EarningsChart = () => {
  const { sessions } = usePuffSessions();
  const [period, setPeriod] = useState<'7D' | '30D' | 'ALL'>('7D');

  // Process sessions data for chart
  const getChartData = () => {
    if (!sessions.length) return [];

    const now = new Date();
    const periodDays = period === '7D' ? 7 : period === '30D' ? 30 : 365;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Filter sessions based on period
    const filteredSessions = sessions.filter(
      session => new Date(session.created_at) >= startDate
    );

    // Group sessions by day
    const dailyData = new Map();
    
    filteredSessions.forEach(session => {
      const date = new Date(session.created_at).toDateString();
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date: date,
          earnings: 0,
          puffs: 0,
          sessions: 0,
        });
      }
      
      const dayData = dailyData.get(date);
      dayData.earnings += session.rewards_earned || 0;
      dayData.puffs += session.puffs_count || 0;
      dayData.sessions += 1;
    });

    // Convert to array and sort by date
    return Array.from(dailyData.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        earnings: Number(item.earnings.toFixed(2)),
      }));
  };

  const chartData = getChartData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card-bg border border-card-border rounded-lg p-3">
          <p className="text-hero-text font-medium">{label}</p>
          <p className="text-button-green">
            Earnings: {payload[0].value} $PUFF
          </p>
          {payload[0].payload.puffs && (
            <p className="text-muted-text text-sm">
              Puffs: {payload[0].payload.puffs}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Period Selection */}
      <div className="flex gap-2">
        {(['7D', '30D', 'ALL'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--card-border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-text))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-text))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--button-green))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--button-green))', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--button-green))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-text">
            No data available for the selected period
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-card-border">
          <div className="text-center">
            <div className="text-sm text-muted-text">Total Earnings</div>
            <div className="text-lg font-semibold text-hero-text">
              {chartData.reduce((sum, day) => sum + day.earnings, 0).toFixed(2)} $PUFF
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-text">Total Puffs</div>
            <div className="text-lg font-semibold text-hero-text">
              {chartData.reduce((sum, day) => sum + day.puffs, 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-text">Active Days</div>
            <div className="text-lg font-semibold text-hero-text">
              {chartData.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { EarningsChart };