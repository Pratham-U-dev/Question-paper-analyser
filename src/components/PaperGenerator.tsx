/**
 * PaperGenerator.tsx  — Lecturer only
 * Client-side question selection + DOCX / PDF export.
 * No N8N needed for this feature.
 */

import React, { useState } from 'react';
import {
  Sparkles, Loader2, FileText, Download, Printer,
  ChevronDown, ChevronUp, Info, AlertTriangle,
  CheckCircle2, RefreshCw, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '@/src/context/AppContext';
import { generatePaperFromBank } from '@/src/lib/paperGenerator';
import type { GeneratorConfig, GeneratedPaper } from '@/src/lib/paperGenerator';
import { exportToDocx } from '@/src/lib/docxExport';
import { exportToPdf } from '@/src/lib/pdfExport';
import type { Question } from '@/src/api/supabase';

const BLOOM_LABELS: Record<string, string> = { L1:'Remember',L2:'Understand',L3:'Apply',L4:'Analyze',L5:'Evaluate',L6:'Create' };
const BLOOM_COLORS: Record<string, string> = { L1:'#63d688',L2:'#38bdf8',L3:'#e8b86d',L4:'#a78bfa',L5:'#f87171',L6:'#fb923c' };
const BLOOM_DIM: Record<string, string>   = { L1:'rgba(99,214,136,.12)',L2:'rgba(56,189,248,.12)',L3:'rgba(232,184,109,.12)',L4:'rgba(167,139,250,.12)',L5:'rgba(248,113,113,.12)',L6:'rgba(251,146,60,.12)' };

const INPUT: React.CSSProperties = { width:'100%',background:'var(--ink-3)',border:'1px solid var(--border)',borderRadius:7,color:'var(--text-1)',fontSize:12,padding:'7px 10px',outline:'none',fontFamily:'var(--font-sans)' };
const LBL: React.CSSProperties   = { fontSize:11,color:'var(--text-3)',fontWeight:500,display:'block',marginBottom:4 };

function BloomSlider({ level, value, onChange }: { level: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:3 }}>
      <div style={{ display:'flex',justifyContent:'space-between' }}>
        <span style={{ fontSize:11,fontWeight:700,color:BLOOM_COLORS[level] }}>{level} <span style={{ fontWeight:400,color:'var(--text-3)',fontSize:10 }}>{BLOOM_LABELS[level]}</span></span>
        <span style={{ fontSize:12,fontWeight:700,color:value>0?BLOOM_COLORS[level]:'var(--text-3)' }}>{value}%</span>
      </div>
      <div style={{ height:5,background:'var(--ink-4)',borderRadius:3,overflow:'hidden',position:'relative' }}>
        <div style={{ position:'absolute',inset:'0 auto 0 0',width:`${value}%`,background:BLOOM_COLORS[level],transition:'width .15s' }} />
      </div>
      <input type="range" min={0} max={100} value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{ width:'100%',accentColor:BLOOM_COLORS[level],height:4,cursor:'pointer',margin:0 }} />
    </div>
  );
}

