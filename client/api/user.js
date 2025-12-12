import { api } from "./api";
const STORAGE_KEY = "senda.session";
import * as SecureStore from "expo-secure-store";
// El interceptor de api ya pone Authorization: Bearer <access_token>
export async function getMe() {
  const res = await api.get("/users/me");

  return res.data;
}

export async function updateMe(patch) {
  const res = await api.patch("/users/me", patch);
  return res.data; // { ok: true }
}

export async function getMyTraining() {
  // 1) Leer sesión desde SecureStore
  const raw = await SecureStore.getItemAsync(STORAGE_KEY);
  let token = null;

  if (raw) {
    try {
      const session = JSON.parse(raw);
      token = session?.access_token || null;
    } catch (e) {
      console.log("[getMyTraining] Error parseando session:", e);
    }
  } else {
    console.log("[getMyTraining] No hay session en SecureStore");
  }

  // 2) Hacer la request con Authorization forzado
  const { data } = await api.get("/users/me/training", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}, // si algo salió mal, va vacío (y el back va a tirar 401 igual)
  });

  return data;
}

export async function generateAIWorkout(payload) {
  const { data } = await api.post("/ai/workout/generate", payload, {
    timeout: 90000, // 30 segundos para este endpoint
  });
  return data;
}
