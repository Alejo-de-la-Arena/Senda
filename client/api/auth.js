//AUTH.JS
import { api } from "./api";

export async function login(email, password) {
  const res = await api.post("/users/auth/login", { email, password });
  return res.data;
}

export async function signup(data) {
  const sexMap = {
    Masculino: "male",
    Femenino: "female",
    Otro: "other",
  };

  const activityMap = {
    Sedentaria: "sedentary",
    Ligera: "light",
    Moderada: "moderate",
    Activa: "active",
    "Muy activa": "very_active",
  };

  const goalMap = {
    "Pérdida de grasa": "weight_loss",
    Mantenimiento: "maintenance",
    "Ganar masa muscular": "muscle_gain",
    Rendimiento: "performance",
  };

  const body = {
    ...data,
    sex: sexMap[data.sex] || "other",
    activity_level: activityMap[data.activity_level] || null,
    primary_goal: goalMap[data.primary_goal] || null,
  };

  const res = await api.post("/users", body);
  return res.data;
}