function PaperPreview({ paper, expanded, onToggle }: { paper:GeneratedPaper; expanded:boolean; onToggle:()=>void }) {
  const { config, part_a, part_b, bloom_summary, warnings } = paper;
  const entries = Object.entries(bloom_summary).filter(([,v])=>v>0);
  const total   = entries.reduce((a,[,v])=>a+v,0);

  return (
    <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
      {warnings.length>0 && (
        <div style={{ padding:'10px 12px',background:'rgba(251,146,60,.08)',border:'1px solid rgba(251,146,60,.25)',borderRadius:8,display:'flex',alignItems:'flex-start',gap:8 }}>
          <AlertTriangle size={13} color="#fb923c" style={{ marginTop:1,flexShrink:0 }} />
          <div>{warnings.map((w,i)=><div key={i} style={{ fontSize:11,color:'#fb923c',lineHeight:1.5 }}>· {w}</div>)}</div>
        </div>
      )}
      {/* Bloom achieved */}
      <div style={{ padding:'10px 12px',background:'var(--ink-3)',border:'1px solid var(--border)',borderRadius:8 }}>
        <div style={{ fontSize:10,color:'var(--text-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Bloom's Achieved</div>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          {entries.map(([l,v])=>(
            <div key={l} style={{ background:BLOOM_DIM[l],border:`1px solid ${BLOOM_COLORS[l]}30`,borderRadius:6,padding:'4px 8px',textAlign:'center' }}>
              <div style={{ fontSize:10,fontWeight:700,color:BLOOM_COLORS[l] }}>{l}</div>
              <div style={{ fontSize:11,color:'var(--text-1)',fontWeight:600 }}>{v}</div>
              <div style={{ fontSize:9,color:'var(--text-3)' }}>{Math.round(v/total*100)}%</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={onToggle} style={{ display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:600,color:'var(--gold)',background:'none',border:'none',cursor:'pointer',padding:0 }}>
        <Eye size={12} />{expanded?'Hide preview':'View full paper preview'}{expanded?<ChevronUp size={11}/>:<ChevronDown size={11}/>}
      </button>
      {expanded && (
        <div style={{ background:'#fffef7',color:'#111',borderRadius:10,padding:'22px 26px',boxShadow:'0 4px 24px rgba(0,0,0,.3)',fontFamily:'Georgia,serif',fontSize:'9.5pt',lineHeight:1.7,overflowX:'auto' }}>
          {/* Header */}
          <div style={{ textAlign:'center',borderBottom:'2px solid #2E4A8A',paddingBottom:10,marginBottom:12 }}>
            <div style={{ fontWeight:800,fontSize:'13pt',textTransform:'uppercase',letterSpacing:'.04em',color:'#1a1f36' }}>{config.institution_name||'Institution'}</div>
            <div style={{ fontWeight:700,fontSize:'11pt',color:'#2E4A8A',marginTop:4 }}>{config.exam_name}</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginTop:10,fontSize:'9pt' }}>
              {[['Subject',config.subject_name||config.subject_code],['Code',config.subject_code],['Max Marks',String(config.total_marks)],['Duration',config.duration]].map(([k,v])=>(
                <div key={k}><strong>{k}:</strong> {v}</div>
              ))}
            </div>
          </div>
          <div style={{ fontSize:'8.5pt',fontStyle:'italic',color:'#555',marginBottom:12 }}>
            <strong style={{ color:'#2E4A8A' }}>Instructions:</strong> Answer all {config.part_a.question_count} questions in Part A. In Part B, answer one full question from each module.
          </div>
          {/* Part A table */}
          <div style={{ textAlign:'center',fontWeight:800,fontSize:'11pt',textTransform:'uppercase',color:'#2E4A8A',background:'#EEF3FB',padding:'5px 0',border:'1px solid #C0C8DC',marginBottom:4 }}>PART A</div>
          <div style={{ textAlign:'center',fontSize:'8.5pt',fontStyle:'italic',color:'#555',marginBottom:6 }}>Answer all questions ({config.part_a.question_count}×{config.part_a.marks_per_question}={config.part_a.question_count*config.part_a.marks_per_question} Marks)</div>
          <table style={{ width:'100%',borderCollapse:'collapse',marginBottom:14,fontSize:'9pt' }}>
            <thead><tr style={{ background:'#1a1f36',color:'#fff' }}>
              {['Q.No','Question',"Bloom's Level",'CO','PO','Marks'].map(h=><th key={h} style={{ padding:'5px 6px',textAlign:h==='Question'?'left':'center',border:'1px solid #3a4060',fontSize:'8.5pt' }}>{h}</th>)}
            </tr></thead>
            <tbody>{part_a.map((q,i)=>(
              <tr key={q.id} style={{ background:i%2===0?'#fff':'#F2F4F8' }}>
                <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontWeight:700 }}>{i+1}</td>
                <td style={{ padding:'5px 6px',border:'1px solid #C0C8DC' }}>{q.question_text}</td>
                <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontSize:'8pt' }}>{q.blooms_level?`L${q.blooms_level}-${BLOOM_LABELS['L'+q.blooms_level]}`:'—'}</td>
                <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontSize:'8pt' }}>{q.course_outcome||'—'}</td>
                <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontSize:'8pt' }}>{q.program_outcome||'—'}</td>
                <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontWeight:700 }}>{q.marks}</td>
              </tr>
            ))}</tbody>
          </table>
          {/* Part B table */}
          <div style={{ textAlign:'center',fontWeight:800,fontSize:'11pt',textTransform:'uppercase',color:'#2E4A8A',background:'#EEF3FB',padding:'5px 0',border:'1px solid #C0C8DC',marginBottom:4 }}>PART B</div>
          <div style={{ textAlign:'center',fontSize:'8.5pt',fontStyle:'italic',color:'#555',marginBottom:6 }}>Answer one full question from each module ({config.part_b.modules.length}×{config.part_b.marks_per_question}={config.part_b.modules.length*config.part_b.marks_per_question} Marks)</div>
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'9pt' }}>
            <thead><tr style={{ background:'#1a1f36',color:'#fff' }}>
              {['Q.No','Sub','Question',"Bloom's Level",'CO','PO','Marks'].map(h=><th key={h} style={{ padding:'5px 6px',textAlign:h==='Question'?'left':'center',border:'1px solid #3a4060',fontSize:'8.5pt' }}>{h}</th>)}
            </tr></thead>
            <tbody>{part_b.map((mod,mi)=>{
              const qn=config.part_a.question_count+mi+1;
              return (
                <React.Fragment key={mod.module_label}>
                  <tr><td colSpan={7} style={{ background:'#2E4A8A',color:'#fff',padding:'5px 8px',fontWeight:700,border:'1px solid #1a3060' }}>
                    {mod.module_label} <em style={{ color:'#CCDCF5',fontWeight:400,fontSize:'8pt' }}>(Answer either a or b)</em>
                  </td></tr>
                  {[{sub:'a)',q:mod.question_a},{sub:'b)',q:mod.question_b}].map(({sub,q},si)=>(
                    <React.Fragment key={sub}>
                      {si===1&&<tr><td colSpan={7} style={{ textAlign:'center',background:'#FFF8E1',color:'#B45309',fontWeight:700,padding:'3px',border:'1px solid #E5C97A' }}>OR</td></tr>}
                      <tr style={{ background:mi%2===0?'#fff':'#F2F4F8' }}>
                        <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontWeight:700 }}>{qn}</td>
                        <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontWeight:700 }}>{sub}</td>
                        <td style={{ padding:'5px 6px',border:'1px solid #C0C8DC' }}>{q.question_text}</td>
                        <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontSize:'8pt' }}>{q.blooms_level?`L${q.blooms_level}-${BLOOM_LABELS['L'+q.blooms_level]}`:'—'}</td>
                        <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontSize:'8pt' }}>{q.course_outcome||'—'}</td>
                        <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontSize:'8pt' }}>{q.program_outcome||'—'}</td>
                        <td style={{ padding:'5px 6px',textAlign:'center',border:'1px solid #C0C8DC',fontWeight:700 }}>{q.marks}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface FormState {
  paper_type:string; exam_name:string; subject_name:string; institution_name:string;
  total_marks:number; duration:string;
  part_a_count:number; part_a_marks:number;
  part_b_modules:string; part_b_marks:number;
  exclude_years:string;
  L1:number; L2:number; L3:number; L4:number; L5:number; L6:number;
}

