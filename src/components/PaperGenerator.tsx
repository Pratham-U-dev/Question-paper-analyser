import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card';
import { generatePaper } from '@/src/api/endpoints';
import { useAppContext } from '@/src/context/AppContext';
import { Loader2, Settings, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaperGenerator() {
  const { subjectCode } = useAppContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);

  const [formData, setFormData] = useState({
    paper_type: 'semester',
    total_marks: 100,
    part_a_count: 10,
    part_a_marks: 1,
    part_b_modules: '1,2,3,4,5',
    part_b_choices: 2,
    part_b_marks: 10,
    exclude_years: '2023',
    l1: 10,
    l2: 30,
    l3: 30,
    l4: 20,
    l5: 10,
    l6: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPaper(null);

    const payload = {
      subject_code: subjectCode,
      paper_type: formData.paper_type,
      total_marks: Number(formData.total_marks),
      part_a: {
        question_count: Number(formData.part_a_count),
        marks_per_question: Number(formData.part_a_marks),
      },
      part_b: {
        modules: formData.part_b_modules.split(',').map(Number),
        choices_per_module: Number(formData.part_b_choices),
        marks_per_question: Number(formData.part_b_marks),
      },
      constraints: {
        bloom_distribution: {
          "L1": Number(formData.l1) / 100,
          "L2": Number(formData.l2) / 100,
          "L3": Number(formData.l3) / 100,
          "L4": Number(formData.l4) / 100,
          "L5": Number(formData.l5) / 100,
          "L6": Number(formData.l6) / 100,
        },
        exclude_years: formData.exclude_years.split(',').map(Number),
        avoid_repetition_risk: "high"
      }
    };

    try {
      const data = await generatePaper(payload);
      setGeneratedPaper(data?.data || data);
      toast.success('Paper generated successfully!');
    } catch (error: any) {
      toast.error(error || 'Failed to generate paper');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-3 border-purple-500/30 bg-purple-500/5">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-400">
          <Settings className="w-5 h-5" />
          <span>Question Paper Generator</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Paper Type</label>
                <select name="paper_type" value={formData.paper_type} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none">
                  <option value="semester">Semester</option>
                  <option value="internal">Internal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Total Marks</label>
                <input type="number" name="total_marks" value={formData.total_marks} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2 border-b border-white/10 pb-1">Bloom's Taxonomy Distribution (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                {['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].map((level) => (
                  <div key={level}>
                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase">{level}</label>
                    <input type="number" name={level} value={(formData as any)[level]} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Exclude Years (comma separated)</label>
              <input type="text" name="exclude_years" value={formData.exclude_years} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none" placeholder="e.g. 2023, 2022" />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors flex justify-center items-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Generate Paper</span>}
            </button>
          </div>

          {/* Output */}
          <div className="bg-slate-950/50 rounded-xl border border-white/10 p-6 flex flex-col h-full max-h-[600px]">
            {!generatedPaper ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>Generated paper will appear here</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                {/* Validation Badge */}
                <div className={`p-4 rounded-lg border flex items-start space-x-3 ${generatedPaper.validation?.bloom_balance_score < 0.75 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                  {generatedPaper.validation?.bloom_balance_score < 0.75 ? (
                    <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className={`font-semibold ${generatedPaper.validation?.bloom_balance_score < 0.75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      Bloom's Balance Score: {generatedPaper.validation?.bloom_balance_score}
                    </h4>
                    {generatedPaper.validation?.warnings?.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-rose-300/80 list-disc list-inside pl-4">
                        {generatedPaper.validation.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Part A */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">PART A</h3>
                  <div className="space-y-3">
                    {generatedPaper.part_a_questions?.map((q: any, i: number) => (
                      <div key={i} className="flex space-x-3 text-slate-300 text-sm">
                        <span className="font-semibold">{q.question_number}.</span>
                        <div className="flex-1">
                          <p>{q.text}</p>
                          <div className="flex space-x-2 mt-1">
                            <span className="text-xs text-blue-400">[{q.marks}M]</span>
                            <span className="text-xs text-purple-400">[{q.bloom_level}]</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part B */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">PART B</h3>
                  <div className="space-y-6">
                    {generatedPaper.part_b_modules?.map((m: any, i: number) => (
                      <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/5">
                        <h4 className="font-semibold text-blue-400 mb-3">Module {m.module}</h4>
                        <div className="space-y-4">
                          <div className="text-slate-300 text-sm">
                            <p className="mb-1"><span className="font-semibold mr-2">Q.</span>{m.question_a?.text}</p>
                            <div className="flex space-x-2">
                              <span className="text-xs text-blue-400">[{m.question_a?.marks}M]</span>
                              <span className="text-xs text-purple-400">[{m.question_a?.bloom_level}]</span>
                            </div>
                          </div>
                          <div className="text-center text-xs font-bold text-slate-500">OR</div>
                          <div className="text-slate-300 text-sm">
                            <p className="mb-1"><span className="font-semibold mr-2">Q.</span>{m.question_b?.text}</p>
                            <div className="flex space-x-2">
                              <span className="text-xs text-blue-400">[{m.question_b?.marks}M]</span>
                              <span className="text-xs text-purple-400">[{m.question_b?.bloom_level}]</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
