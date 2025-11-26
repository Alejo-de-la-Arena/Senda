// api/profesionales.js
import { api } from "./api";

// Obtener todos los entrenadores (GET /trainers)
export async function getAllTrainers() {
  const res = await api.get("/trainers");
  return res.data; // array de perfiles
}

// Crear perfil de entrenador (POST /trainers)
export async function createTrainerProfile(body) {
  const res = await api.post("/trainers", body);
  return res.data;
}

// Obtener perfil propio del usuario logueado (GET /trainers/user/:id)
export async function getTrainerProfileByUser(userId) {
  const res = await api.get(`/trainers/user/${userId}`);
  return res.data;
}

// Editar perfil
export async function updateTrainerProfile(trainerId, patch) {
  const res = await api.put(`/trainers/${trainerId}`, patch);
  return res.data;
}

// Eliminar perfil
export async function deleteTrainerProfile(trainerId) {
  const res = await api.delete(`/trainers/${trainerId}`);
  return res.data;
}

export async function connectWithTrainer(trainerProfileId) {
  const res = await api.post("/user-trainer", {
    trainer_profile_id: trainerProfileId,
  });
  return res.data; // { ok: true, alreadyLinked: boolean }
}
