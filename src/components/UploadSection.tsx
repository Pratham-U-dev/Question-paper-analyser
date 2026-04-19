import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadPaper } from '@/src/api/endpoints';
import { useAppContext } from '@/src/context/AppContext';
import toast from 'react-hot-toast';

interface UploadFile { file: File; name: string; size: string; }

function N8nHealth() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  const checkHealth = async () => {
    setStatus('loading');
    try {
      // Appending a timestamp (cache-buster) forces the browser to actually ping the network
      // instead of secretly returning a cached '200 OK' without hitting n8n.
      // Using ngrok-skip-browser-warning to bypass ngrok intermediary pages
      const res = await fetch(`https://superlocally-unsilvered-efrain.ngrok-free.dev/webhook/health?t=${Date.now()}`, { 
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status === 'ok' ? 'online' : 'offline');
      } else {
        setStatus('offline');
      }
    } catch (err) {
      setStatus('offline');
    }
  };

  useEffect(() => {
    // Initial check on load
    checkHealth();
  }, []);

  const glowColor = status === 'online' ? 'rgba(78,205,196,0.3)' : status === 'offline' ? 'rgba(248,113,113,0.3)' : 'transparent';
  const borderColor = status === 'online' ? 'rgba(78,205,196,0.5)' : status === 'offline' ? 'rgba(248,113,113,0.5)' : 'var(--border)';

  return (
    <div 
      onClick={checkHealth}
      style={{ 
      display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '4px 10px', 
      borderRadius: 100, background: 'var(--ink-4)', 
      border: `1px solid ${borderColor}`,
      boxShadow: `0 0 12px ${glowColor}`,
      transition: 'all 0.3s',
      cursor: 'pointer'
    }}>
      <span style={{ color: 'var(--text-3)', marginRight: 2 }}>SERVER:</span>
      {status === 'loading' && (
        <>
          <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} color="var(--text-3)" />
          <span style={{ color: 'var(--text-3)' }}>Checking...</span>
        </>
      )}
      {status === 'online' && (
        <>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ecdc4', flexShrink: 0, animation: 'pulse-green 2s infinite' }} />
          <span style={{ color: '#4ecdc4', whiteSpace: 'nowrap' }}>Online</span>
        </>
      )}
      {status === 'offline' && (
        <>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', flexShrink: 0, animation: 'pulse-red 2s infinite' }} />
          <span style={{ color: '#f87171', whiteSpace: 'nowrap' }}>Offline</span>
        </>
      )}
      <style>{`
        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(78,205,196, 0.7); }
          70% { box-shadow: 0 0 0 5px rgba(78,205,196, 0); }
          100% { box-shadow: 0 0 0 0 rgba(78,205,196, 0); }
        }
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(248,113,113, 0.7); }
          70% { box-shadow: 0 0 0 5px rgba(248,113,113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(248,113,113, 0); }
        }
      `}</style>
    </div>
  );
}

