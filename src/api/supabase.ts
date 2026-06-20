// Supabase direct client for analytics & question bank
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

async function supabaseFetch(path: string, options?: RequestInit) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured. Returning empty data for UI showcase.');
    return []; // Replaces the crash with empty mock data
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`Supabase Fetch Error [${res.status}]:`, errText);
    throw new Error(`Supabase Error ${res.status}: ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log(`Supabase Fetch Success [${path}]:`, data.length, 'rows returned.');
  
  if (data.length === 0) {
    console.warn(`Supabase returned 0 rows for ${path}. Possible reasons:`);
    console.warn('1. The subject code does not match any records (case-sensitive).');
    console.warn('2. Row Level Security (RLS) is enabled on the table but there is no policy allowing "anon" / public reads.');
  }

  return data;
}

export interface Paper {
  id: string;
  institution_name: string | null;
  examination_name: string | null;
  subject_name: string | null;
  subject_code: string | null;
  exam_year: number | null;
  paper_type: string | null;
  duration: string | null;
  maximum_marks: number | null;
  upload_role: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  paper_id: string;
  subject_code: string | null;
  part: string | null;
  module: string | null;
  q_no: string | null;
  sub_question: string | null;
  question_text: string;
  blooms_level: number | null;
  course_outcome: string | null;
  program_outcome: string | null;
  marks: number | null;
  created_at: string;
  // joined from papers
  paper?: Paper;
}

export async function fetchPapers(subjectCode: string): Promise<Paper[]> {
  return supabaseFetch(
    `/papers?subject_code=eq.${encodeURIComponent(subjectCode)}&order=created_at.desc`
  );
}

export async function fetchQuestions(subjectCode: string, page = 1, limit = 200): Promise<Question[]> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return supabaseFetch(
    `/questions?subject_code=eq.${encodeURIComponent(subjectCode)}&order=part.asc,module.asc,q_no.asc&offset=${from}&limit=${limit}`,
    { headers: { Range: `${from}-${to}` } }
  );
}

export async function fetchQuestionsWithPaper(subjectCode: string): Promise<Question[]> {
  return supabaseFetch(
    `/questions?subject_code=eq.${encodeURIComponent(subjectCode)}&select=*,paper:paper_id(*)&order=part.asc,module.asc,q_no.asc&limit=500`
  );
}

export async function fetchUniqueSubjects(): Promise<{ subject_code: string; subject_name: string }[]> {
  const data = await supabaseFetch('/papers?select=subject_code,subject_name');
  
  // Deduplicate
  const map = new Map<string, string>();
  data.forEach((p: any) => {
    if (p.subject_code) {
      if (!map.has(p.subject_code) || (!map.get(p.subject_code) && p.subject_name)) {
        map.set(p.subject_code, p.subject_name || p.subject_code);
      }
    }
  });

  return Array.from(map.entries()).map(([code, name]) => ({ subject_code: code, subject_name: name }));
}

// Analytics computed client-side from raw data
export function computeAnalytics(papers: Paper[], questions: Question[]) {
  const totalPapers = papers.length;
  const totalQuestions = questions.length;

  // Blooms distribution
  const bloomsCounts: Record<string, number> = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0 };
  questions.forEach((q) => {
    if (q.blooms_level) {
      const key = `L${q.blooms_level}`;
      bloomsCounts[key] = (bloomsCounts[key] || 0) + 1;
    }
  });

  // Module frequency
  const moduleCounts: Record<string, number> = {};
  questions.forEach((q) => {
    if (q.module) {
      moduleCounts[q.module] = (moduleCounts[q.module] || 0) + 1;
    }
  });

  // Part distribution
  const partCounts: Record<string, number> = {};
  questions.forEach((q) => {
    const part = q.part || 'General';
    partCounts[part] = (partCounts[part] || 0) + 1;
  });

  // Marks distribution
  const marksCounts: Record<string, number> = {};
  questions.forEach((q) => {
    const m = String(q.marks || 'N/A');
    marksCounts[m] = (marksCounts[m] || 0) + 1;
  });

  // High-risk: questions appearing in 2+ papers (by text similarity - exact match)
  const textFreq: Record<string, number> = {};
  questions.forEach((q) => {
    const key = q.question_text.trim().toLowerCase().slice(0, 60);
    textFreq[key] = (textFreq[key] || 0) + 1;
  });
  const highRisk = Object.values(textFreq).filter((v) => v >= 2).length;

  // Average marks
  const markedQs = questions.filter((q) => q.marks);
  const avgMarks = markedQs.length > 0
    ? Math.round(markedQs.reduce((sum, q) => sum + (q.marks || 0), 0) / markedQs.length * 10) / 10
    : 0;

  return {
    totalPapers,
    totalQuestions,
    highRisk,
    avgMarks,
    bloomsCounts,
    moduleCounts,
    partCounts,
    marksCounts,
  };
}
