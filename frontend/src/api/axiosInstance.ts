import axios from 'axios';
import { apiBaseUrl } from './config';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('member_user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      sessionStorage.removeItem('admin_reset_token');
    }
    return Promise.reject(error);
  }
);

export default api;
