import React from 'react';

interface HeatmapProps {
  questions: any[];
  papers: any[];
  isLoading: boolean;
}

export default function Heatmap({ questions, papers, isLoading }: HeatmapProps) {
  if (isLoading) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', height: 340 }}>
        <div className="skeleton" style={{ height: 18, width: 160, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: '80%', width: '100%' }} />
      </div>
    );
  }

  // Build heatmap: modules (rows) × bloom levels (cols)
  const modules = [...new Set(questions.map(q => q.module).filter(Boolean))].sort((a, b) => {
    const na = parseInt(a.replace(/\D/g, '')) || 0;
    const nb = parseInt(b.replace(/\D/g, '')) || 0;
    return na - nb;
  });
  const bloomLevels = [1, 2, 3, 4, 5, 6];
  const BLOOM_COLORS = ['#63d688', '#38bdf8', '#e8b86d', '#a78bfa', '#f87171', '#fb923c'];

  if (modules.length === 0) {
    return (
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', height: 260, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Module × Bloom's Heatmap</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No data yet</div>
      </div>
    );
  }

  // Count questions per [module][bloom]
  const grid: Record<string, Record<number, number>> = {};
  modules.forEach(m => { grid[m] = {}; bloomLevels.forEach(b => { grid[m][b] = 0; }); });
  questions.forEach(q => {
    if (q.module && q.blooms_level) {
      grid[q.module][q.blooms_level] = (grid[q.module][q.blooms_level] || 0) + 1;
    }
  });
  const maxCount = Math.max(1, ...modules.flatMap(m => bloomLevels.map(b => grid[m][b] || 0)));

  return (
    <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Module × Bloom's Heatmap</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 16 }}>Question count by module and cognitive level</div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 3 }}>
          <thead>
            <tr>
              <th style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'left', paddingBottom: 6, fontWeight: 500, width: 80 }}>Module</th>
              {bloomLevels.map(b => (
                <th key={b} style={{ fontSize: 10, color: BLOOM_COLORS[b - 1], textAlign: 'center', paddingBottom: 6, fontWeight: 600, width: 40 }}>L{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m}>
                <td style={{ fontSize: 11, color: 'var(--text-2)', paddingRight: 8, paddingBottom: 3, whiteSpace: 'nowrap' }}>{m}</td>
                {bloomLevels.map(b => {
                  const count = grid[m][b] || 0;
                  const intensity = count / maxCount;
                  const color = BLOOM_COLORS[b - 1];
                  return (
                    <td key={b} style={{ padding: 2 }}>
                      <div
                        title={`${m} × L${b}: ${count} questions`}
                        style={{
                          width: 36, height: 28, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: count === 0 ? 'var(--ink-3)' : `${color}${Math.round(intensity * 180 + 20).toString(16).padStart(2, '0')}`,
                          border: count === 0 ? '1px solid var(--border)' : `1px solid ${color}30`,
                          fontSize: 11, fontWeight: 600, color: count === 0 ? 'var(--text-3)' : '#fff',
                          cursor: 'default',
                          transition: 'transform 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      >
                        {count || '·'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
