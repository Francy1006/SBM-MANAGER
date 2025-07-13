import axios from 'axios';

// Configuración por defecto si no hay variables de entorno
const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:8082/api';
const API_USER = process.env.VUE_APP_API_USERNAME;
const API_PASS = process.env.VUE_APP_API_PASSWORD;

// Configura autenticación Basic si hay usuario y password
let authHeader = {};
if (API_USER && API_PASS) {
  const basicAuth = 'Basic ' + btoa(`${API_USER}:${API_PASS}`);
  authHeader = { Authorization: basicAuth };
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...authHeader
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // Agregar token de autenticación si existe
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores y redirección por token expirado
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (Unauthorized), limpiar token y redirigir al login
    if (error.response?.status === 401) {
      // Limpiar datos de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('uuid');
      localStorage.removeItem('email');
      localStorage.removeItem('name');
      
      // Redirigir al login solo si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 