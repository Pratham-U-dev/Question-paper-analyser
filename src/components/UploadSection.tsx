import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { uploadPaper } from '@/src/api/endpoints';
import { useAppContext } from '@/src/context/AppContext';
import toast from 'react-hot-toast';

interface UploadFile { file: File; name: string; size: string; }

export default function UploadSection({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadFile[]>([]);
  const { role, subjectCode } = useAppContext();

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
    setIsUploading(true);
    const formData = new FormData();
    pendingFiles.forEach(pf => formData.append('files', pf.file));
    formData.append('subject_code', subjectCode);
    formData.append('exam_year', new Date().getFullYear().toString());
    formData.append('paper_type', 'semester');
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
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
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
