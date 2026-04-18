import React from 'react';

interface PartDistributionChartProps {
  partCounts: Record<string, number>;
  isLoading: boolean;
}

const PART_COLORS: Record<string, string> = {
  'Part-A': '#38bdf8',
  'Part-B': '#a78bfa',
  'General': '#4ecdc4',
};

export default function PartDistributionChart({ partCounts, isLoading }: PartDistributionChartProps) {
  if (isLoading) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <div className="skeleton" style={{ height: 18, width: 160, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 100, width: '100%' }} />
      </div>
    );
  }

  const total = Object.values(partCounts).reduce((a, b) => a + b, 0);
  const entries = Object.entries(partCounts);

  if (total === 0) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Part Distribution</div>
        <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13, padding: '20px 0' }}>No data yet</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Part Distribution</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>Questions split by exam section</div>

      {/* Segmented bar */}
      <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', marginBottom: 16, gap: 2 }}>
        {entries.map(([part, count]) => (
          <div
            key={part}
            style={{ flex: count, background: PART_COLORS[part] || '#9ba3b8', transition: 'flex 0.5s ease' }}
            title={`${part}: ${count}`}
          />
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map(([part, count]) => (
          <div key={part} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: PART_COLORS[part] || '#9ba3b8', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1, fontWeight: 500 }}>{part}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{count} qs</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: PART_COLORS[part] || '#9ba3b8', minWidth: 40, textAlign: 'right' }}>
              {Math.round(count / total * 100)}%
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Total questions</span>
        <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>{total}</span>
      </div>
    </div>
  );
}
