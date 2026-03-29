import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

export const api = {
  uploadXRay: (formData) => axios.post(`${API_BASE}/xray`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getHealthScore: (profile) => axios.post(`${API_BASE}/health-score`, profile),
  
  getFirePlan: (inputs) => axios.post(`${API_BASE}/fire`, inputs),
  
  getGoalsPlan: (goalsData) => axios.post(`${API_BASE}/goals`, goalsData),
  
  getLifeEventAdvice: (eventData) => axios.post(`${API_BASE}/life-event`, eventData),
  
  getCouplePlan: (coupleData) => axios.post(`${API_BASE}/couple`, coupleData),
};
