import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000', // Change to your backend URL if needed
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if you use cookies for auth
});

// Attach token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler (optional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here (e.g., logout on 401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const apiGet = (url, config) => api.get(url, config);
export const apiPost = (url, data, config) => api.post(url, data, config);
export const apiPut = (url, data, config) => api.put(url, data, config);
export const apiDelete = (url, config) => api.delete(url, config);

export default api; 