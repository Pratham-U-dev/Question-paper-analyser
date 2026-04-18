import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/src/context/AppContext';
import { GraduationCap, BookOpen, Brain, ArrowRight, Layers, BarChart2, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Layers, label: 'OCR extraction', desc: 'Extract questions from any PDF or image' },
  { icon: BarChart2, label: 'Analytics', desc: "Bloom's, module frequency & heatmaps" },
  { icon: Sparkles, label: 'AI generation', desc: 'Generate balanced question papers instantly' },
];

export default function Landing() {
  const { setRole } = useAppContext();
  const navigate = useNavigate();

  const handleSelectRole = (role: 'student' | 'lecturer') => {
    setRole(role);
    navigate(`/${role}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', fontFamily: 'var(--font-sans)', position: 'relative', overflow: 'hidden' }}>
      {/* Background elements */}
      <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,109,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,205,196,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      {/* Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none', opacity: 0.5 }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px' }}>
        
        {/* Logo mark */}
        <div className="fade-up" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #e8b86d, #c8963d)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(232,184,109,0.3)' }}>
            <Brain size={24} color="#1a1000" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Smart Academic Tool</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)', lineHeight: 1.2 }}>QP Analyzer</div>
          </div>
        </div>

        {/* Headline */}
        <div className="fade-up-1" style={{ textAlign: 'center', maxWidth: 680, marginBottom: 16 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 6vw, 3.6rem)', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
            Question papers,{' '}
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>transformed</em>
            <br />into intelligence.
          </h1>
        </div>
        
        <div className="fade-up-2" style={{ textAlign: 'center', maxWidth: 520, marginBottom: 48 }}>
          <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.7, margin: 0 }}>
            Upload academic question papers. Get instant analytics on Bloom's taxonomy, module patterns, and high-frequency questions. Generate perfectly balanced new papers.
          </p>
        </div>

        {/* Role cards */}
        <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, width: '100%', maxWidth: 620, marginBottom: 48 }}>
          {[
            {
              role: 'student' as const,
              icon: GraduationCap,
              color: 'var(--sky)',
              colorDim: 'var(--sky-dim)',
              title: 'Student',
              desc: 'Discover high-frequency questions, analyze past papers, and build a smarter study plan.',
              cta: 'Open student view',
            },
            {
              role: 'lecturer' as const,
              icon: BookOpen,
              color: 'var(--gold)',
              colorDim: 'var(--gold-dim)',
              title: 'Lecturer',
              desc: "Upload papers, view analytics, and generate AI-balanced question papers with Bloom's compliance.",
              cta: 'Open lecturer view',
            },
          ].map(item => (
            <button
              key={item.role}
              onClick={() => handleSelectRole(item.role)}
              style={{
                background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 24px', textAlign: 'left',
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 12,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = item.color;
                el.style.background = item.colorDim;
                el.style.transform = 'translateY(-3px)';
                el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3)`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--border)';
                el.style.background = 'var(--ink-2)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ width: 44, height: 44, background: item.colorDim, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${item.color}30` }}>
                <item.icon size={20} color={item.color} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)', marginBottom: 6 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: item.color, fontWeight: 600, marginTop: 4 }}>
                {item.cta} <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>

        {/* Feature pills */}
        <div className="fade-up-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
          {FEATURES.map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 14px', fontSize: 12 }}>
              <f.icon size={12} color="var(--gold)" />
              <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{f.label}</span>
              <span style={{ color: 'var(--text-3)' }}>·</span>
              <span style={{ color: 'var(--text-3)' }}>{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
