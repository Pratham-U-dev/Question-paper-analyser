import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/src/context/AppContext';
import UploadSection from '@/src/components/UploadSection';
import KPICards from '@/src/components/KPICards';
import ModuleFrequencyChart from '@/src/components/charts/ModuleFrequencyChart';
import BloomsChart from '@/src/components/charts/BloomsChart';
import Heatmap from '@/src/components/charts/Heatmap';
import WordCloudChart from '@/src/components/charts/WordCloudChart';
import QuestionBank from '@/src/components/QuestionBank';
import { getAnalyticsSummary, getAnalyticsFrequency, getAnalyticsBlooms, getAnalyticsHeatmap, getAnalyticsWordcloud } from '@/src/api/endpoints';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { subjectCode, setSubjectCode } = useAppContext();
  const [data, setData] = useState({
    summary: null,
    frequency: null,
    blooms: null,
    heatmap: null,
    wordcloud: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const [summary, frequency, blooms, heatmap, wordcloud] = await Promise.all([
        getAnalyticsSummary(subjectCode).catch(() => null),
        getAnalyticsFrequency(subjectCode).catch(() => null),
        getAnalyticsBlooms(subjectCode).catch(() => null),
        getAnalyticsHeatmap(subjectCode).catch(() => null),
        getAnalyticsWordcloud(subjectCode).catch(() => null),
      ]);
      setData({ 
        summary: summary?.data || summary, 
        frequency: frequency?.data || frequency, 
        blooms: blooms?.data || blooms, 
        heatmap: heatmap?.data || heatmap, 
        wordcloud: wordcloud?.data || wordcloud 
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectCode]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Student Dashboard</h1>
          <p className="text-slate-400 mt-1">Analyze past papers and optimize your study plan.</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-400">Subject:</span>
          <select 
            value={subjectCode} 
            onChange={(e) => setSubjectCode(e.target.value)}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="21CS61">21CS61 - Computer Networks</option>
            <option value="21AIM601">21AIM601 - Digital Image Processing</option>
            <option value="22CIV67">22CIV67 - Environmental Studies</option>
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <UploadSection onUploadSuccess={fetchData} />
      </motion.div>

      <KPICards data={data.summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ModuleFrequencyChart data={data.frequency?.chart_data || data.frequency} isLoading={isLoading} />
        <BloomsChart data={data.blooms?.chart_data || data.blooms} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Heatmap data={data.heatmap} isLoading={isLoading} />
        <WordCloudChart data={data.wordcloud?.word_frequencies || data.wordcloud} isLoading={isLoading} />
      </div>

      <QuestionBank />
    </div>
  );
}