export default function UploadSection({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);
  
  // New state variables for explicit upload details
  const [uploadSubjectCode, setUploadSubjectCode] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [uploadPaperType, setUploadPaperType] = useState('semester');
  const [uploadExamYear, setUploadExamYear] = useState(new Date().getFullYear().toString());

  const SUGGESTED_SUBJECTS = [
    { code: '22AIM61', name: 'Digital Image Processing (Integrated)' },
    { code: '22AIM62', name: 'Advanced AI and ML (Integrated)' },
    { code: '22AIM63', name: 'Natural Language Processing' },
    { code: '22AIM641', name: 'Robotic Process Automation' },
    { code: '22AIM642', name: 'Blockchain Technology' },
    { code: '22CIV67', name: 'Environmental Studies' },
  ];

  const { role } = useAppContext();

  const onDrop = useCallback((accepted: File[]) => {
    const mapped = accepted.map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
    }));
    setPendingFiles(mapped);
    setUploadDone(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
  } as any);

  const handleUpload = async () => {
    if (!pendingFiles.length || isUploading) return;
    if (!uploadSubjectCode.trim()) {
      toast.error('Please specify a Subject Code for the database');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    pendingFiles.forEach(pf => formData.append('files', pf.file));
    formData.append('subject_code', uploadSubjectCode.trim().toUpperCase());
    formData.append('exam_year', uploadExamYear);
    formData.append('paper_type', uploadPaperType);
    formData.append('role', role || 'student');

    try {
      await uploadPaper(formData);
      toast.success('Paper analyzed and stored!');
      setUploadDone(true);
      setPendingFiles([]);
      onUploadSuccess();
    } catch (err: any) {
      toast.error(err || 'Upload failed. Check N8N webhook is active.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div style={{ background: 'var(--ink-2)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <UploadCloud size={15} color="var(--gold)" />
          Upload Question Paper
          <div style={{ marginLeft: 'auto' }}>
            <N8nHealth />
          </div>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          style={{
            border: `2px dashed ${isDragActive ? 'var(--gold)' : 'var(--border-bright)'}`,
            borderRadius: 10,
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'var(--gold-dim)' : 'var(--ink-3)',
            transition: 'all 0.2s',
          }}
        >
          <input {...getInputProps()} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: isDragActive ? 'var(--gold-dim)' : 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={18} color={isDragActive ? 'var(--gold)' : 'var(--text-3)'} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>
                {isDragActive ? 'Drop to add files' : 'Drag & drop question papers here'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>PDF, PNG, JPG • Max 50MB</div>
            </div>
          </div>
        </div>

        {/* Pending files list */}
        {pendingFiles.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pendingFiles.map((pf, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                  <FileText size={14} color="var(--gold)" />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pf.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{pf.size}</span>
                  <button onClick={() => setPendingFiles(f => f.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, display: 'flex' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Manual Metadata Form */}
            <div style={{ background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>SUBJECT CODE *</label>
                <input 
                  type="text" 
                  value={uploadSubjectCode}
                  onChange={(e) => setUploadSubjectCode(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="e.g. 21CS62"
                  style={{ width: '100%', background: 'var(--ink-4)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-1)', fontSize: 13, outline: 'none' }}
                />
                
                {/* Suggestions Dropdown (Intellisense) */}
                {showSuggestions && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 6, marginTop: 4, zIndex: 50, maxHeight: 200, overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                    {SUGGESTED_SUBJECTS
                      .filter(s => s.code.toLowerCase().includes(uploadSubjectCode.toLowerCase()) || s.name.toLowerCase().includes(uploadSubjectCode.toLowerCase()))
                      .map((s, idx, arr) => (
                      <div 
                        key={s.code} 
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input from losing focus immediately
                          setUploadSubjectCode(s.code); 
                          setShowSuggestions(false); 
                        }}
                        style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', cursor: 'pointer', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid var(--border-bright)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--ink-4)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginBottom: 2 }}>{s.code}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.name}</span>
                      </div>
                    ))}
                    {SUGGESTED_SUBJECTS.filter(s => s.code.toLowerCase().includes(uploadSubjectCode.toLowerCase()) || s.name.toLowerCase().includes(uploadSubjectCode.toLowerCase())).length === 0 && (
                      <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                        Custom code "{uploadSubjectCode}" will be used.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>PAPER TYPE</label>
                <select 
                  value={uploadPaperType}
                  onChange={(e) => setUploadPaperType(e.target.value)}
                  style={{ width: '100%', background: 'var(--ink-4)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-1)', fontSize: 13, outline: 'none' }}
                >
                  <option value="semester">Semester Exam</option>
                  <option value="internal">Internal Assessment</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 4 }}>EXAM YEAR</label>
                <input 
                  type="number" 
                  value={uploadExamYear}
                  onChange={(e) => setUploadExamYear(e.target.value)}
                  style={{ width: '100%', background: 'var(--ink-4)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text-1)', fontSize: 13, outline: 'none' }}
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                marginTop: 6, padding: '10px 0', background: 'linear-gradient(135deg, #e8b86d, #c8963d)',
                color: '#1a1000', fontWeight: 700, borderRadius: 8, border: 'none', cursor: isUploading ? 'not-allowed' : 'pointer',
                fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: isUploading ? 0.6 : 1, transition: 'all 0.2s',
                boxShadow: '0 2px 12px rgba(232,184,109,0.25)',
              }}
            >
              {isUploading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing paper…</> : `Analyze ${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {uploadDone && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(78,205,196,0.1)', border: '1px solid rgba(78,205,196,0.25)', borderRadius: 8 }}>
            <CheckCircle2 size={14} color="#4ecdc4" />
            <span style={{ fontSize: 12, color: '#4ecdc4', fontWeight: 500 }}>Paper successfully analyzed and stored in database.</span>
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(13,15,20,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid var(--gold-dim)', borderTop: '3px solid var(--gold)', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-1)', marginBottom: 8 }}>Analyzing Paper…</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Extracting questions, mapping Bloom's taxonomy, detecting patterns.</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>This may take 15–30 seconds.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
