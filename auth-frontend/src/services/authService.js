import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/register', { 
      firstName, 
      lastName, 
      email, 
      password 
    });
    return response.data;
  },

  getUserData: async () => {
    const response = await api.get('/data/user');
    return response.data;
  },

  getAdminData: async () => {
    const response = await api.get('/data/admin');
    return response.data;
  }
};

export default api;
