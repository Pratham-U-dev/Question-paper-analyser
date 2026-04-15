import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { getQuestions } from '@/src/api/endpoints';
import { useAppContext } from '@/src/context/AppContext';
import { mockQuestions } from '@/src/lib/mockData';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function QuestionBank() {
  const { subjectCode, isMockMode } = useAppContext();
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      
      if (isMockMode) {
        setQuestions(mockQuestions);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getQuestions(subjectCode);
        setQuestions(data?.data?.questions || data?.questions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [subjectCode, isMockMode]);

  const filtered = questions.filter(q => 
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Question Bank</CardTitle>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-slate-400">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400">No questions found.</div>
            ) : (
              filtered.map((q, i) => (
                <div key={q.id || i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-md">
                        Part {q.part}
                      </span>
                      {q.module && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-md">
                          Module {q.module}
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-md">
                        {q.marks} Marks
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Freq:</span>
                      <span className="px-2 py-1 text-xs font-bold bg-rose-500/20 text-rose-400 rounded-md">
                        {q.frequency}x
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed">{q.question_text}</p>
                  <div className="mt-3 flex justify-between items-center text-xs text-slate-500">
                    <span>{q.bloom_level}</span>
                    <span>{q.exam_year} • {q.paper_type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
