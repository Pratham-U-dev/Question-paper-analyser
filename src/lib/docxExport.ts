/**
 * docxExport.ts
 * Generates a professionally formatted .docx question paper.
 * Uses the `docx` npm package (browser-compatible via Vite bundling).
 *
 * Format:
 *   Institution header
 *   Exam detail table (subject, code, marks, duration)
 *   Instructions
 *   PART A — numbered questions with [BL | CO | PO | Marks] columns
 *   PART B — Module-1..N, each with Q.a / OR / Q.b sub-questions
 *
 * Install: npm install docx
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, HeadingLevel, PageNumber, Header, Footer,
  TableOfContents,
} from 'docx';
import type { GeneratedPaper, SelectedQuestion } from './paperGenerator';

// ─── Color palette ────────────────────────────────────────────────────────────
const DARK_HEADER  = '1a1f36';   // dark navy for header shading
const MID_BLUE     = '2E4A8A';   // section heading colour
const LIGHT_GRAY   = 'F2F4F8';   // light row shading
const WHITE        = 'FFFFFF';
const BLACK        = '000000';
const BORDER_CLR   = 'C0C8DC';   // table border colour

// ─── Border helpers ───────────────────────────────────────────────────────────
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR };
const allBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder   = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noAllBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ─── Cell helper ──────────────────────────────────────────────────────────────
function cell(
  content: string,
  widthDxa: number,
  opts: {
    bold?: boolean;
    center?: boolean;
    size?: number;
    shade?: string;
    color?: string;
    border?: any;
    vAlign?: (typeof VerticalAlign)[keyof typeof VerticalAlign];
  } = {},
): TableCell {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    shading: opts.shade
      ? { fill: opts.shade, type: ShadingType.CLEAR }
      : { fill: WHITE, type: ShadingType.CLEAR },
    borders: opts.border ?? allBorders,
    verticalAlign: opts.vAlign ?? VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text: content,
            bold: opts.bold ?? false,
            size: opts.size ?? 20,   // 10pt default
            color: opts.color ?? BLACK,
            font: 'Arial',
          }),
        ],
      }),
    ],
  });
}

// ─── Bloom label helper ───────────────────────────────────────────────────────
const BLOOM_LABELS: Record<number, string> = {
  1: 'L1-Remember', 2: 'L2-Understand', 3: 'L3-Apply',
  4: 'L4-Analyze',  5: 'L5-Evaluate',   6: 'L6-Create',
};
function bloomLabel(level: number | null): string {
  if (!level) return '—';
  return BLOOM_LABELS[level] ?? `L${level}`;
}

// ─── Section heading paragraph ────────────────────────────────────────────────
function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR },
    },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,        // 12pt
        color: MID_BLUE,
        font: 'Arial',
        allCaps: true,
      }),
    ],
  });
}

// ─── Part A table ─────────────────────────────────────────────────────────────
// Columns: Q.No | Question (wide) | BL | CO | PO | Marks
// Total content width (A4, 2cm margins each side): 16838 - 2*1134 = ~14570 DXA

const TABLE_W = 9360; // US Letter 1" margins content width
const COL_QNUM   = 480;
const COL_Q      = TABLE_W - 480 - 700 - 700 - 700 - 700; // 6080
const COL_BL     = 1200;
const COL_CO     = 680;
const COL_PO     = 680;
const COL_MARKS  = 720;

function partATable(questions: SelectedQuestion[]): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell('Q.No', COL_QNUM, { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('Question', COL_Q,   { bold: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('BL', COL_BL,   { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('CO', COL_CO,   { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('PO', COL_PO,   { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('Marks', COL_MARKS, { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
    ],
  });

  const dataRows = questions.map((q, i) =>
    new TableRow({
      children: [
        cell(String(i + 1), COL_QNUM, { center: true, bold: true, shade: i % 2 === 0 ? WHITE : LIGHT_GRAY }),
        cell(q.question_text, COL_Q,   { shade: i % 2 === 0 ? WHITE : LIGHT_GRAY }),
        cell(bloomLabel(q.blooms_level), COL_BL, { center: true, shade: i % 2 === 0 ? WHITE : LIGHT_GRAY, size: 18 }),
        cell(q.course_outcome ?? '—',   COL_CO, { center: true, shade: i % 2 === 0 ? WHITE : LIGHT_GRAY, size: 18 }),
        cell(q.program_outcome ?? '—',  COL_PO, { center: true, shade: i % 2 === 0 ? WHITE : LIGHT_GRAY, size: 18 }),
        cell(String(q.marks),           COL_MARKS, { center: true, bold: true, shade: i % 2 === 0 ? WHITE : LIGHT_GRAY }),
      ],
    })
  );

  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [COL_QNUM, COL_Q, COL_BL, COL_CO, COL_PO, COL_MARKS],
    rows: [headerRow, ...dataRows],
  });
}

// ─── Part B single module block ───────────────────────────────────────────────
// Layout per module:
//   Module-N heading row (full width, shaded)
//   Q.No | sub | Question | BL | CO | PO | Marks
//   row: Qa    | a)  | text    | …
//   row:       | OR  |         |            ← separator
//   row: Qa    | b)  | text    | …

const PARTB_COL_QNUM  = 480;
const PARTB_COL_SUB   = 400;
const PARTB_COL_Q     = TABLE_W - 480 - 400 - 1200 - 680 - 680 - 720;
const PARTB_COL_BL    = 1200;
const PARTB_COL_CO    = 680;
const PARTB_COL_PO    = 680;
const PARTB_COL_MARKS = 720;

function partBModuleRows(
  moduleNumber: number,
  moduleLabel: string,
  startQNum: number,
  qa: SelectedQuestion,
  qb: SelectedQuestion,
): TableRow[] {
  const shade = moduleNumber % 2 === 0 ? 'EEF3FB' : WHITE;

  // Module heading row (spans all columns)
  const moduleHeadRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 7,
        width: { size: TABLE_W, type: WidthType.DXA },
        shading: { fill: MID_BLUE, type: ShadingType.CLEAR },
        borders: allBorders,
        margins: { top: 80, bottom: 80, left: 160, right: 120 },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: moduleLabel, bold: true, size: 20, color: WHITE, font: 'Arial' }),
              new TextRun({ text: `  (Answer either a or b)`, size: 18, color: 'DDEEFF', font: 'Arial', italics: true }),
            ],
          }),
        ],
      }),
    ],
  });

  // Question a row
  const qaRow = new TableRow({
    children: [
      cell(String(startQNum), PARTB_COL_QNUM, { center: true, bold: true, shade }),
      cell('a)', PARTB_COL_SUB, { center: true, bold: true, shade }),
      cell(qa.question_text, PARTB_COL_Q, { shade }),
      cell(bloomLabel(qa.blooms_level), PARTB_COL_BL, { center: true, shade, size: 18 }),
      cell(qa.course_outcome ?? '—',    PARTB_COL_CO, { center: true, shade, size: 18 }),
      cell(qa.program_outcome ?? '—',   PARTB_COL_PO, { center: true, shade, size: 18 }),
      cell(String(qa.marks), PARTB_COL_MARKS, { center: true, bold: true, shade }),
    ],
  });

  // OR separator row
  const orRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 7,
        width: { size: TABLE_W, type: WidthType.DXA },
        shading: { fill: 'FFF8E1', type: ShadingType.CLEAR },
        borders: { top: thinBorder, bottom: thinBorder, left: noBorder, right: noBorder },
        margins: { top: 40, bottom: 40, left: 120, right: 120 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'OR', bold: true, size: 20, color: 'B45309', font: 'Arial' }),
            ],
          }),
        ],
      }),
    ],
  });

  // Question b row
  const qbRow = new TableRow({
    children: [
      cell(String(startQNum), PARTB_COL_QNUM, { center: true, bold: true, shade }),
      cell('b)', PARTB_COL_SUB, { center: true, bold: true, shade }),
      cell(qb.question_text, PARTB_COL_Q, { shade }),
      cell(bloomLabel(qb.blooms_level), PARTB_COL_BL, { center: true, shade, size: 18 }),
      cell(qb.course_outcome ?? '—',    PARTB_COL_CO, { center: true, shade, size: 18 }),
      cell(qb.program_outcome ?? '—',   PARTB_COL_PO, { center: true, shade, size: 18 }),
      cell(String(qb.marks), PARTB_COL_MARKS, { center: true, bold: true, shade }),
    ],
  });

  return [moduleHeadRow, qaRow, orRow, qbRow];
}

function partBTable(modules: GeneratedPaper['part_b'], partACount: number): Table {
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell('Q.No', PARTB_COL_QNUM, { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('Sub', PARTB_COL_SUB,   { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('Question', PARTB_COL_Q,{ bold: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('BL', PARTB_COL_BL,     { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('CO', PARTB_COL_CO,     { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('PO', PARTB_COL_PO,     { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
      cell('Marks', PARTB_COL_MARKS,{bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 }),
    ],
  });

  let qNum = partACount + 1;
  const allModuleRows: TableRow[] = [];

  modules.forEach((mod) => {
    const rows = partBModuleRows(mod.module_number, mod.module_label, qNum, mod.question_a, mod.question_b);
    allModuleRows.push(...rows);
    qNum++;
  });

  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [PARTB_COL_QNUM, PARTB_COL_SUB, PARTB_COL_Q, PARTB_COL_BL, PARTB_COL_CO, PARTB_COL_PO, PARTB_COL_MARKS],
    rows: [headerRow, ...allModuleRows],
  });
}

// ─── Exam details table ───────────────────────────────────────────────────────
function examDetailsTable(config: GeneratedPaper['config']): Table {
  const w = TABLE_W / 4; // 4 equal columns
  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [w, w, w, w],
    rows: [
      new TableRow({
        children: [
          cell('Subject', w, { bold: true, shade: LIGHT_GRAY, size: 18 }),
          cell(config.subject_name || config.subject_code, w, { size: 18 }),
          cell('Course Code', w, { bold: true, shade: LIGHT_GRAY, size: 18 }),
          cell(config.subject_code, w, { size: 18 }),
        ],
      }),
      new TableRow({
        children: [
          cell('Max. Marks', w, { bold: true, shade: LIGHT_GRAY, size: 18 }),
          cell(String(config.total_marks), w, { size: 18 }),
          cell('Duration', w, { bold: true, shade: LIGHT_GRAY, size: 18 }),
          cell(config.duration, w, { size: 18 }),
        ],
      }),
    ],
  });
}

// ─── Bloom summary table ──────────────────────────────────────────────────────
function bloomSummaryTable(summary: Record<string, number>): Table {
  const levels = Object.entries(summary).filter(([, v]) => v > 0);
  const total = levels.reduce((a, [, v]) => a + v, 0);
  const colW = Math.floor(TABLE_W / levels.length);

  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: levels.map(() => colW),
    rows: [
      new TableRow({
        children: levels.map(([l]) =>
          cell(l, colW, { bold: true, center: true, shade: DARK_HEADER, color: 'FFFFFF', size: 18 })
        ),
      }),
      new TableRow({
        children: levels.map(([, v]) =>
          cell(`${v} (${Math.round(v / total * 100)}%)`, colW, { center: true, size: 18 })
        ),
      }),
    ],
  });
}

// ─── spacer / rule paragraph ──────────────────────────────────────────────────
function spacer(before = 160, after = 80): Paragraph {
  return new Paragraph({ spacing: { before, after }, children: [] });
}

function rule(): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR } },
    children: [],
  });
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportToDocx(paper: GeneratedPaper): Promise<void> {
  const { config } = paper;

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 20, color: BLACK }, // 10pt default
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },  // US Letter
            margin: { top: 864, right: 864, bottom: 864, left: 864 }, // 0.6" margins
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR } },
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: config.institution_name ?? 'Question Paper',
                    bold: true, size: 20, color: MID_BLUE, font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_CLR } },
                spacing: { before: 60 },
                children: [
                  new TextRun({ text: `${config.exam_name} | ${config.subject_code}  ·  Page `, size: 16, color: '888888', font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '888888', font: 'Arial' }),
                  new TextRun({ text: ' of ', size: 16, color: '888888', font: 'Arial' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '888888', font: 'Arial' }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ── Title block ───────────────────────────────────────────────────
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: (config.institution_name ?? '').toUpperCase(),
                bold: true, size: 28, color: DARK_HEADER, font: 'Arial', allCaps: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: config.exam_name,
                bold: true, size: 24, font: 'Arial', color: '2E4A8A',
              }),
            ],
          }),
          spacer(40, 120),

          // ── Exam details ──────────────────────────────────────────────────
          examDetailsTable(config),
          spacer(120, 60),

          // ── Instructions ─────────────────────────────────────────────────
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: 'Instructions: ', bold: true, size: 18, font: 'Arial', color: MID_BLUE }),
              new TextRun({ text: `Answer all ${config.part_a.question_count} questions in Part A. In Part B, answer one full question from each module.`, size: 18, font: 'Arial', italics: true }),
            ],
          }),
          rule(),
          spacer(80, 80),

          // ── PART A ────────────────────────────────────────────────────────
          sectionHeading('PART A'),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 120 },
            children: [
              new TextRun({
                text: `Answer all questions  (${config.part_a.question_count} × ${config.part_a.marks_per_question} = ${config.part_a.question_count * config.part_a.marks_per_question} Marks)`,
                size: 18, color: '555555', font: 'Arial', italics: true,
              }),
            ],
          }),
          partATable(paper.part_a),
          spacer(200, 100),

          // ── PART B ────────────────────────────────────────────────────────
          sectionHeading('PART B'),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 120 },
            children: [
              new TextRun({
                text: `Answer one full question from each module  (${config.part_b.modules.length} × ${config.part_b.marks_per_question} = ${config.part_b.modules.length * config.part_b.marks_per_question} Marks)`,
                size: 18, color: '555555', font: 'Arial', italics: true,
              }),
            ],
          }),
          partBTable(paper.part_b, config.part_a.question_count),
          spacer(200, 100),

          // ── Bloom's distribution summary ──────────────────────────────────
          new Paragraph({
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({ text: "Bloom's Taxonomy Summary", bold: true, size: 18, color: MID_BLUE, font: 'Arial' }),
            ],
          }),
          bloomSummaryTable(paper.bloom_summary),

          ...(paper.warnings.length > 0 ? [
            spacer(120, 60),
            new Paragraph({
              children: [
                new TextRun({ text: `⚠ Generation Notes: ${paper.warnings.join(' | ')}`, size: 16, color: 'B45309', italics: true, font: 'Arial' }),
              ],
            }),
          ] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (config.subject_code || 'paper').replace(/[^a-z0-9]/gi, '_');
  a.download = `${safeName}_${config.paper_type}_${new Date().getFullYear()}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
