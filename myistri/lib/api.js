// c:\Users\MyBook Hype AMD\Desktop\nextJs lagi dah\myistri\lib\api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3009/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS if you use cookies, but for token auth, the interceptor is key
});

// Request interceptor to add the token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling 401 errors globally
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Token might be expired or invalid
//       localStorage.removeItem('token');
//       // Redirect to login page, or show a message
//       // Example: window.location.href = '/Login';
//       console.error("Unauthorized access - 401. Token removed. Redirecting to login might be needed.");
//     }
//     return Promise.reject(error);
//   }
// );


export default api;
