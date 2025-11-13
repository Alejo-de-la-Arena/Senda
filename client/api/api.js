// /client/api/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});
