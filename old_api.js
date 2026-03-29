import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const api = {
  uploadXRay: (formData) => axios.post(`${API_BASE}/xray`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // New X-Ray API (direct to new router)
  uploadCAMSStatement: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('http://localhost:8000/xray/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // New Couples API
  analyzeCouples: (data) => axios.post('http://localhost:8000/couples/analyze', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  
  getHealthScore: (profile) => axios.post(`${API_BASE}/health-score`, profile),
  
  getFirePlan: (inputs) => axios.post(`${API_BASE}/fire`, inputs),
  
  getGoalsPlan: (goalsData) => axios.post(`${API_BASE}/goals`, goalsData),
  
  getLifeEventAdvice: (eventData) => axios.post(`${API_BASE}/life-event`, eventData),
  
  getCouplePlan: (coupleData) => axios.post(`${API_BASE}/couple`, coupleData),
};