export default function PaperGenerator({ questions }: { questions: Question[] }) {
  const { subjectCode } = useAppContext();
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [isDocxLoading,  setIsDocxLoading]  = useState(false);
  const [paper,          setPaper]          = useState<GeneratedPaper|null>(null);
  const [previewOpen,    setPreviewOpen]    = useState(false);

  const [form, setForm] = useState<FormState>({
    paper_type:'semester', exam_name:'End Semester Examination',
    subject_name:'', institution_name:'St Joseph Engineering College, Mangaluru',
    total_marks:100, duration:'3 Hours',
    part_a_count:10, part_a_marks:2,
    part_b_modules:'1,2,3,4,5', part_b_marks:16,
    exclude_years:'',
    L1:10, L2:25, L3:30, L4:20, L5:10, L6:5,
  });

  const bloomTotal = form.L1+form.L2+form.L3+form.L4+form.L5+form.L6;
  const bloomOk    = bloomTotal===100;
  const set = (k:keyof FormState, v:any) => setForm(f=>({...f,[k]:v}));

  const partAPool = questions.filter(q=>q.part==='Part-A'||q.part==='General');
  const partBPool = questions.filter(q=>q.part==='Part-B');
  const modules   = form.part_b_modules.split(',').map(s=>parseInt(s.trim())).filter(Boolean);

  const buildConfig = ():GeneratorConfig => ({
    exam_name: form.exam_name,
    subject_name: form.subject_name||subjectCode,
    subject_code: subjectCode,
    duration: form.duration,
    total_marks: form.total_marks,
    paper_type: form.paper_type,
    institution_name: form.institution_name,
    part_a: { question_count:form.part_a_count, marks_per_question:form.part_a_marks },
    part_b: { modules, marks_per_question:form.part_b_marks },
    bloom_distribution: { L1:form.L1,L2:form.L2,L3:form.L3,L4:form.L4,L5:form.L5,L6:form.L6 },
    exclude_years: form.exclude_years?form.exclude_years.split(',').map(s=>parseInt(s.trim())).filter(Boolean):[],
  });

  const generate = (cfg:GeneratorConfig) => {
    const p = generatePaperFromBank(questions, cfg);
    setPaper(p);
    if (p.warnings.length) toast(`Generated with ${p.warnings.length} warning(s)`,{icon:'⚠️'});
    else toast.success('Paper generated!');
    setPreviewOpen(true);
  };

  const handleGenerate = () => {
    if (!bloomOk)              { toast.error("Bloom's must total 100%"); return; }
    if (!questions.length)     { toast.error('No questions in bank. Upload a paper first.'); return; }
    setIsGenerating(true); setPaper(null); setPreviewOpen(false);
    setTimeout(()=>{ try{ generate(buildConfig()); }catch(e:any){ toast.error(e?.message??String(e)); } finally{ setIsGenerating(false); } }, 50);
  };

  const handleReshuffle = () => {
    if (!paper) return;
    setTimeout(()=>{ try{ generate(paper.config); }catch(e:any){ toast.error(e?.message??String(e)); } }, 50);
  };

  const handleDocx = async () => {
    if (!paper) return;
    setIsDocxLoading(true);
    try { await exportToDocx(paper); toast.success('DOCX downloaded!'); }
    catch(e:any){ toast.error('DOCX error: '+(e?.message??String(e))); console.error(e); }
    finally{ setIsDocxLoading(false); }
  };

  const handlePdf = () => {
    if (!paper) return;
    exportToPdf(paper);
    toast.success('Print window opened — choose "Save as PDF"');
  };

  const btnBase: React.CSSProperties = { display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'6px 12px',borderRadius:7,fontSize:11,fontWeight:600,cursor:'pointer',border:'none',transition:'all .15s' };

  return (
    <div id="generator" style={{ background:'var(--ink-2)',border:'1px solid rgba(167,139,250,.25)',borderRadius:14,overflow:'hidden' }}>
      {/* Header */}
      <div style={{ padding:'18px 22px',borderBottom:'1px solid var(--border)',background:'rgba(167,139,250,.04)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:10 }}>
        <div>
          <div style={{ display:'flex',alignItems:'center',gap:8 }}>
            <Sparkles size={15} color="var(--violet)" />
            <span style={{ fontSize:15,fontWeight:700,fontFamily:'var(--font-display)',color:'var(--text-1)' }}>Question Paper Generator</span>
            <span style={{ fontSize:10,background:'rgba(167,139,250,.15)',color:'var(--violet)',border:'1px solid rgba(167,139,250,.3)',borderRadius:100,padding:'2px 8px',fontWeight:600 }}>LECTURER ONLY</span>
          </div>
          <p style={{ fontSize:11,color:'var(--text-3)',marginTop:3 }}>Bloom's-weighted selection from your bank · exports to DOCX &amp; PDF · no N8N required</p>
        </div>
        <div style={{ display:'flex',gap:8 }}>
          {[['Part-A pool',partAPool.length,'#38bdf8'],['Part-B pool',partBPool.length,'#a78bfa'],['Total',questions.length,'var(--gold)']].map(([l,v,c])=>(
            <div key={String(l)} style={{ textAlign:'center',padding:'5px 10px',background:'var(--ink-3)',border:'1px solid var(--border)',borderRadius:8 }}>
              <div style={{ fontSize:15,fontWeight:700,color:String(c),fontFamily:'var(--font-display)' }}>{v}</div>
              <div style={{ fontSize:9,color:'var(--text-3)',fontWeight:500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:22,display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))',gap:24 }}>
        {/* ── FORM ── */}
        <div style={{ display:'flex',flexDirection:'column',gap:16,minWidth:0 }}>
          {/* Paper details */}
          <div>
            <div style={{ fontSize:10,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10 }}>Paper Details</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <div><label style={LBL}>Paper Type</label>
                <select value={form.paper_type} onChange={e=>set('paper_type',e.target.value)} style={{...INPUT,cursor:'pointer'}}>
                  {[['semester','Semester'],['internal','Internal'],['model','Model Paper']].map(([v,l])=><option key={v} value={v} style={{background:'#1a1e29'}}>{l}</option>)}
                </select></div>
              <div><label style={LBL}>Duration</label><input value={form.duration} onChange={e=>set('duration',e.target.value)} style={INPUT} placeholder="3 Hours" /></div>
              <div style={{gridColumn:'1/-1'}}><label style={LBL}>Exam Name</label><input value={form.exam_name} onChange={e=>set('exam_name',e.target.value)} style={INPUT} /></div>
              <div style={{gridColumn:'1/-1'}}><label style={LBL}>Institution Name</label><input value={form.institution_name} onChange={e=>set('institution_name',e.target.value)} style={INPUT} /></div>
              <div><label style={LBL}>Subject Name</label><input value={form.subject_name} onChange={e=>set('subject_name',e.target.value)} style={INPUT} placeholder={subjectCode} /></div>
              <div><label style={LBL}>Total Marks</label><input type="number" value={form.total_marks} onChange={e=>set('total_marks',Number(e.target.value))} style={INPUT} /></div>
            </div>
          </div>
          {/* Part A */}
          <div>
            <div style={{ fontSize:10,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ background:'rgba(56,189,248,.15)',color:'#38bdf8',borderRadius:4,padding:'1px 6px',fontSize:9 }}>PART A</span> Short Answer
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <div><label style={LBL}>Questions</label><input type="number" value={form.part_a_count} onChange={e=>set('part_a_count',Number(e.target.value))} style={INPUT} /></div>
              <div><label style={LBL}>Marks each</label><input type="number" value={form.part_a_marks} onChange={e=>set('part_a_marks',Number(e.target.value))} style={INPUT} /></div>
            </div>
            {partAPool.length<form.part_a_count&&<div style={{ marginTop:5,fontSize:10,color:'#fb923c',display:'flex',alignItems:'center',gap:4 }}><AlertTriangle size={10}/>Only {partAPool.length} Part-A questions in bank</div>}
          </div>
          {/* Part B */}
          <div>
            <div style={{ fontSize:10,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8,display:'flex',alignItems:'center',gap:6 }}>
              <span style={{ background:'rgba(167,139,250,.15)',color:'#a78bfa',borderRadius:4,padding:'1px 6px',fontSize:9 }}>PART B</span> Long Answer (a/b per module)
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <div><label style={LBL}>Modules (comma-sep)</label><input value={form.part_b_modules} onChange={e=>set('part_b_modules',e.target.value)} style={INPUT} placeholder="1,2,3,4,5" /></div>
              <div><label style={LBL}>Marks / Question</label><input type="number" value={form.part_b_marks} onChange={e=>set('part_b_marks',Number(e.target.value))} style={INPUT} /></div>
            </div>
          </div>
          {/* Bloom sliders */}
          <div>
            <div style={{ fontSize:10,color:'var(--text-3)',fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8,display:'flex',alignItems:'center',gap:8 }}>
              Bloom's Distribution
              <span style={{ fontSize:11,color:bloomOk?'#4ecdc4':'#f87171',fontWeight:700,background:bloomOk?'rgba(78,205,196,.1)':'rgba(248,113,113,.1)',padding:'1px 8px',borderRadius:100,border:`1px solid ${bloomOk?'rgba(78,205,196,.25)':'rgba(248,113,113,.25)'}`,textTransform:'none',letterSpacing:0 }}>
                {bloomTotal}% {bloomOk?'✓':'≠ 100'}
              </span>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
              {(['L1','L2','L3','L4','L5','L6'] as const).map(l=><BloomSlider key={l} level={l} value={(form as any)[l]} onChange={v=>set(l as keyof FormState,v)} />)}
            </div>
          </div>
          {/* Exclude years */}
          <div><label style={LBL}>Exclude Years (comma-sep, optional)</label>
            <input value={form.exclude_years} onChange={e=>set('exclude_years',e.target.value)} style={INPUT} placeholder="e.g. 2023, 2024" /></div>

          {/* Generate */}
          <button onClick={handleGenerate} disabled={isGenerating||!bloomOk}
            style={{ padding:'12px 0',background:isGenerating||!bloomOk?'rgba(167,139,250,.3)':'linear-gradient(135deg,#a78bfa,#7c3aed)',color:'#fff',fontWeight:700,fontSize:13,borderRadius:9,border:'none',cursor:isGenerating||!bloomOk?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,transition:'all .2s',boxShadow:bloomOk?'0 2px 14px rgba(167,139,250,.3)':'none' }}>
            {isGenerating?<><Loader2 size={14} style={{animation:'spin .8s linear infinite'}}/>Selecting questions…</>:<><Sparkles size={14}/>Generate Question Paper</>}
          </button>
          {/* Info */}
          <div style={{ display:'flex',alignItems:'flex-start',gap:7,padding:'10px 12px',background:'rgba(56,189,248,.06)',border:'1px solid rgba(56,189,248,.15)',borderRadius:8 }}>
            <Info size={12} color="#38bdf8" style={{ marginTop:2,flexShrink:0 }} />
            <p style={{ fontSize:11,color:'var(--text-3)',margin:0,lineHeight:1.6 }}>
              Questions are selected <strong style={{color:'var(--text-2)'}}>directly from your Supabase bank</strong> — no N8N needed.
              Bloom's % is applied across Part A and each Part B module. Sub-questions a/b are randomly shuffled from each module's pool.
            </p>
          </div>
        </div>

        {/* ── OUTPUT ── */}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8 }}>
            <span style={{ fontSize:13,fontWeight:600,color:'var(--text-1)',fontFamily:'var(--font-display)' }}>Generated Output</span>
            {paper&&(
              <div style={{ display:'flex',gap:6 }}>
                <button onClick={handleReshuffle} style={{...btnBase,background:'var(--ink-3)',border:'1px solid var(--border)',color:'var(--text-2)'}} title="New random selection, same config">
                  <RefreshCw size={11}/>Reshuffle
                </button>
                <button onClick={handleDocx} disabled={isDocxLoading} style={{...btnBase,background:'rgba(56,189,248,.12)',border:'1px solid rgba(56,189,248,.3)',color:'#38bdf8'}}>
                  {isDocxLoading?<Loader2 size={11} style={{animation:'spin .8s linear infinite'}}/>:<Download size={11}/>}DOCX
                </button>
                <button onClick={handlePdf} style={{...btnBase,background:'rgba(248,113,113,.12)',border:'1px solid rgba(248,113,113,.3)',color:'#f87171'}}>
                  <Printer size={11}/>PDF
                </button>
              </div>
            )}
          </div>

          <div style={{ flex:1,minHeight:440,background:'var(--ink-3)',border:'1px solid var(--border)',borderRadius:10,overflow:'auto' }} className="custom-scrollbar">
            {!paper?(
              <div style={{ height:'100%',minHeight:440,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,color:'var(--text-3)' }}>
                <FileText size={36} style={{opacity:.15}}/>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text-2)'}}>Generated paper appears here</div>
                <div style={{fontSize:11,maxWidth:240,textAlign:'center',lineHeight:1.6}}>
                  Configure the form and click <strong style={{color:'var(--violet)'}}>Generate Question Paper</strong>
                </div>
              </div>
            ):(
              <div style={{padding:'18px 20px'}}>
                {/* Summary */}
                <div style={{ display:'flex',flexWrap:'wrap',gap:8,marginBottom:14,padding:'10px 12px',background:'rgba(167,139,250,.06)',border:'1px solid rgba(167,139,250,.2)',borderRadius:8 }}>
                  <div style={{display:'flex',alignItems:'center',gap:5}}><CheckCircle2 size={13} color="#4ecdc4"/><span style={{fontSize:12,color:'var(--text-1)',fontWeight:600}}>Paper Ready</span></div>
                  <span style={{color:'var(--border-bright)'}}>·</span>
                  <span style={{fontSize:11,color:'var(--text-3)'}}>{paper.part_a.length} Part-A + {paper.part_b.length*2} Part-B ({paper.part_b.length} modules)</span>
                  <span style={{color:'var(--border-bright)'}}>·</span>
                  <span style={{fontSize:11,color:'var(--text-3)'}}>
                    {paper.config.part_a.question_count*paper.config.part_a.marks_per_question + paper.config.part_b.modules.length*paper.config.part_b.marks_per_question} marks total
                  </span>
                </div>
                {/* Download CTAs */}
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  <button onClick={handleDocx} disabled={isDocxLoading}
                    style={{flex:1,padding:'10px 0',background:isDocxLoading?'rgba(56,189,248,.1)':'linear-gradient(135deg,#38bdf8,#0ea5e9)',color:'#fff',fontWeight:700,fontSize:12,borderRadius:8,border:'none',cursor:isDocxLoading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 2px 10px rgba(56,189,248,.25)'}}>
                    {isDocxLoading?<Loader2 size={13} style={{animation:'spin .8s linear infinite'}}/>:<Download size={13}/>}Download .docx
                  </button>
                  <button onClick={handlePdf}
                    style={{flex:1,padding:'10px 0',background:'linear-gradient(135deg,#f87171,#ef4444)',color:'#fff',fontWeight:700,fontSize:12,borderRadius:8,border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 2px 10px rgba(248,113,113,.25)'}}>
                    <Printer size={13}/>Save as PDF
                  </button>
                </div>
                <PaperPreview paper={paper} expanded={previewOpen} onToggle={()=>setPreviewOpen(v=>!v)} />
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
