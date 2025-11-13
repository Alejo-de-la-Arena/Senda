//AUTH.JS
import { api } from './api';

export async function login(email, password) {
  const res = await api.post('/users/auth/login', { email, password });
  return res.data;
}

export async function signup(data) {
  const res = await api.post('/users', data);
  return res.data;
}