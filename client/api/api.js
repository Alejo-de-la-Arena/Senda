// /client/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://b81b8ad915cd.ngrok-free.app",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
