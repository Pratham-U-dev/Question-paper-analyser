import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/src/context/AppContext';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';

export default function Landing() {
  const { setRole } = useAppContext();
  const navigate = useNavigate();

  const handleSelectRole = (role: 'student' | 'lecturer') => {
    setRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center z-10 max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          Smart Question Paper <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Analyzer</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
          Transform unstructured academic question papers into actionable intelligence. 
          Select your role to get started.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectRole('student')}
            className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <GraduationCap className="w-12 h-12 text-blue-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Student</h2>
            <p className="text-slate-400 text-sm">
              Analyze past papers, discover high-frequency questions, and optimize your study plan.
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectRole('lecturer')}
            className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300 overflow-hidden text-left"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-2">Lecturer</h2>
            <p className="text-slate-400 text-sm">
              Generate balanced question papers, ensure Bloom's taxonomy compliance, and avoid repetition.
            </p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
