/**
 * pdfExport.ts
 * Generates a PDF by opening the formatted paper in a new print window
 * and triggering window.print(). The user saves as PDF from the print dialog.
 *
 * This avoids any heavy PDF library dependency while still producing
 * a clean, properly formatted academic question paper layout.
 */

import type { GeneratedPaper, SelectedQuestion } from './paperGenerator';

const BLOOM_LABELS: Record<number, string> = {
  1: 'L1-Remember', 2: 'L2-Understand', 3: 'L3-Apply',
  4: 'L4-Analyze',  5: 'L5-Evaluate',   6: 'L6-Create',
};
const bloomLabel = (l: number | null) => l ? (BLOOM_LABELS[l] ?? `L${l}`) : '—';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function partARows(questions: SelectedQuestion[]): string {
  return questions.map((q, i) => `
    <tr class="${i % 2 === 0 ? '' : 'alt'}">
      <td class="center bold">${i + 1}</td>
      <td>${escapeHtml(q.question_text)}</td>
      <td class="center small">${bloomLabel(q.blooms_level)}</td>
      <td class="center small">${escapeHtml(q.course_outcome ?? '—')}</td>
      <td class="center small">${escapeHtml(q.program_outcome ?? '—')}</td>
      <td class="center bold">${q.marks}</td>
    </tr>
  `).join('');
}

function partBRows(modules: GeneratedPaper['part_b'], partACount: number): string {
  let qNum = partACount + 1;
  return modules.map(mod => {
    const qa = mod.question_a;
    const qb = mod.question_b;
    const html = `
      <tr class="module-head">
        <td colspan="7"><strong>${mod.module_label}</strong> <em>(Answer either a or b)</em></td>
      </tr>
      <tr>
        <td class="center bold">${qNum}</td>
        <td class="center bold">a)</td>
        <td>${escapeHtml(qa.question_text)}</td>
        <td class="center small">${bloomLabel(qa.blooms_level)}</td>
        <td class="center small">${escapeHtml(qa.course_outcome ?? '—')}</td>
        <td class="center small">${escapeHtml(qa.program_outcome ?? '—')}</td>
        <td class="center bold">${qa.marks}</td>
      </tr>
      <tr class="or-row">
        <td colspan="7"><strong>OR</strong></td>
      </tr>
      <tr>
        <td class="center bold">${qNum}</td>
        <td class="center bold">b)</td>
        <td>${escapeHtml(qb.question_text)}</td>
        <td class="center small">${bloomLabel(qb.blooms_level)}</td>
        <td class="center small">${escapeHtml(qb.course_outcome ?? '—')}</td>
        <td class="center small">${escapeHtml(qb.program_outcome ?? '—')}</td>
        <td class="center bold">${qb.marks}</td>
      </tr>
    `;
    qNum++;
    return html;
  }).join('');
}

function bloomSummaryHtml(summary: Record<string, number>): string {
  const entries = Object.entries(summary).filter(([, v]) => v > 0);
  const total = entries.reduce((a, [, v]) => a + v, 0);
  const headers = entries.map(([l]) => `<th>${l}</th>`).join('');
  const values  = entries.map(([, v]) => `<td>${v} (${Math.round(v/total*100)}%)</td>`).join('');
  return `<table class="bloom-table"><thead><tr>${headers}</tr></thead><tbody><tr>${values}</tr></tbody></table>`;
}

