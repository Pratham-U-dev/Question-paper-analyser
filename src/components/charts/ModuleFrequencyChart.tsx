import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ModuleFrequencyChart({ data, isLoading }: { data: any, isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <Card className="col-span-1 lg:col-span-2 h-96 flex flex-col">
        <CardHeader>
          <div className="h-6 w-48 bg-white/10 animate-pulse rounded" />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map((ds: any, i: number) => ({
      ...ds,
      backgroundColor: i === 0 ? '#6C63FF' : '#00D4AA',
      borderRadius: 4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#94a3b8' }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-2 h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Module Frequency</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px]">
        <Bar data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}
