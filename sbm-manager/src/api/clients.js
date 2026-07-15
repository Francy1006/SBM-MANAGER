import axios from 'axios';

const normalizeBaseUrl = (url) => {
  const baseUrl = url || '/api/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

const buildBasicAuthHeader = (username, password) => {
  if (!username || !password) return {};
  return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
};

const clearSbmSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('uuid');
  localStorage.removeItem('email');
  localStorage.removeItem('name');

  if (window.location.hash !== '#/login') {
    window.location.hash = '#/login';
  }
};

const createApiClient = ({
  baseURL,
  basicUsername,
  basicPassword,
  useSbmBearer = false,
  clearSessionOnUnauthorized = false,
}) => {
  const client = axios.create({
    baseURL: normalizeBaseUrl(baseURL),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...buildBasicAuthHeader(basicUsername, basicPassword),
    },
    timeout: 10000,
  });

  if (useSbmBearer) {
    client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (clearSessionOnUnauthorized && error.response?.status === 401) {
        clearSbmSession();
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const legacyApiUrl = process.env.VUE_APP_API_URL;
const apiUsername = process.env.VUE_APP_API_USERNAME;
const apiPassword = process.env.VUE_APP_API_PASSWORD;

export const sbmApi = createApiClient({
  baseURL: process.env.VUE_APP_SBM_API_URL || legacyApiUrl,
  basicUsername: apiUsername,
  basicPassword: apiPassword,
  useSbmBearer: true,
  clearSessionOnUnauthorized: true,
});

export const dpApi = createApiClient({
  baseURL: process.env.VUE_APP_DP_API_URL,
  basicUsername: process.env.VUE_APP_DP_API_USERNAME || apiUsername,
  basicPassword: process.env.VUE_APP_DP_API_PASSWORD || apiPassword,
});

