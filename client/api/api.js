// /client/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://06908233c2b3.ngrok-free.app",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
