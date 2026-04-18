import { api } from './axios';

// Upload paper to N8N Vision workflow
export const uploadPaper = (formData: FormData): Promise<any> => {
  return api.post('/e73ea951-993b-4149-9b8e-076a0fd07879', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getAnalyticsSummary = (subjectCode: string): Promise<any> => {
  return api.get(`/analytics/summary?subject_code=${subjectCode}`);
};

export const getAnalyticsFrequency = (subjectCode: string): Promise<any> => {
  return api.get(`/analytics/frequency?subject_code=${subjectCode}`);
};

export const getAnalyticsBlooms = (subjectCode: string): Promise<any> => {
  return api.get(`/analytics/blooms?subject_code=${subjectCode}`);
};

export const getAnalyticsHeatmap = (subjectCode: string): Promise<any> => {
  return api.get(`/analytics/heatmap?subject_code=${subjectCode}`);
};

export const getAnalyticsWordcloud = (subjectCode: string, part: string = 'A'): Promise<any> => {
  return api.get(`/analytics/wordcloud?subject_code=${subjectCode}&part=${part}`);
};

export const getQuestions = (subjectCode: string, page: number = 1, limit: number = 50): Promise<any> => {
  return api.get(`/questions?subject_code=${subjectCode}&page=${page}&limit=${limit}`);
};

export const generatePaper = (data: any): Promise<any> => {
  return api.post('/generate/paper', data);
};

export const getSubjects = (): Promise<any> => {
  return api.get('/subjects');
};
