import React from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { FileText, HelpCircle, Layers, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface KPICardsProps {
  data: {
    total_papers_analyzed: number;
    total_questions_extracted: number;
    unique_question_groups: number;
    high_risk_questions: number;
  } | null;
  isLoading: boolean;
}

export default function KPICards({ data, isLoading }: KPICardsProps) {
  const kpis = [
    { title: 'Papers Analyzed', value: data?.total_papers_analyzed, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Questions Extracted', value: data?.total_questions_extracted, icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Unique Groups', value: data?.unique_question_groups, icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'High Risk Questions', value: data?.high_risk_questions, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:border-white/20 transition-colors">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-white/10 animate-pulse rounded mt-1" />
                ) : (
                  <h3 className="text-2xl font-bold text-white mt-1">{kpi.value ?? '-'}</h3>
                )}
              </div>
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${kpi.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
