import axios from 'axios';

// Resolve Backend API Base URL dynamically
const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const analyzeCompany = async (companyName) => {
  const response = await axios.post(`${API}/api/analyze`, { company: companyName });
  return response.data;
};

export const getSearchHistory = async () => {
  const response = await axios.get(`${API}/api/history`);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await axios.delete(`${API}/api/report/${id}`);
  return response.data;
};

export const getMarketMovers = async () => {
  const response = await axios.get(`${API}/api/market-movers`);
  return response.data;
};
