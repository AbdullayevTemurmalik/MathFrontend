import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Backend porti (api prefiksisiz)
});

// Har bir so'rovga tokenni avtomatik qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 va 403 xatoligida avtomatik chiqish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('admin_unlocked');
      window.location.href = '/login';
    }
    if (error.response && error.response.status === 403) {
      console.error("Ruxsat yo'q (403). Iltimos, admin bo'lib kiring.");
    }
    return Promise.reject(error);
  }
);

export default api;
