import axios from 'axios';

// Backend base URL (10.0.2.2 = localhost for Android emulator)
const API_URL = 'http://10.0.2.2:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Calls POST /login
export async function login(email: string, password: string) {
  const response = await api.post('/login', { email, password });
  return response.data; // Changed from res.data to response.data
}

// Calls POST /signup
export async function signup(name: string, email: string, password: string) {
  const res = await api.post('/signup', { name, email, password });
  return res.data; // includes success message or token
}