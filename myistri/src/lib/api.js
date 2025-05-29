
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3009/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies automatically
});


export default api;
