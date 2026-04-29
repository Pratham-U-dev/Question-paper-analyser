import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/src/context/AppContext';
import UploadSection from '@/src/components/UploadSection';
import KPICards from '@/src/components/KPICards';
import ModuleFrequencyChart from '@/src/components/charts/ModuleFrequencyChart';
import BloomsChart from '@/src/components/charts/BloomsChart';
import Heatmap from '@/src/components/charts/Heatmap';
import PartDistributionChart from '@/src/components/charts/PartDistributionChart';
import QuestionBank from '@/src/components/QuestionBank';
import PaperGenerator from '@/src/components/PaperGenerator';
import { fetchPapers, fetchQuestionsWithPaper, computeAnalytics } from '@/src/api/supabase';
import type { Paper, Question } from '@/src/api/supabase';
import { RefreshCw, CalendarDays, BookOpen, GraduationCap } from 'lucide-react';

export default function LecturerDashboard() {
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

  useEffect(() => { 
    fetchData(); 

    // Listen to our custom event so we force-refresh even if the subjectCode didn't change
    const onUpload = () => {
      // Small delay to allow Supabase to fully index the fresh inserts
      setTimeout(() => {
        fetchData();
      }, 1500);
    };

    window.addEventListener('paper-uploaded', onUpload);
    return () => window.removeEventListener('paper-uploaded', onUpload);
  }, [fetchData]);

  const analytics = computeAnalytics(papers, questions);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Page header */}
      <div id="overview" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.01em' }}>
            Lecturer Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
            Analyze past papers, view question analytics, and generate balanced exam papers.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {lastRefreshed && (
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
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

      {/* Charts row 1 */}
      <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <ModuleFrequencyChart moduleCounts={analytics.moduleCounts} isLoading={isLoading} />
        <BloomsChart bloomsCounts={analytics.bloomsCounts} isLoading={isLoading} />
        <PartDistributionChart partCounts={analytics.partCounts} isLoading={isLoading} />
      </div>

      {/* Heatmap */}
      <div className="fade-up-4">
        <Heatmap questions={questions} papers={papers} isLoading={isLoading} />
      </div>

      {/* Recent papers strip */}
      {!isLoading && papers.length > 0 && (
        <div className="fade-up-5">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={13} color="var(--gold)" /> Recent Papers
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="custom-scrollbar">
            {papers.map(p => (
              <div key={p.id} style={{ flexShrink: 0, background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.examination_name || p.subject_name || 'Untitled'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {p.exam_year && <span style={{ fontSize: 10, background: 'var(--gold-dim)', color: 'var(--gold)', borderRadius: 100, padding: '1px 7px', display: 'flex', alignItems: 'center', gap: 3 }}><CalendarDays size={8} />{p.exam_year}</span>}
                  {p.paper_type && <span style={{ fontSize: 10, background: 'var(--ink-3)', color: 'var(--text-3)', borderRadius: 100, padding: '1px 7px', textTransform: 'capitalize' }}>{p.paper_type}</span>}
                  {p.maximum_marks && <span style={{ fontSize: 10, background: 'rgba(78,205,196,0.1)', color: '#4ecdc4', borderRadius: 100, padding: '1px 7px' }}>{p.maximum_marks}M</span>}
                </div>
                {p.institution_name && <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.institution_name}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Bank */}
      <div>
        <QuestionBank questions={questions} isLoading={isLoading} />
      </div>

      {/* Paper Generator */}
      <div>
        <PaperGenerator questions={questions} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
