import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface ModuleFrequencyChartProps {
  moduleCounts: Record<string, number>;
  isLoading: boolean;
}

export default function ModuleFrequencyChart({ moduleCounts, isLoading }: ModuleFrequencyChartProps) {
  if (isLoading) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', height: 340 }}>
        <div className="skeleton" style={{ height: 18, width: 180, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: '80%', width: '100%' }} />
      </div>
    );
  }

  const entries = Object.entries(moduleCounts).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, '')) || 0;
    const numB = parseInt(b[0].replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  if (entries.length === 0) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', height: 340, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Module Frequency</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No data yet</div>
      </div>
    );
  }

  const labels = entries.map(([k]) => k);
  const values = entries.map(([, v]) => v);
  const maxVal = Math.max(...values);

  return (
    <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Questions per Module</div>
      <div style={{ height: 200 }}>
        <Bar
          data={{
            labels,
            datasets: [{
              label: 'Questions',
              data: values,
              backgroundColor: values.map(v => v === maxVal ? '#e8b86d' : 'rgba(78,205,196,0.6)'),
              borderRadius: 5,
              borderSkipped: false,
            }],
          }}
          options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} questions` } } },
            scales: {
              y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#5c6380', font: { size: 11 } } },
              x: { grid: { display: false }, ticks: { color: '#9ba3b8', font: { size: 11 } } },
            },
          }}
        />
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-3)' }}>
        Highest: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{labels[values.indexOf(maxVal)]}</span> with {maxVal} questions
      </div>
    </div>
  );
}
