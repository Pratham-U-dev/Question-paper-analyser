import axios from 'axios';

const baseURL = import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678/webhook-test';

export const api = axios.create({ baseURL });

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err.response?.data || err.message);
    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(message);
  }
);
