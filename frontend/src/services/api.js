import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5001';
  }
  return 'https://ai-ltx7.onrender.com';
};

const API_URL = getApiUrl();

export const analyzeCompany = async (companyName) => {
  const response = await axios.post(`${API_URL}/api/analyze`, { company: companyName });
  return response.data;
};

export const getSearchHistory = async () => {
  const response = await axios.get(`${API_URL}/api/history`);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await axios.delete(`${API_URL}/api/report/${id}`);
  return response.data;
};

export const getMarketMovers = async () => {
  const response = await axios.get(`${API_URL}/api/market-movers`);
  return response.data;
};
