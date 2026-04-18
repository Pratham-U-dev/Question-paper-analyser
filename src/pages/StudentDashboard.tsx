import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/src/context/AppContext';
import UploadSection from '@/src/components/UploadSection';
import KPICards from '@/src/components/KPICards';
import ModuleFrequencyChart from '@/src/components/charts/ModuleFrequencyChart';
import BloomsChart from '@/src/components/charts/BloomsChart';
import Heatmap from '@/src/components/charts/Heatmap';
import PartDistributionChart from '@/src/components/charts/PartDistributionChart';
import QuestionBank from '@/src/components/QuestionBank';
import { fetchPapers, fetchQuestionsWithPaper, computeAnalytics } from '@/src/api/supabase';
import type { Paper, Question } from '@/src/api/supabase';
import { RefreshCw, Star, TrendingUp, Target } from 'lucide-react';

export default function StudentDashboard() {
  const { subjectCode } = useAppContext();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [p, q] = await Promise.all([
        fetchPapers(subjectCode),
        fetchQuestionsWithPaper(subjectCode),
      ]);
      setPapers(p);
      setQuestions(q);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Supabase fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [subjectCode]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const analytics = computeAnalytics(papers, questions);

  // High-priority questions for students: appear in multiple papers OR high bloom levels
  const highPriority = questions.filter(q => (q.blooms_level || 0) >= 4 || q.marks && q.marks >= 10).slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div id="overview" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.01em' }}>
            Study Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Analyze past papers and identify high-priority topics for your exam preparation.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastRefreshed && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Updated {lastRefreshed.toLocaleTimeString()}</span>}
          <button
            onClick={fetchData} disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}
          >
            <RefreshCw size={12} style={{ animation: isLoading ? 'spin 0.8s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Upload */}
      <div className="fade-up-1">
        <UploadSection onUploadSuccess={fetchData} />
      </div>

      {/* KPIs */}
      <div className="fade-up-2">
        <KPICards
          totalPapers={analytics.totalPapers}
          totalQuestions={analytics.totalQuestions}
          avgMarks={analytics.avgMarks}
          highRisk={analytics.highRisk}
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        <ModuleFrequencyChart moduleCounts={analytics.moduleCounts} isLoading={isLoading} />
        <BloomsChart bloomsCounts={analytics.bloomsCounts} isLoading={isLoading} />
        <PartDistributionChart partCounts={analytics.partCounts} isLoading={isLoading} />
      </div>

      {/* Heatmap */}
      <div className="fade-up-4">
        <Heatmap questions={questions} papers={papers} isLoading={isLoading} />
      </div>

      {/* Study tips panel */}
      {!isLoading && questions.length > 0 && (
        <div className="fade-up-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            {
              icon: TrendingUp, color: '#e8b86d', colorDim: 'rgba(232,184,109,0.1)',
              title: 'Top Module',
              value: Object.entries(analytics.moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
              hint: 'Most questions asked from',
            },
            {
              icon: Target, color: '#a78bfa', colorDim: 'rgba(167,139,250,0.1)',
              title: 'Focus Bloom Level',
              value: (() => { const e = Object.entries(analytics.bloomsCounts).sort((a,b)=>b[1]-a[1])[0]; return e ? e[0] : '—'; })(),
              hint: 'Most tested cognitive level',
            },
            {
              icon: Star, color: '#f87171', colorDim: 'rgba(248,113,113,0.1)',
              title: 'Repeated Questions',
              value: String(analytics.highRisk),
              hint: 'Questions seen in multiple papers',
            },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, background: item.colorDim, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon size={15} color={item.color} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.hint}</div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: item.color, lineHeight: 1.2, marginTop: 2 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Bank */}
      <div>
        <QuestionBank questions={questions} isLoading={isLoading} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
