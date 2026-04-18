import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const BLOOM_COLORS = ['#63d688', '#38bdf8', '#e8b86d', '#a78bfa', '#f87171', '#fb923c'];
const BLOOM_NAMES = ['L1 Remember', 'L2 Understand', 'L3 Apply', 'L4 Analyze', 'L5 Evaluate', 'L6 Create'];

interface BloomsChartProps {
  bloomsCounts: Record<string, number>;
  isLoading: boolean;
}

export default function BloomsChart({ bloomsCounts, isLoading }: BloomsChartProps) {
  const labels = Object.keys(bloomsCounts).filter(k => bloomsCounts[k] > 0);
  const dataValues = labels.map(k => bloomsCounts[k]);
  const colors = labels.map(k => BLOOM_COLORS[parseInt(k.replace('L', '')) - 1]);
  const fullNames = labels.map(k => BLOOM_NAMES[parseInt(k.replace('L', '')) - 1]);

  if (isLoading) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', height: 340 }}>
        <div className="skeleton" style={{ height: 18, width: 160, marginBottom: 16 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <div className="skeleton" style={{ width: 180, height: 180, borderRadius: '50%' }} />
        </div>
      </div>
    );
  }

  const total = dataValues.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', height: 340, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Bloom's Taxonomy</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No data yet</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Bloom's Taxonomy Distribution</div>
      <div style={{ height: 200, position: 'relative' }}>
        <Doughnut
          data={{ labels: fullNames, datasets: [{ data: dataValues, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }] }}
          options={{
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: '#9ba3b8', font: { size: 11 }, boxWidth: 10, padding: 10, usePointStyle: true } } },
            cutout: '68%',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>{total}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>questions</div>
          </div>
        </div>
      </div>
      {/* Legend with % */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 16 }}>
        {labels.map((k, i) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i], flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</span>
            <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 600, marginLeft: 'auto' }}>{Math.round(dataValues[i] / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
