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

export async function getMyUsers() {
  const res = await api.get("/user-trainer/my-users");
  return res.data; // array de filas de la view UserTrainerWithUser
}

export async function getUserTrainingForTrainer(userId) {
  const { data } = await api.get(`/program/trainer/users/${userId}/training`);
  return data;
}

//listar programas del trainer
export async function getMyPrograms() {
  const { data } = await api.get("/program/trainer/programs");
  return data.programs || [];
}

// asignar programa a un usuario
export async function assignProgramToUser(userId, programId, startDate) {
  const { data } = await api.post(
    `/program/trainer/users/${userId}/assign-program`,
    {
      program_id: programId,
      start_date: startDate, // opcional, "YYYY-MM-DD"
    }
  );
  return data;
}

/**
 * Crea un programa de entrenamiento a partir de un CSV.
 * csvText: contenido del archivo CSV como string.
 * Los demás campos pueden ir vacíos por ahora (goal, level, duration_weeks).
 */
export async function createProgramFromCsv({
  title,
  goal,
  level,
  duration_weeks,
  csvText,
}) {
  const { data } = await api.post("/program/trainer/programs/from-csv", {
    title,
    goal: goal || null,
    level: level || null,
    duration_weeks: duration_weeks || null,
    csv: csvText,
  });

  return data; // { ok, program_id, workouts_created, exercises_created }
}
