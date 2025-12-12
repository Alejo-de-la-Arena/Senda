// /client/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://ee5c27b33af5.ngrok-free.app",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
