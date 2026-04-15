import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BloomsChart({ data, isLoading }: { data: any, isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <Card className="col-span-1 h-96 flex flex-col">
        <CardHeader>
          <div className="h-6 w-48 bg-white/10 animate-pulse rounded" />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-8 border-white/10 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.colors,
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#94a3b8', padding: 20, usePointStyle: true },
      },
    },
    cutout: '70%',
  };

  return (
    <Card className="col-span-1 h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Bloom's Taxonomy</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <Doughnut data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}
