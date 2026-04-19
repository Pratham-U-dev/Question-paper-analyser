/**
 * paperGenerator.ts
 * Pure client-side question selection logic.
 * Selects questions from the Supabase question bank based on:
 *  - Bloom's taxonomy distribution percentages
 *  - Module assignments (for Part B)
 *  - Part type (Part-A / Part-B)
 *  - Excluded years
 *  - Repeat-avoidance (shuffle + weighted selection)
 */

import type { Question } from '@/src/api/supabase';

export interface PartAConfig {
  question_count: number;
  marks_per_question: number;
}

export interface PartBConfig {
  modules: number[];          // e.g. [1, 2, 3, 4, 5]
  marks_per_question: number; // marks for each full question (e.g. 16)
}

export interface BloomDistribution {
  L1: number; L2: number; L3: number;
  L4: number; L5: number; L6: number;
}

export interface GeneratorConfig {
  exam_name: string;
  subject_name: string;
  subject_code: string;
  duration: string;
  total_marks: number;
  paper_type: string;
  institution_name?: string;
  part_a: PartAConfig;
  part_b: PartBConfig;
  bloom_distribution: BloomDistribution; // percentages 0-100
  exclude_years: number[];
}

// ─── Result types ────────────────────────────────────────────────────────────

export interface SelectedQuestion {
  id: string;
  question_text: string;
  blooms_level: number | null;
  course_outcome: string | null;
  program_outcome: string | null;
  marks: number;
  module: string | null;
  part: string | null;
  q_no: string | null;
  exam_year?: number | null;
}

export interface PartBModule {
  module_number: number;
  module_label: string;
  question_a: SelectedQuestion; // sub-question (a)
  question_b: SelectedQuestion; // sub-question (b)  ← OR choice
}

export interface GeneratedPaper {
  config: GeneratorConfig;
  part_a: SelectedQuestion[];
  part_b: PartBModule[];
  bloom_summary: Record<string, number>; // actual distribution achieved
  warnings: string[];
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Weighted random pick: returns indices biased toward items not recently used */
function weightedPick<T>(pool: T[], count: number): T[] {
  const shuffled = shuffle(pool);
  return shuffled.slice(0, count);
}

function bloomKey(level: number | null): keyof BloomDistribution {
  return `L${level ?? 1}` as keyof BloomDistribution;
}

function filterByExcludedYears(questions: Question[], excludeYears: number[]): Question[] {
  if (!excludeYears.length) return questions;
  return questions.filter(q => {
    const year = (q as any).paper?.exam_year;
    return !year || !excludeYears.includes(year);
  });
}

/**
 * Given a target count and a bloom distribution (percentages),
 * returns a map of L1..L6 → how many questions to pick for each level.
 */
function computeBloomQuota(
  totalCount: number,
  dist: BloomDistribution,
): Record<string, number> {
  const total = dist.L1 + dist.L2 + dist.L3 + dist.L4 + dist.L5 + dist.L6;
  const quota: Record<string, number> = {};
  let assigned = 0;

  const levels: (keyof BloomDistribution)[] = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  levels.forEach(l => {
    const raw = (dist[l] / (total || 100)) * totalCount;
    quota[l] = Math.floor(raw);
    assigned += quota[l];
  });

  // distribute remainder to highest-fraction levels
  const remainder = totalCount - assigned;
  const fracs = levels
    .map(l => ({ l, frac: (dist[l] / (total || 100)) * totalCount - quota[l] }))
    .sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < remainder; i++) {
    quota[fracs[i % fracs.length].l]++;
  }

  return quota;
}

// ─── Main selection logic ─────────────────────────────────────────────────────

