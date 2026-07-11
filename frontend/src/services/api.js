import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeCompany = async (companyName) => {
  const response = await API.post('/analyze', { company: companyName });
  return response.data;
};

export const getSearchHistory = async () => {
  const response = await API.get('/history');
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await API.delete(`/report/${id}`);
  return response.data;
};
