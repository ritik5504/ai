import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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
