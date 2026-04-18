import React from 'react';
import { FileText, HelpCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface KPICardsProps {
  totalPapers: number;
  totalQuestions: number;
  avgMarks: number;
  highRisk: number;
  isLoading: boolean;
}

const KPIS = [
  { key: 'totalPapers', label: 'Papers Analyzed', icon: FileText, color: '#38bdf8', colorDim: 'rgba(56,189,248,0.1)', colorBorder: 'rgba(56,189,248,0.2)' },
  { key: 'totalQuestions', label: 'Questions Extracted', icon: HelpCircle, color: '#e8b86d', colorDim: 'rgba(232,184,109,0.1)', colorBorder: 'rgba(232,184,109,0.2)' },
  { key: 'avgMarks', label: 'Avg Marks / Question', icon: TrendingUp, color: '#4ecdc4', colorDim: 'rgba(78,205,196,0.1)', colorBorder: 'rgba(78,205,196,0.2)' },
  { key: 'highRisk', label: 'Repeated Questions', icon: AlertTriangle, color: '#f87171', colorDim: 'rgba(248,113,113,0.1)', colorBorder: 'rgba(248,113,113,0.2)' },
];

export default function KPICards({ totalPapers, totalQuestions, avgMarks, highRisk, isLoading }: KPICardsProps) {
  const values: Record<string, number> = { totalPapers, totalQuestions, avgMarks, highRisk };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      {KPIS.map((kpi, i) => (
        <div
          key={kpi.key}
          className={`fade-up-${i + 1}`}
          style={{ background: 'var(--ink-2)', border: `1px solid ${kpi.colorBorder}`, borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${kpi.colorDim}, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: kpi.colorDim, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${kpi.colorBorder}` }}>
              <kpi.icon size={15} color={kpi.color} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500 }}>{kpi.label}</span>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ height: 32, width: 80 }} />
          ) : (
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: kpi.color, lineHeight: 1 }}>
              {values[kpi.key] ?? '—'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
