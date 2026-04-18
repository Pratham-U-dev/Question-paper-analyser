import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '@/src/context/AppContext';
import { LayoutDashboard, BookOpen, Sparkles, LogOut, ChevronRight, Brain, Menu, X } from 'lucide-react';

const BLOOM_LABELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

export default function Layout() {
  const { role, setRole, subjectCode, setSubjectCode } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setRole(null);
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', hash: '#overview' },
    { icon: BookOpen, label: 'Question Bank', hash: '#questions' },
    ...(role === 'lecturer' ? [{ icon: Sparkles, label: 'Paper Generator', hash: '#generator' }] : []),
  ];

  const isActive = (hash: string) => location.hash === hash || (hash === '#overview' && !location.hash);

  const handleNav = (hash: string) => {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else navigate(`/${role}${hash}`);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink)', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ width: 240, background: 'var(--ink-2)', borderRight: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #e8b86d, #c8963d)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={16} color="#1a1000" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>QP Analyzer</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{role} portal</div>
            </div>
          </div>

          {/* Subject Selector */}
          <div style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Subject</div>
            <select
              value={subjectCode}
              onChange={e => setSubjectCode(e.target.value)}
              style={{ width: '100%', background: 'transparent', color: 'var(--text-1)', fontSize: 12, fontWeight: 500, border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
            >
              <option value="21CS61" style={{ background: '#1a1e29' }}>21CS61 – Computer Networks</option>
              <option value="21AIM601" style={{ background: '#1a1e29' }}>21AIM601 – Image Processing</option>
              <option value="22CIV67" style={{ background: '#1a1e29' }}>22CIV67 – Env. Studies</option>
            </select>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border)', margin: '0 16px' }} />

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 6px', marginBottom: 8 }}>Navigation</div>
          {navItems.map((item) => (
            <button
              key={item.hash}
              onClick={() => handleNav(item.hash)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8,
                width: '100%', textAlign: 'left', fontSize: 13, fontWeight: 500,
                color: isActive(item.hash) ? 'var(--gold)' : 'var(--text-2)',
                background: isActive(item.hash) ? 'var(--gold-dim)' : 'transparent',
                border: isActive(item.hash) ? '1px solid rgba(232,184,109,0.2)' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2,
              }}
            >
              <item.icon size={15} />
              {item.label}
              {isActive(item.hash) && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </button>
          ))}
        </nav>

        {/* Bloom legend */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Bloom's Levels</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {BLOOM_LABELS.map((label, i) => (
              <div key={i} className={`bloom-${i + 1}`} style={{ borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>L{i + 1}</span><span style={{ opacity: 0.7 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '8px 12px 16px' }}>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, width: '100%', fontSize: 13, fontWeight: 500, color: 'var(--text-3)', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--rose)'; (e.target as HTMLElement).style.background = 'var(--rose-dim)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-3)'; (e.target as HTMLElement).style.background = 'transparent'; }}
          >
            <LogOut size={14} />
            Switch Role
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <main style={{ flex: 1, marginLeft: 0, paddingLeft: 0 }} className="md:ml-60">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--ink-2)', position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, background: 'linear-gradient(135deg, #e8b86d, #c8963d)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={13} color="#1a1000" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>QP Analyzer</span>
          </div>
          <button onClick={() => setMobileOpen(v => !v)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text-2)', cursor: 'pointer' }}>
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </header>

        <div style={{ padding: '24px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
