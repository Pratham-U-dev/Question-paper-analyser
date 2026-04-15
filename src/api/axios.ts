import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5678',
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('--- Axios Network Error Debug ---');
    console.error('Full Error Object:', err);
    if (err.response) {
      console.error('Response Data:', err.response.data);
      console.error('Response Status:', err.response.status);
      console.error('Response Headers:', err.response.headers);
    } else if (err.request) {
      console.error('Request Object (No response received):', err.request);
      console.error('This usually means the server is down, unreachable, or CORS is blocking the request.');
    } else {
      console.error('Error Message:', err.message);
    }
    console.error('Config:', err.config);
    console.error('---------------------------------');

    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(message);
  }
);
