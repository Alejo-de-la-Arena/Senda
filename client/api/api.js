// /client/api/api.js 
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: "https://016068112238.ngrok-free.app",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("senda_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.log("[api] Error leyendo token de AsyncStorage:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
