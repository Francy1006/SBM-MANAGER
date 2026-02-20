import axios from 'axios';

const API_BASE = process.env.VUE_APP_API_URL || '/api/';
const API_USER = process.env.VUE_APP_API_USERNAME;
const API_PASS = process.env.VUE_APP_API_PASSWORD;

let authHeader = {};
if (API_USER && API_PASS) {
  const basicAuth = 'Basic ' + btoa(`${API_USER}:${API_PASS}`);
  authHeader = { Authorization: basicAuth };
}

const api = axios.create({
  baseURL: API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...authHeader
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('uuid');
      localStorage.removeItem('email');
      localStorage.removeItem('name');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;