export function exportToPdf(paper: GeneratedPaper): void {
  const { config } = paper;
  const safeName = (config.subject_code || 'paper').replace(/[^a-z0-9]/gi, '_');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(config.exam_name)} — ${escapeHtml(config.subject_code)}</title>
  <style>
    @page { size: A4; margin: 15mm 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      color: #111;
      background: #fff;
    }

    /* ── Header ─────────────────────────────────────────────────── */
    .doc-header {
      text-align: center;
      border-bottom: 2px solid #2E4A8A;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .doc-header h1 {
      font-size: 13pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #1a1f36;
    }
    .doc-header h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #2E4A8A;
      margin-top: 4px;
    }

    /* ── Exam details grid ───────────────────────────────────────── */
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .details-table td {
      border: 1px solid #C0C8DC;
      padding: 4px 8px;
      font-size: 9pt;
    }
    .details-table td.label {
      font-weight: 700;
      background: #F2F4F8;
      width: 20%;
    }

    /* ── Instructions ────────────────────────────────────────────── */
    .instructions {
      font-size: 8.5pt;
      font-style: italic;
      color: #444;
      border-top: 1px solid #C0C8DC;
      border-bottom: 1px solid #C0C8DC;
      padding: 5px 0;
      margin-bottom: 12px;
    }
    .instructions strong { color: #2E4A8A; }

    /* ── Section heading ─────────────────────────────────────────── */
    .section-heading {
      text-align: center;
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #2E4A8A;
      background: #EEF3FB;
      padding: 6px 0;
      border: 1px solid #C0C8DC;
      margin: 10px 0 4px;
    }
    .section-sub {
      text-align: center;
      font-size: 8.5pt;
      font-style: italic;
      color: #555;
      margin-bottom: 8px;
    }

    /* ── Question tables ─────────────────────────────────────────── */
    .q-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
    }
    .q-table th {
      background: #1a1f36;
      color: #fff;
      padding: 5px 6px;
      font-size: 8.5pt;
      font-weight: 700;
      border: 1px solid #3a4060;
    }
    .q-table td {
      border: 1px solid #C0C8DC;
      padding: 5px 6px;
      font-size: 9pt;
      vertical-align: top;
    }
    .q-table tr.alt td { background: #F2F4F8; }
    .q-table .center { text-align: center; }
    .q-table .bold   { font-weight: 700; }
    .q-table .small  { font-size: 8pt; }

    /* ── Module row ─────────────────────────────────────────────── */
    .module-head td {
      background: #2E4A8A;
      color: #fff;
      font-size: 9pt;
      padding: 5px 8px;
    }
    .module-head em { color: #CCDCF5; font-size: 8pt; }

    /* ── OR row ─────────────────────────────────────────────────── */
    .or-row td {
      text-align: center;
      background: #FFF8E1;
      color: #B45309;
      font-weight: 700;
      font-size: 9pt;
      padding: 4px;
      border-color: #E5C97A;
    }

    /* ── Bloom summary ───────────────────────────────────────────── */
    .bloom-section {
      margin-top: 14px;
    }
    .bloom-title {
      font-weight: 700;
      font-size: 9pt;
      color: #2E4A8A;
      margin-bottom: 5px;
    }
    .bloom-table {
      width: 100%;
      border-collapse: collapse;
    }
    .bloom-table th {
      background: #1a1f36;
      color: #fff;
      text-align: center;
      padding: 4px 6px;
      font-size: 8.5pt;
      border: 1px solid #3a4060;
    }
    .bloom-table td {
      text-align: center;
      border: 1px solid #C0C8DC;
      padding: 4px 6px;
      font-size: 8.5pt;
    }

    /* ── Warnings ─────────────────────────────────────────────────── */
    .warnings {
      margin-top: 10px;
      padding: 6px 10px;
      background: #FFF8E1;
      border: 1px solid #E5C97A;
      border-radius: 4px;
      font-size: 8pt;
      color: #7C4A00;
      font-style: italic;
    }

    /* ── Print button (hidden on print) ───────────────────────────── */
    @media screen {
      .print-btn-bar {
        position: fixed; top: 0; left: 0; right: 0;
        background: #1a1f36; padding: 10px 20px;
        display: flex; gap: 10px; align-items: center; z-index: 999;
      }
      .print-btn-bar button {
        padding: 7px 18px; border-radius: 6px; border: none; cursor: pointer;
        font-size: 13px; font-weight: 700;
      }
      .btn-print { background: #2E4A8A; color: #fff; }
      .btn-close { background: #374151; color: #ccc; }
      body { padding-top: 56px; }
    }
    @media print {
      .print-btn-bar { display: none !important; }
      body { padding-top: 0; }
    }
  </style>
</head>
<body>
  <!-- Print controls (screen only) -->
  <div class="print-btn-bar">
    <span style="color:#9ba3b8;font-size:13px;font-weight:600;flex:1">${escapeHtml(config.exam_name)} — ${escapeHtml(config.subject_code)}</span>
    <button class="btn-print" onclick="window.print()">🖨 Print / Save as PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>

  <!-- Document content -->
  <div class="doc-header">
    <h1>${escapeHtml(config.institution_name ?? 'Question Paper')}</h1>
    <h2>${escapeHtml(config.exam_name)}</h2>
  </div>

  <table class="details-table">
    <tr>
      <td class="label">Subject</td>
      <td>${escapeHtml(config.subject_name || config.subject_code)}</td>
      <td class="label">Course Code</td>
      <td>${escapeHtml(config.subject_code)}</td>
    </tr>
    <tr>
      <td class="label">Max. Marks</td>
      <td>${config.total_marks}</td>
      <td class="label">Duration</td>
      <td>${escapeHtml(config.duration)}</td>
    </tr>
  </table>

  <div class="instructions">
    <strong>Instructions:</strong>
    Answer all ${config.part_a.question_count} questions in Part A.
    In Part B, answer one full question (either a or b) from each module.
    Each question carries the marks stated alongside.
  </div>

  <!-- PART A -->
  <div class="section-heading">PART A</div>
  <div class="section-sub">Answer all questions &nbsp;(${config.part_a.question_count} × ${config.part_a.marks_per_question} = ${config.part_a.question_count * config.part_a.marks_per_question} Marks)</div>
  <table class="q-table">
    <thead>
      <tr>
        <th style="width:4%">Q.No</th>
        <th>Question</th>
        <th style="width:11%">Bloom's Level</th>
        <th style="width:5%">CO</th>
        <th style="width:5%">PO</th>
        <th style="width:5%">Marks</th>
      </tr>
    </thead>
    <tbody>
      ${partARows(paper.part_a)}
    </tbody>
  </table>

  <!-- PART B -->
  <div class="section-heading">PART B</div>
  <div class="section-sub">Answer one full question from each module &nbsp;(${config.part_b.modules.length} × ${config.part_b.marks_per_question} = ${config.part_b.modules.length * config.part_b.marks_per_question} Marks)</div>
  <table class="q-table">
    <thead>
      <tr>
        <th style="width:4%">Q.No</th>
        <th style="width:4%">Sub</th>
        <th>Question</th>
        <th style="width:11%">Bloom's Level</th>
        <th style="width:5%">CO</th>
        <th style="width:5%">PO</th>
        <th style="width:5%">Marks</th>
      </tr>
    </thead>
    <tbody>
      ${partBRows(paper.part_b, config.part_a.question_count)}
    </tbody>
  </table>

  <!-- Bloom summary -->
  <div class="bloom-section">
    <div class="bloom-title">Bloom's Taxonomy Distribution (Achieved)</div>
    ${bloomSummaryHtml(paper.bloom_summary)}
  </div>

  ${paper.warnings.length > 0 ? `
  <div class="warnings">
    ⚠ Generation notes: ${paper.warnings.map(escapeHtml).join(' | ')}
  </div>` : ''}

  <script>
    // Auto-focus for immediate Ctrl+P support
    window.addEventListener('load', () => window.focus());
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) {
    // Fallback: download the HTML file
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}_paper.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  // Revoke after a delay
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
