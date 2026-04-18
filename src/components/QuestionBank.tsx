import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, BookOpen, Tag, Hash, Award, FileText } from 'lucide-react';
import type { Question } from '@/src/api/supabase';

interface QuestionBankProps {
  questions: Question[];
  isLoading: boolean;
}

const BLOOM_LABELS: Record<number, string> = { 1: 'Remember', 2: 'Understand', 3: 'Apply', 4: 'Analyze', 5: 'Evaluate', 6: 'Create' };
const PART_ORDER: Record<string, number> = { 'Part-A': 0, 'General': 1, 'Part-B': 2 };

function getPartStyle(part: string | null): React.CSSProperties {
  if (!part || part === 'General') return { background: 'rgba(78,205,196,0.1)', color: '#4ecdc4', border: '1px solid rgba(78,205,196,0.25)' };
  if (part === 'Part-A') return { background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)' };
  return { background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)' };
}

function QuestionCard({ q, idx }: { q: Question; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const bloom = q.blooms_level;
  const bloomClass = bloom ? `bloom-${bloom}` : '';

  return (
    <div
      style={{
        background: 'var(--ink-3)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-bright)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px' }}>
        {/* Q number */}
        <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 6, background: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginTop: 1 }}>
          {q.q_no || idx + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            <span style={{ ...getPartStyle(q.part), borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '0.02em' }}>
              {q.part || 'General'}
            </span>
            {q.sub_question && (
              <span style={{ background: 'var(--ink-4)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 500 }}>
                ({q.sub_question})
              </span>
            )}
            {q.module && (
              <span style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(232,184,109,0.25)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 500 }}>
                {q.module}
              </span>
            )}
            {bloom && (
              <span className={bloomClass} style={{ borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                L{bloom} · {BLOOM_LABELS[bloom]}
              </span>
            )}
            {q.marks && (
              <span style={{ background: 'rgba(78,205,196,0.1)', color: '#4ecdc4', border: '1px solid rgba(78,205,196,0.25)', borderRadius: 100, padding: '2px 8px', fontSize: 10, fontWeight: 600 }}>
                {q.marks}M
              </span>
            )}
          </div>

          {/* Question text */}
          <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.65, margin: 0, overflow: expanded ? 'visible' : 'hidden', display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3, WebkitBoxOrient: 'vertical' }}>
            {q.question_text}
          </p>

          {/* Expand toggle */}
          {q.question_text.length > 160 && (
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ marginTop: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
            >
              {expanded ? <><ChevronUp size={11} />Show less</> : <><ChevronDown size={11} />Show more</>}
            </button>
          )}
        </div>
      </div>

      {/* Metadata footer */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: 14, background: 'rgba(0,0,0,0.15)' }}>
        {q.course_outcome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Tag size={10} color="var(--text-3)" />
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>CO: </span>
            <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500 }}>{q.course_outcome}</span>
          </div>
        )}
        {q.program_outcome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Award size={10} color="var(--text-3)" />
            <span style={{ fontSize: 10, color: 'var(--text-3)' }}>PO: </span>
            <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500 }}>{q.program_outcome}</span>
          </div>
        )}
        {(q as any).paper && (
          <>
            {(q as any).paper.exam_year && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Hash size={10} color="var(--text-3)" />
                <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500 }}>{(q as any).paper.exam_year}</span>
              </div>
            )}
            {(q as any).paper.paper_type && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <FileText size={10} color="var(--text-3)" />
                <span style={{ fontSize: 10, color: 'var(--text-2)', fontWeight: 500, textTransform: 'capitalize' }}>{(q as any).paper.paper_type}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function QuestionBank({ questions, isLoading }: QuestionBankProps) {
  const [search, setSearch] = useState('');
  const [filterPart, setFilterPart] = useState('all');
  const [filterBloom, setFilterBloom] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sort: Part-A first, then General, then Part-B
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      const pa = PART_ORDER[a.part || 'General'] ?? 3;
      const pb = PART_ORDER[b.part || 'General'] ?? 3;
      if (pa !== pb) return pa - pb;
      // Within Part-B, sort by module then q_no
      if (a.module && b.module) {
        const ma = parseInt(a.module.replace(/\D/g, '')) || 0;
        const mb = parseInt(b.module.replace(/\D/g, '')) || 0;
        if (ma !== mb) return ma - mb;
      }
      return (parseInt(a.q_no || '0') || 0) - (parseInt(b.q_no || '0') || 0);
    });
  }, [questions]);

  const modules = useMemo(() => [...new Set(sortedQuestions.map(q => q.module).filter(Boolean))], [sortedQuestions]);
  const parts = useMemo(() => [...new Set(sortedQuestions.map(q => q.part).filter(Boolean))], [sortedQuestions]);

  const filtered = useMemo(() => sortedQuestions.filter(q => {
    const matchSearch = !search || q.question_text.toLowerCase().includes(search.toLowerCase());
    const matchPart = filterPart === 'all' || q.part === filterPart;
    const matchBloom = filterBloom === 'all' || String(q.blooms_level) === filterBloom;
    const matchModule = filterModule === 'all' || q.module === filterModule;
    return matchSearch && matchPart && matchBloom && matchModule;
  }), [sortedQuestions, search, filterPart, filterBloom, filterModule]);

  // Group by part for section headers
  const grouped = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    filtered.forEach(q => {
      const key = q.part || 'General';
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [filtered]);

  const partOrder = ['Part-A', 'General', 'Part-B'];
  const orderedParts = [...new Set([...partOrder, ...Object.keys(grouped)])].filter(p => grouped[p]);

  return (
    <div id="questions" style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>Question Bank</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              {isLoading ? 'Loading…' : `${filtered.length} of ${questions.length} questions`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)', fontSize: 12, outline: 'none', width: 220, fontFamily: 'var(--font-sans)' }}
              />
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              style={{ padding: '7px 12px', background: showFilters ? 'var(--gold-dim)' : 'var(--ink-3)', border: `1px solid ${showFilters ? 'rgba(232,184,109,0.3)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: showFilters ? 'var(--gold)' : 'var(--text-2)', transition: 'all 0.15s' }}
            >
              <Filter size={12} /> Filters
            </button>
          </div>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: 'Part', value: filterPart, setter: setFilterPart, options: [['all', 'All parts'], ...parts.map(p => [p, p])] },
              { label: 'Bloom', value: filterBloom, setter: setFilterBloom, options: [['all', 'All levels'], ...[1,2,3,4,5,6].map(b => [String(b), `L${b} – ${BLOOM_LABELS[b]}`])] },
              { label: 'Module', value: filterModule, setter: setFilterModule, options: [['all', 'All modules'], ...modules.map(m => [m, m])] },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>{f.label}:</span>
                <select
                  value={f.value}
                  onChange={e => (f.setter as any)(e.target.value)}
                  style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-2)', fontSize: 11, padding: '4px 8px', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                >
                  {(f.options as [string, string][]).map(([v, l]) => (
                    <option key={v} value={v} style={{ background: '#1a1e29' }}>{l}</option>
                  ))}
                </select>
              </div>
            ))}
            {(search || filterPart !== 'all' || filterBloom !== 'all' || filterModule !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterPart('all'); setFilterBloom('all'); setFilterModule('all'); }} style={{ fontSize: 11, color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxHeight: 680, overflowY: 'auto' }} className="custom-scrollbar">
        {isLoading ? (
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
            <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>No questions found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try uploading a question paper or adjusting filters</div>
          </div>
        ) : (
          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {orderedParts.map(part => (
              <div key={part} style={{ marginBottom: 20 }}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ ...getPartStyle(part), borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {part}
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{grouped[part].length} questions</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {grouped[part].map((q, i) => (
                    <QuestionCard key={q.id} q={q} idx={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
