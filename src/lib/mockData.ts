export const mockSummary = {
  subject_code: "21CS61",
  total_papers_analyzed: 10,
  total_questions_extracted: 200,
  unique_question_groups: 87,
  high_risk_questions: 12,
  most_tested_module: 2,
  dominant_bloom_level: "L2 - Understand",
  avg_ocr_confidence: 0.91
};

export const mockFrequency = {
  chart_data: {
    labels: ["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"],
    datasets: [
      { label: "Unique Questions", data: [7, 9, 6, 8, 5] },
      { label: "Total Appearances", data: [16, 22, 14, 19, 11] }
    ]
  }
};

export const mockBlooms = {
  chart_data: {
    labels: ["L1 Remember", "L2 Understand", "L3 Apply", "L4 Analyze", "L5 Evaluate", "L6 Create"],
    data: [8, 24, 20, 15, 6, 3],
    colors: ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#F44336", "#00BCD4"]
  }
};

export const mockHeatmap = {
  subject_code: "21CS61",
  years: [2019, 2020, 2021, 2022, 2023],
  modules: [1, 2, 3, 4, 5],
  matrix: [
    [2, 3, 2, 1, 2],
    [2, 2, 3, 2, 1],
    [3, 2, 1, 2, 2],
    [2, 3, 2, 3, 2],
    [3, 2, 3, 2, 3]
  ]
};

export const mockWordcloud = {
  word_frequencies: [
    { text: "protocol", value: 18 },
    { text: "routing", value: 14 },
    { text: "TCP", value: 12 },
    { text: "OSI", value: 11 },
    { text: "network", value: 20 },
    { text: "layer", value: 15 },
    { text: "IP", value: 16 },
    { text: "topology", value: 9 },
    { text: "bandwidth", value: 8 },
    { text: "algorithm", value: 10 },
    { text: "packet", value: 13 },
    { text: "socket", value: 7 }
  ]
};

export const mockQuestions = [
  {
    id: "uuid-1",
    question_number: "5",
    question_text: "Explain the working of TCP/IP protocol stack with a neat diagram.",
    part: "B",
    module: 3,
    marks: 10,
    bloom_level: "L2 - Understand",
    exam_year: 2023,
    paper_type: "semester",
    ocr_confidence: 0.91,
    group_id: "group-uuid",
    frequency: 4
  },
  {
    id: "uuid-2",
    question_number: "1",
    question_text: "Define OSI model. List the layers in order.",
    part: "A",
    module: 1,
    marks: 2,
    bloom_level: "L1 - Remember",
    exam_year: 2022,
    paper_type: "semester",
    ocr_confidence: 0.95,
    group_id: "group-uuid-2",
    frequency: 5
  },
  {
    id: "uuid-3",
    question_number: "3a",
    question_text: "Compare IPv4 and IPv6 headers. What are the advantages of IPv6?",
    part: "B",
    module: 2,
    marks: 8,
    bloom_level: "L4 - Analyze",
    exam_year: 2021,
    paper_type: "semester",
    ocr_confidence: 0.88,
    group_id: "group-uuid-3",
    frequency: 3
  },
  {
    id: "uuid-4",
    question_number: "7b",
    question_text: "Apply Dijkstra's algorithm to find the shortest path for the given network topology.",
    part: "B",
    module: 4,
    marks: 10,
    bloom_level: "L3 - Apply",
    exam_year: 2023,
    paper_type: "semester",
    ocr_confidence: 0.92,
    group_id: "group-uuid-4",
    frequency: 2
  }
];

export const mockGeneratedPaper = {
  validation: {
    bloom_balance_score: 0.85,
    warnings: []
  },
  part_a_questions: [
    { question_number: "1", text: "Define OSI model.", marks: 2, bloom_level: "L1" },
    { question_number: "2", text: "What is a socket?", marks: 2, bloom_level: "L1" },
    { question_number: "3", text: "Explain DNS.", marks: 2, bloom_level: "L2" },
    { question_number: "4", text: "Define bandwidth.", marks: 2, bloom_level: "L1" },
    { question_number: "5", text: "What is HTTP?", marks: 2, bloom_level: "L1" },
  ],
  part_b_modules: [
    {
      module: 1,
      question_a: { text: "Explain OSI layers in detail.", marks: 10, bloom_level: "L2" },
      question_b: { text: "Compare OSI and TCP/IP models.", marks: 10, bloom_level: "L4" }
    },
    {
      module: 2,
      question_a: { text: "Explain IPv4 addressing.", marks: 10, bloom_level: "L2" },
      question_b: { text: "What is subnetting? Explain with example.", marks: 10, bloom_level: "L3" }
    }
  ]
};
