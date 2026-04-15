import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import ReactWordcloud from 'react-wordcloud';

export default function WordCloudChart({ data, isLoading }: { data: any, isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <Card className="col-span-1 h-96 flex flex-col">
        <CardHeader>
          <div className="h-6 w-48 bg-white/10 animate-pulse rounded" />
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const options = {
    colors: ['#6C63FF', '#00D4AA', '#FF5C7A', '#FFAD4A', '#36D399'],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Inter, sans-serif',
    fontSizes: [14, 60] as [number, number],
    fontStyle: 'normal',
    fontWeight: 'bold',
    padding: 2,
    rotations: 2,
    rotationAngles: [0, 90] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'rectangular' as const,
    transitionDuration: 1000,
  };

  return (
    <Card className="col-span-1 h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Part A Word Cloud</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] overflow-hidden">
        <ReactWordcloud words={data} options={options} />
      </CardContent>
    </Card>
  );
}
