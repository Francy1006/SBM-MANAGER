import axios from 'axios';

const API_BASE = process.env.VUE_APP_API_URL || 'http://sbm-core:8000';

const api = axios.create({
  baseURL: API_BASE,
  // Puedes agregar headers globales aquí si lo necesitas
});

export default api; 