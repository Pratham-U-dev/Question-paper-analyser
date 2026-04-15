import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';

export default function Heatmap({ data, isLoading }: { data: any, isLoading: boolean }) {
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

  const { years, modules, matrix } = data;

  // Find max value for color scaling
  let maxVal = 0;
  matrix.forEach((row: number[]) => {
    row.forEach(val => {
      if (val > maxVal) maxVal = val;
    });
  });

  const getColor = (val: number) => {
    if (val === 0) return 'bg-slate-800/50';
    const intensity = Math.max(0.2, val / maxVal);
    return `bg-blue-500`;
  };

  return (
    <Card className="col-span-1 lg:col-span-2 h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Repetition Heatmap (Year vs Module)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="min-w-max">
          <div className="flex mb-2">
            <div className="w-20"></div>
            {modules.map((m: number) => (
              <div key={m} className="flex-1 text-center text-sm font-medium text-slate-400">
                Mod {m}
              </div>
            ))}
          </div>
          {years.map((year: number, yIdx: number) => (
            <div key={year} className="flex mb-2 items-center">
              <div className="w-20 text-sm font-medium text-slate-400">{year}</div>
              {matrix[yIdx].map((val: number, mIdx: number) => (
                <div key={`${yIdx}-${mIdx}`} className="flex-1 px-1">
                  <div
                    className={`h-12 rounded-md flex items-center justify-center text-white font-medium transition-all hover:scale-105 cursor-pointer ${getColor(val)}`}
                    style={{ opacity: val === 0 ? 1 : Math.max(0.3, val / maxVal) }}
                    title={`${val} questions in ${year} for Module ${modules[mIdx]}`}
                  >
                    {val > 0 ? val : ''}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
