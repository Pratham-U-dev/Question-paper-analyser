import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPaper } from '@/src/api/endpoints';
import { useAppContext } from '@/src/context/AppContext';
import toast from 'react-hot-toast';

export default function UploadSection({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const { role, subjectCode } = useAppContext();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    acceptedFiles.forEach(file => formData.append('files', file));
    formData.append('subject_code', subjectCode);
    formData.append('exam_year', new Date().getFullYear().toString());
    formData.append('paper_type', 'semester');
    formData.append('role', role || 'student');

    try {
      const data = await uploadPaper(formData);
      toast.success('Paper uploaded and analyzed successfully!');
      onUploadSuccess();
    } catch (error: any) {
      toast.error(error || 'Failed to upload paper');
    } finally {
      setIsUploading(false);
    }
  }, [role, subjectCode, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  } as any);

  return (
    <>
      <div 
        {...getRootProps()} 
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-12 text-center
          ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-500/20' : 'bg-white/10'}`}>
            <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-blue-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {isDragActive ? 'Drop files here...' : 'Drag & drop question papers'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Supports PDF, PNG, JPG (Max 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Full Screen Loading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center space-y-6">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Analyzing Paper...</h3>
                <p className="text-slate-400">Extracting questions, mapping Bloom's taxonomy, and detecting patterns.</p>
                <p className="text-slate-500 text-sm mt-2">This may take 15-30 seconds.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
