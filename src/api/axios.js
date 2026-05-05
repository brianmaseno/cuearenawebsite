import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${window.location.origin}/api`,
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
