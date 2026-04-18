import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2, FileText, Download, Printer, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { generatePaper } from '@/src/api/endpoints';
import { useAppContext } from '@/src/context/AppContext';
import toast from 'react-hot-toast';

const BLOOM_LABELS: Record<string, string> = { L1: 'Remember', L2: 'Understand', L3: 'Apply', L4: 'Analyze', L5: 'Evaluate', L6: 'Create' };
const BLOOM_COLORS: Record<string, string> = { L1: '#63d688', L2: '#38bdf8', L3: '#e8b86d', L4: '#a78bfa', L5: '#f87171', L6: '#fb923c' };

function BloomSlider({ level, value, onChange }: { level: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: BLOOM_COLORS[level] }}>{level}</span>
        <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{value}%</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--ink-4)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${value}%`, background: BLOOM_COLORS[level], borderRadius: 3, transition: 'width 0.2s' }} />
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: BLOOM_COLORS[level], height: 4, cursor: 'pointer' }}
      />
    </div>
  );
}

interface FormState {
  paper_type: string; exam_name: string; subject_name: string;
  total_marks: number; duration: string;
  part_a_count: number; part_a_marks: number;
  part_b_modules: string; part_b_marks: number;
  exclude_years: string;
  L1: number; L2: number; L3: number; L4: number; L5: number; L6: number;
}

export default function PaperGenerator() {
  const { subjectCode } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState<FormState>({
    paper_type: 'semester', exam_name: 'End Semester Examination', subject_name: '',
    total_marks: 100, duration: '3 Hours',
    part_a_count: 10, part_a_marks: 2,
    part_b_modules: '1,2,3,4,5', part_b_marks: 16,
    exclude_years: '',
    L1: 10, L2: 25, L3: 30, L4: 20, L5: 10, L6: 5,
  });

  const bloomTotal = form.L1 + form.L2 + form.L3 + form.L4 + form.L5 + form.L6;
  const bloomValid = bloomTotal === 100;

  const handleChange = (key: keyof FormState, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleGenerate = async () => {
    if (!bloomValid) { toast.error("Bloom's distribution must total 100%"); return; }
    setIsGenerating(true);
    setGeneratedPaper(null);
    const payload = {
      subject_code: subjectCode,
      paper_type: form.paper_type,
      exam_name: form.exam_name,
      subject_name: form.subject_name || subjectCode,
      duration: form.duration,
      total_marks: form.total_marks,
      part_a: { question_count: form.part_a_count, marks_per_question: form.part_a_marks },
      part_b: {
        modules: form.part_b_modules.split(',').map(s => parseInt(s.trim())).filter(Boolean),
        marks_per_question: form.part_b_marks,
      },
      constraints: {
        bloom_distribution: { L1: form.L1 / 100, L2: form.L2 / 100, L3: form.L3 / 100, L4: form.L4 / 100, L5: form.L5 / 100, L6: form.L6 / 100 },
        exclude_years: form.exclude_years ? form.exclude_years.split(',').map(s => parseInt(s.trim())).filter(Boolean) : [],
        avoid_repetition_risk: 'high',
      },
    };
    try {
      const data = await generatePaper(payload);
      setGeneratedPaper(data?.data || data);
      toast.success('Paper generated!');
      setShowPreview(true);
    } catch (err: any) {
      toast.error(err || 'Generation failed. Add the N8N generate-paper webhook.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div id="generator" style={{ background: 'var(--ink-2)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 22px', borderBottom: '1px solid var(--border)', background: 'rgba(167,139,250,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} color="var(--violet)" />
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)' }}>Question Paper Generator</span>
          <span style={{ marginLeft: 6, fontSize: 10, background: 'rgba(167,139,250,0.15)', color: 'var(--violet)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 100, padding: '2px 8px', fontWeight: 600 }}>LECTURER ONLY</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Configure parameters and generate a balanced paper from your question bank via N8N workflow.</p>
      </div>

      <div style={{ padding: '22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Paper info */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Paper Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Paper Type</label>
                <select value={form.paper_type} onChange={e => handleChange('paper_type', e.target.value)}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}>
                  <option value="semester" style={{ background: '#1a1e29' }}>Semester</option>
                  <option value="internal" style={{ background: '#1a1e29' }}>Internal</option>
                  <option value="model" style={{ background: '#1a1e29' }}>Model Paper</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Duration</label>
                <input value={form.duration} onChange={e => handleChange('duration', e.target.value)}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }}
                  placeholder="e.g. 3 Hours" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Exam Name</label>
                <input value={form.exam_name} onChange={e => handleChange('exam_name', e.target.value)}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }}
                  placeholder="End Semester Examination" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Total Marks</label>
                <input type="number" value={form.total_marks} onChange={e => handleChange('total_marks', Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }} />
              </div>
            </div>
          </div>

          {/* Part A */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>PART A</span>
              Short Answer Questions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>No. of Questions</label>
                <input type="number" value={form.part_a_count} onChange={e => handleChange('part_a_count', Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Marks Each</label>
                <input type="number" value={form.part_a_marks} onChange={e => handleChange('part_a_marks', Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }} />
              </div>
            </div>
          </div>

          {/* Part B */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderRadius: 4, padding: '1px 6px', fontSize: 10 }}>PART B</span>
              Long Answer Questions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Modules (comma-sep)</label>
                <input value={form.part_b_modules} onChange={e => handleChange('part_b_modules', e.target.value)}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }}
                  placeholder="1,2,3,4,5" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Marks / Question</label>
                <input type="number" value={form.part_b_marks} onChange={e => handleChange('part_b_marks', Number(e.target.value))}
                  style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }} />
              </div>
            </div>
          </div>

          {/* Bloom */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              Bloom's Distribution
              <span style={{ fontSize: 11, color: bloomValid ? '#4ecdc4' : '#f87171', fontWeight: 600, background: bloomValid ? 'rgba(78,205,196,0.1)' : 'rgba(248,113,113,0.1)', padding: '1px 7px', borderRadius: 100, border: `1px solid ${bloomValid ? 'rgba(78,205,196,0.2)' : 'rgba(248,113,113,0.2)'}`, textTransform: 'none', letterSpacing: 0 }}>
                {bloomTotal}% {bloomValid ? '✓' : '≠ 100'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['L1','L2','L3','L4','L5','L6'] as const).map(l => (
                <BloomSlider key={l} level={l} value={(form as any)[l]} onChange={v => handleChange(l as keyof FormState, v)} />
              ))}
            </div>
          </div>

          {/* Exclude years */}
          <div>
            <label style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Exclude Years (comma-sep, optional)</label>
            <input value={form.exclude_years} onChange={e => handleChange('exclude_years', e.target.value)}
              style={{ width: '100%', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-1)', fontSize: 12, padding: '7px 10px', outline: 'none', fontFamily: 'var(--font-sans)' }}
              placeholder="e.g. 2023, 2024" />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !bloomValid}
            style={{
              padding: '12px 0', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', color: '#fff',
              fontWeight: 700, fontSize: 13, borderRadius: 9, border: 'none', cursor: isGenerating || !bloomValid ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: isGenerating || !bloomValid ? 0.6 : 1, transition: 'all 0.2s',
              boxShadow: '0 2px 14px rgba(167,139,250,0.3)',
            }}
          >
            {isGenerating ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</> : <><Sparkles size={14} /> Generate Question Paper</>}
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '10px 12px', background: 'rgba(232,184,109,0.06)', border: '1px solid rgba(232,184,109,0.15)', borderRadius: 8 }}>
            <Info size={12} color="var(--gold)" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, lineHeight: 1.6 }}>
              This sends a request to your <strong style={{ color: 'var(--text-2)' }}>N8N generate-paper webhook</strong>. Activate the workflow in N8N and set the webhook path to <code style={{ color: 'var(--gold)', background: 'var(--ink-4)', padding: '1px 4px', borderRadius: 3 }}>/generate-paper</code>.
            </p>
          </div>
        </div>

        {/* Right: Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>Generated Output</span>
            {generatedPaper && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, color: 'var(--text-2)', cursor: 'pointer' }}>
                  <Printer size={11} /> Print
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minHeight: 400, background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'auto' }} className="custom-scrollbar">
            {!generatedPaper ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-3)', minHeight: 400 }}>
                <FileText size={32} style={{ opacity: 0.2 }} />
                <div style={{ fontSize: 13, fontWeight: 500 }}>Generated paper appears here</div>
                <div style={{ fontSize: 11 }}>Fill the form and click Generate</div>
              </div>
            ) : (
              <div style={{ padding: '20px 22px' }}>
                {/* Validation */}
                {generatedPaper.validation && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8,
                    background: (generatedPaper.validation?.bloom_balance_score ?? 1) < 0.75 ? 'rgba(248,113,113,0.08)' : 'rgba(78,205,196,0.08)',
                    border: `1px solid ${(generatedPaper.validation?.bloom_balance_score ?? 1) < 0.75 ? 'rgba(248,113,113,0.25)' : 'rgba(78,205,196,0.25)'}`,
                  }}>
                    {(generatedPaper.validation?.bloom_balance_score ?? 1) < 0.75
                      ? <AlertTriangle size={14} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} />
                      : <CheckCircle2 size={14} color="#4ecdc4" style={{ marginTop: 2, flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: (generatedPaper.validation?.bloom_balance_score ?? 1) < 0.75 ? '#f87171' : '#4ecdc4' }}>
                        Bloom's Balance: {generatedPaper.validation?.bloom_balance_score ?? '—'}
                      </div>
                      {generatedPaper.validation?.warnings?.map((w: string, i: number) => (
                        <div key={i} style={{ fontSize: 11, color: '#f87171', opacity: 0.8, marginTop: 2 }}>· {w}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paper preview (academic format) */}
                <div className="no-print" style={{ marginBottom: 10, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowPreview(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    {showPreview ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    {showPreview ? 'Card view' : 'Formatted preview'}
                  </button>
                </div>

                {showPreview ? (
                  /* Academic paper format */
                  <div style={{ fontFamily: 'Georgia, serif', background: '#fffef7', color: '#111', borderRadius: 8, padding: '28px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
                    <div style={{ textAlign: 'center', borderBottom: '2px solid #111', paddingBottom: 14, marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{generatedPaper.institution_name || 'Institution Name'}</div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>{form.exam_name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
                        <span>Subject: <strong>{form.subject_name || subjectCode}</strong></span>
                        <span>Code: <strong>{subjectCode}</strong></span>
                        <span>Max Marks: <strong>{form.total_marks}</strong></span>
                        <span>Time: <strong>{form.duration}</strong></span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, marginBottom: 16, fontStyle: 'italic', color: '#444' }}>
                      Note: Answer all questions from Part A. Answer one full question from each module in Part B.
                    </div>

                    {/* Part A */}
                    {generatedPaper.part_a_questions?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'underline', marginBottom: 10 }}>PART A</div>
                        {generatedPaper.part_a_questions.map((q: any, i: number) => (
                          <div key={i} style={{ marginBottom: 8, display: 'flex', gap: 8, fontSize: 12 }}>
                            <span style={{ fontWeight: 600, minWidth: 20 }}>{q.question_number || i + 1}.</span>
                            <div>
                              <span>{q.text || q.question_text}</span>
                              <span style={{ marginLeft: 8, color: '#555', fontSize: 11 }}>[{q.marks}M] [{q.bloom_level || `L${q.blooms_level}`}]</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Part B */}
                    {generatedPaper.part_b_modules?.length > 0 && (
                      <div>
                        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, textDecoration: 'underline', marginBottom: 10 }}>PART B</div>
                        {generatedPaper.part_b_modules.map((m: any, i: number) => (
                          <div key={i} style={{ marginBottom: 16, paddingLeft: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Module {m.module || i + 1}</div>
                            <div style={{ fontSize: 12, marginBottom: 4, display: 'flex', gap: 8 }}>
                              <span style={{ fontWeight: 600 }}>Q.</span>
                              <div><span>{m.question_a?.text || m.question_a?.question_text}</span><span style={{ marginLeft: 8, color: '#555', fontSize: 11 }}>[{m.question_a?.marks}M]</span></div>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#555', margin: '4px 0' }}>OR</div>
                            <div style={{ fontSize: 12, display: 'flex', gap: 8 }}>
                              <span style={{ fontWeight: 600 }}>Q.</span>
                              <div><span>{m.question_b?.text || m.question_b?.question_text}</span><span style={{ marginLeft: 8, color: '#555', fontSize: 11 }}>[{m.question_b?.marks}M]</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Card view */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Part A cards */}
                    {generatedPaper.part_a_questions?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Part A</div>
                        {generatedPaper.part_a_questions.map((q: any, i: number) => (
                          <div key={i} style={{ padding: '10px 12px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: 7, marginBottom: 6 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', minWidth: 18 }}>{q.question_number || i+1}.</span>
                              <p style={{ fontSize: 12, color: 'var(--text-1)', margin: 0, flex: 1 }}>{q.text || q.question_text}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                              <span style={{ fontSize: 10, background: 'rgba(56,189,248,0.1)', color: '#38bdf8', borderRadius: 100, padding: '1px 7px', fontWeight: 500 }}>{q.marks}M</span>
                              {(q.bloom_level || q.blooms_level) && <span className={`bloom-${q.blooms_level || q.bloom_level?.replace('L','')}`} style={{ borderRadius: 100, padding: '1px 7px', fontSize: 10, fontWeight: 500 }}>{q.bloom_level || `L${q.blooms_level}`}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Part B cards */}
                    {generatedPaper.part_b_modules?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Part B</div>
                        {generatedPaper.part_b_modules.map((m: any, i: number) => (
                          <div key={i} style={{ padding: '12px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 7, marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>Module {m.module || i+1}</div>
                            {[m.question_a, m.question_b].map((q, qi) => q && (
                              <div key={qi}>
                                {qi === 1 && <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', margin: '6px 0', letterSpacing: '0.1em' }}>OR</div>}
                                <div style={{ padding: '8px 10px', background: 'var(--ink-4)', borderRadius: 6 }}>
                                  <p style={{ fontSize: 12, color: 'var(--text-1)', margin: '0 0 6px' }}>{q.text || q.question_text}</p>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <span style={{ fontSize: 10, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', borderRadius: 100, padding: '1px 7px', fontWeight: 500 }}>{q.marks}M</span>
                                    {(q.bloom_level || q.blooms_level) && <span className={`bloom-${q.blooms_level || q.bloom_level?.replace('L','')}`} style={{ borderRadius: 100, padding: '1px 7px', fontSize: 10, fontWeight: 500 }}>{q.bloom_level || `L${q.blooms_level}`}</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
