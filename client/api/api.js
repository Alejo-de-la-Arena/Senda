// /client/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://fe0f645e0437.ngrok-free.app",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
