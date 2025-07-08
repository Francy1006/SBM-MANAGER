import api from './axios';

export const getFranchises = () => api.get('/api/franchises/');
export const getFranchiseStates = () => api.get('/api/franchise-states/');
export const createFranchise = (data) => api.post('/api/franchises/', data);
export const updateFranchise = (id, data) => api.put(`/api/franchises/${id}/`, data);
export const deleteFranchise = (id) => api.delete(`/api/franchises/${id}/`); 