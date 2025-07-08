import axios from 'axios';

const API_BASE = process.env.VUE_APP_API_URL;
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
  headers: authHeader,
});

export default api; 