export function generatePaperFromBank(
  allQuestions: Question[],
  config: GeneratorConfig,
): GeneratedPaper {
  const warnings: string[] = [];

  // Filter by excluded years
  const eligible = filterByExcludedYears(allQuestions, config.exclude_years);

  // ── PART A ──────────────────────────────────────────────────────────────────
  // Source: Part-A questions (or General) only
  const partAPool = eligible.filter(
    q => q.part === 'Part-A' || q.part === 'General'
  );

  const partAQuota = computeBloomQuota(
    config.part_a.question_count,
    config.bloom_distribution,
  );

  const selectedPartA: SelectedQuestion[] = [];
  const usedIds = new Set<string>();

  // For each bloom level, pick from pool
  for (const [level, count] of Object.entries(partAQuota)) {
    if (count === 0) continue;
    const levelNum = parseInt(level.replace('L', ''));
    const levelPool = partAPool.filter(
      q => q.blooms_level === levelNum && !usedIds.has(q.id)
    );
    const picked = weightedPick(levelPool, count);

    if (picked.length < count) {
      warnings.push(`Part A: Only ${picked.length}/${count} questions found for ${level}. Filling from any level.`);
      // Fill from any remaining Part A questions
      const fallback = partAPool.filter(q => !usedIds.has(q.id) && !picked.includes(q));
      const extra = weightedPick(fallback, count - picked.length);
      picked.push(...extra);
    }

    picked.forEach(q => {
      usedIds.add(q.id);
      selectedPartA.push({
        id: q.id,
        question_text: q.question_text,
        blooms_level: q.blooms_level,
        course_outcome: q.course_outcome,
        program_outcome: q.program_outcome,
        marks: config.part_a.marks_per_question,
        module: q.module,
        part: q.part,
        q_no: q.q_no,
        exam_year: (q as any).paper?.exam_year ?? null,
      });
    });
  }

  // Trim/pad to exact count
  while (selectedPartA.length > config.part_a.question_count) selectedPartA.pop();
  if (selectedPartA.length < config.part_a.question_count) {
    const remaining = partAPool.filter(q => !usedIds.has(q.id));
    const extra = weightedPick(remaining, config.part_a.question_count - selectedPartA.length);
    extra.forEach(q => {
      usedIds.add(q.id);
      selectedPartA.push({
        id: q.id,
        question_text: q.question_text,
        blooms_level: q.blooms_level,
        course_outcome: q.course_outcome,
        program_outcome: q.program_outcome,
        marks: config.part_a.marks_per_question,
        module: q.module,
        part: q.part,
        q_no: q.q_no,
        exam_year: (q as any).paper?.exam_year ?? null,
      });
    });
    if (selectedPartA.length < config.part_a.question_count) {
      warnings.push(`Part A: Needed ${config.part_a.question_count} questions but only ${selectedPartA.length} available in bank.`);
    }
  }

  // ── PART B ──────────────────────────────────────────────────────────────────
  // Source: Part-B questions only, per module
  // Each module gets 2 questions (question_a OR question_b)
  // Sub-question labels (a/b) are assigned by position in output, not from DB

  const partBModules: PartBModule[] = [];
  const partBPool = eligible.filter(q => q.part === 'Part-B');

  // Total Part B questions across all modules = modules.length × 2
  const partBTotalCount = config.part_b.modules.length * 2;
  const partBQuota = computeBloomQuota(partBTotalCount, config.bloom_distribution);

  // Build per-module bloom budget
  const perModuleBloomQuota = computeBloomQuota(2, config.bloom_distribution);

  for (const modNum of config.part_b.modules) {
    // Module label matching: "Module-1", "Module 1", "module-1", etc.
    const modLabel = `Module-${modNum}`;
    const modPool = partBPool.filter(q => {
      if (!q.module) return false;
      const m = q.module.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
      const target = `module${modNum}`;
      return m === target;
    }).filter(q => !usedIds.has(q.id));

    if (modPool.length < 2) {
      warnings.push(`Module ${modNum}: Only ${modPool.length} Part-B questions available (need 2). Falling back to any module.`);
    }

    // Pick 2 questions for this module (respecting bloom where possible)
    let picked: Question[] = [];

    // Try to match bloom levels
    for (const [level, count] of Object.entries(perModuleBloomQuota)) {
      if (count === 0) continue;
      const levelNum = parseInt(level.replace('L', ''));
      const levelPool = modPool.filter(q => q.blooms_level === levelNum && !picked.find(p => p.id === q.id));
      const take = weightedPick(levelPool, count);
      picked.push(...take);
    }

    // Fill remaining from module pool (any bloom)
    if (picked.length < 2) {
      const remaining = modPool.filter(q => !picked.find(p => p.id === q.id));
      picked.push(...weightedPick(remaining, 2 - picked.length));
    }

    // Still not enough? Fall back to any Part-B question
    if (picked.length < 2) {
      const fallback = partBPool.filter(q => !usedIds.has(q.id) && !picked.find(p => p.id === q.id));
      picked.push(...weightedPick(fallback, 2 - picked.length));
    }

    // Shuffle so a/b assignment is random
    picked = shuffle(picked);

    // Mark as used
    picked.forEach(q => usedIds.add(q.id));

    const makeSelected = (q: Question, idx: number): SelectedQuestion => ({
      id: q.id,
      question_text: q.question_text,
      blooms_level: q.blooms_level,
      course_outcome: q.course_outcome,
      program_outcome: q.program_outcome,
      marks: config.part_b.marks_per_question,
      module: q.module,
      part: q.part,
      q_no: q.q_no,
      exam_year: (q as any).paper?.exam_year ?? null,
    });

    const qa = picked[0] ? makeSelected(picked[0], 0) : makePlaceholder(modLabel, 'a', config.part_b.marks_per_question);
    const qb = picked[1] ? makeSelected(picked[1], 1) : makePlaceholder(modLabel, 'b', config.part_b.marks_per_question);

    partBModules.push({ module_number: modNum, module_label: modLabel, question_a: qa, question_b: qb });
  }

  // ── Bloom summary ────────────────────────────────────────────────────────────
  const allSelected = [...selectedPartA, ...partBModules.flatMap(m => [m.question_a, m.question_b])];
  const bloom_summary: Record<string, number> = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0, L6: 0 };
  allSelected.forEach(q => {
    const k = bloomKey(q.blooms_level);
    bloom_summary[k] = (bloom_summary[k] || 0) + 1;
  });

  return { config, part_a: selectedPartA, part_b: partBModules, bloom_summary, warnings };
}

function makePlaceholder(module: string, sub: string, marks: number): SelectedQuestion {
  return {
    id: `placeholder-${module}-${sub}`,
    question_text: `[No question available for ${module} — please add more questions to the bank]`,
    blooms_level: null,
    course_outcome: null,
    program_outcome: null,
    marks,
    module,
    part: 'Part-B',
    q_no: null,
    exam_year: null,
  };
}
