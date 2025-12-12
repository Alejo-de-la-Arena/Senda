// routes/program.js
// Rutas relacionadas a programas de entrenamiento desde la perspectiva del ENTRENADOR.
// Incluye:
// - Obtener perfil de entrenador a partir del usuario logueado
// - Listar programas del entrenador
// - Ver el programa asignado de un usuario
// - Asignar un programa a un usuario

const router = require("express").Router();
const { supabaseAnon, supabaseService } = require("../lib/supabase");
const { validate, z } = require("../middleware/validate");
const { parse } = require("csv-parse/sync");

/**
 * Helper: obtiene el TrainerProfile asociado al usuario logueado.
 *
 * Flujo:
 *  1) Lee el auth_uid desde req.user.id (Supabase auth).
 *  2) Usa el cliente de servicio para buscar User.id donde User.auth_uid = auth_uid.
 *  3) Usa ese User.id para buscar TrainerProfile.user_id con el cliente anon (o service).
 */
async function getTrainerProfile(_sbAnon, req) {
  const authUid = req.user?.id; // este es el uuid de Supabase

  if (!authUid) {
    console.log("[getTrainerProfile] Sin authUid en req.user:", req.user);
    return { error: "No autenticado", profile: null };
  }

  // 1) Buscar User.id usando el cliente de servicio (sin RLS → evitamos stack depth)
  const sbService = supabaseService();
  const { data: user, error: userError } = await sbService
    .from("User")
    .select("id")
    .eq("auth_uid", authUid)
    .single();

  if (userError || !user) {
    console.log("[getTrainerProfile] No se encontró User para auth_uid", {
      authUid,
      userError,
    });
    return { error: "Usuario de app no encontrado", profile: null };
  }

  // 2) Buscar TrainerProfile para ese User.id
  // Podés usar anon o service, acá da igual, uso anon por consistencia:
  const sbAnon = supabaseAnon();
  const { data: profile, error: trainerError } = await sbAnon
    .from("TrainerProfile")
    .select("id, user_id")
    .eq("user_id", user.id)
    .single();

  if (trainerError || !profile) {
    console.log(
      "[getTrainerProfile] No se encontró TrainerProfile para user_id",
      user.id,
      "error:",
      trainerError
    );
    return {
      error: "No se encontró perfil de entrenador para este usuario",
      profile: null,
    };
  }

  return { error: null, profile };
}

/**
 * GET /trainer/programs
 * Lista todos los programas de entrenamiento creados por el entrenador logueado.
 * Se usa para que el trainer elija qué programa asignar a un alumno.
 */
router.get("/trainer/programs", async (req, res) => {
  const sb = supabaseAnon();

  const { error, profile } = await getTrainerProfile(sb, req);
  if (error) {
    return res.status(401).json({ error });
  }

  const trainerId = profile.id;

  const { data, error: programsError } = await sb
    .from("TrainingProgram")
    .select("id, title, goal, level, duration_weeks, created_at")
    .eq("trainer_id", trainerId)
    .order("created_at", { ascending: false });

  if (programsError) {
    console.error("Error listando programas del trainer", programsError);
    return res.status(500).json({ error: "Error interno listando programas." });
  }

  return res.json({ programs: data || [] });
});

/**
 * GET /trainer/users/:userId/training
 * Devuelve el programa ACTIVO asignado a un usuario:
 * - Si no tiene programa activo -> { hasProgram: false }
 * - Si tiene -> { hasProgram: true, program, workouts[] con ejercicios }
 * Es lo que usa la pantalla del trainer para ver el entrenamiento de un alumno.
 */
router.get("/trainer/users/:userId/training", async (req, res) => {
  const sb = supabaseService();
  const userId = Number(req.params.userId);

  if (Number.isNaN(userId)) {
    return res.status(400).json({ error: "userId inválido" });
  }

  try {
    // 1) Buscar programa activo del usuario
    const { data: assignments, error: assError } = await sb
      .from("UserProgramAssignment")
      .select("id, program_id, status, start_date")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("start_date", { ascending: false })
      .limit(1);

    if (assError) {
      console.error("Error buscando UserProgramAssignment", assError);
      return res
        .status(500)
        .json({ error: "Error interno buscando el programa asignado." });
    }

    if (!assignments || assignments.length === 0) {
      return res.json({ hasProgram: false });
    }

    const assignment = assignments[0];
    const programId = assignment.program_id;

    // 2) Info del programa
    const { data: program, error: programError } = await sb
      .from("TrainingProgram")
      .select("id, title, goal, level, duration_weeks")
      .eq("id", programId)
      .single();

    if (programError || !program) {
      console.error("Error buscando TrainingProgram", programError);
      return res
        .status(500)
        .json({ error: "No se encontró información del programa." });
    }

    // 3) Workouts + ejercicios (sin related order)
    const { data: workoutsRaw, error: workoutsError } = await sb
      .from("Workout")
      .select(
        `
        id,
        day_number,
        title,
        notes,
        WorkoutExercise (
          id,
          exercise_id,
          sequence_order,
          sets,
          reps,
          rest_sec,
          Exercise (
            id,
            name
          )
        )
      `
      )
      .eq("program_id", programId)
      .order("day_number", { ascending: true });

    if (workoutsError) {
      console.error("Error buscando Workouts", workoutsError);
      return res
        .status(500)
        .json({ error: "Error cargando los días de entrenamiento." });
    }

    // 4) Mapear y ordenar ejercicios por sequence_order en JS
    const workouts = (workoutsRaw || []).map((w) => {
      const exercisesSorted = (w.WorkoutExercise || []).slice().sort((a, b) => {
        const sa = a.sequence_order ?? 0;
        const sb = b.sequence_order ?? 0;
        return sa - sb;
      });

      return {
        id: w.id,
        day_number: w.day_number,
        title: w.title,
        notes: w.notes,
        exercises: exercisesSorted.map((we) => ({
          id: we.id,
          name: we.Exercise?.name || "Ejercicio sin nombre",
          sets: we.sets,
          reps: we.reps,
          rest_sec: we.rest_sec,
        })),
      };
    });

    return res.json({
      hasProgram: true,
      program,
      workouts,
    });
  } catch (err) {
    console.error("Error en GET /trainer/users/:userId/training", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

/**
 * POST /trainer/users/:userId/assign-program
 * Asigna un programa (del trainer logueado) a un usuario.
 * - Verifica que el programa pertenezca al trainer
 * - Marca otros programas activos del user como 'ended'
 * - Crea un UserProgramAssignment con status 'active'
 */
router.post(
  "/trainer/users/:userId/assign-program",
  validate(
    z.object({
      program_id: z.number().int().min(1),
      start_date: z.string().optional(), // "YYYY-MM-DD"
    })
  ),
  async (req, res) => {
    // Para todo este flujo pesado, usamos service role
    const sb = supabaseService();
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "userId inválido" });
    }

    const { program_id, start_date } = req.validated;

    // 1) Obtener trainer_id desde el usuario logueado
    const { error, profile } = await getTrainerProfile(sb, req);
    if (error) {
      return res.status(401).json({ error });
    }
    const trainerId = profile.id;

    // 2) Verificar que ese programa pertenece a este trainer
    const { data: program, error: programError } = await sb
      .from("TrainingProgram")
      .select("id, trainer_id")
      .eq("id", program_id)
      .single();

    if (programError || !program) {
      return res.status(404).json({ error: "Programa no encontrado." });
    }

    if (program.trainer_id !== trainerId) {
      return res
        .status(403)
        .json({ error: "No podés asignar un programa que no es tuyo." });
    }

    // 3) Desactivar programas activos previos del usuario (si los hay)
    const { error: updateError } = await sb
      .from("UserProgramAssignment")
      .update({ status: "ended" })
      .eq("user_id", userId)
      .eq("status", "active");

    if (updateError) {
      console.error("Error desactivando programas previos", updateError);
      // seguimos igual, pero podrías cortar acá si querés ser más estricto
    }

    // 4) Crear nuevo assignment
    const payload = {
      user_id: userId,
      program_id,
      assigned_by: trainerId,
      status: "active",
      start_date: start_date || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    };

    const { data: assignment, error: insertError } = await sb
      .from("UserProgramAssignment")
      .insert(payload)
      .select("*")
      .single();

    if (insertError) {
      console.error("Error creando UserProgramAssignment", insertError);
      return res.status(500).json({ error: "No se pudo asignar el programa." });
    }

    return res.status(201).json({
      ok: true,
      assignment,
    });
  }
);

/**
 * POST /program/trainer/programs/from-csv
 *
 * Crea un TrainingProgram + Workouts + WorkoutExercises a partir de un CSV.
 * El CSV debe tener columnas:
 *   day_number, workout_title, workout_notes, exercise_name, sets, reps, rest_sec
 *
 * Body esperado (JSON):
 * {
 *   "title": "Hipertrofia 4x semana",
 *   "goal": "hipertrofia",
 *   "level": "intermedio",
 *   "duration_weeks": 8,
 *   "csv": "day_number,workout_title,...\n1,..."
 * }
 */
router.post(
  "/trainer/programs/from-csv",
  validate(
    z.object({
      title: z.string().min(1),
      goal: z.string().nullable().optional(),
      level: z.string().nullable().optional(),
      duration_weeks: z.number().int().nullable().optional(),
      csv: z.string().min(1),
    })
  ),
  async (req, res) => {
    // Para todo este flujo pesado, usamos service role
    const sbAnon = supabaseService();
    // 1) Resolver trainer actual
    const { error: trainerError, profile } = await getTrainerProfile(
      sbAnon,
      req
    );
    if (trainerError) {
      return res.status(401).json({ error: trainerError });
    }
    const trainerId = profile.id;
    const authUid = req.user?.id; // uuid de supabase para created_by

    const { title, goal, level, duration_weeks, csv } = req.validated;

    try {
      // 2) Parsear CSV
      const rows = parse(csv, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      if (!rows || rows.length === 0) {
        return res
          .status(400)
          .json({ error: "El CSV está vacío o no tiene filas válidas." });
      }

      // 3) Normalizar y validar filas básicas
      const normalized = rows.map((r, index) => {
        const dayNumber = Number(r.day_number);
        const sets = Number(r.sets);
        const restSec =
          r.rest_sec === "" || r.rest_sec == null ? null : Number(r.rest_sec);

        if (!dayNumber || dayNumber < 1) {
          throw new Error(
            `Fila ${index + 2}: day_number inválido (${r.day_number}).`
          );
        }
        if (!r.exercise_name || !r.exercise_name.trim()) {
          throw new Error(`Fila ${index + 2}: exercise_name es obligatorio.`);
        }
        if (!sets || sets < 1) {
          throw new Error(`Fila ${index + 2}: sets inválido (${r.sets}).`);
        }
        if (!r.reps || !r.reps.trim()) {
          throw new Error(`Fila ${index + 2}: reps es obligatorio.`);
        }

        return {
          day_number: dayNumber,
          workout_title: r.workout_title || `Día ${dayNumber}`,
          workout_notes: r.workout_notes || null,
          exercise_name: r.exercise_name.trim(),
          sets,
          reps: r.reps.trim(),
          rest_sec: restSec,
        };
      });

      // 4) Crear TrainingProgram
      const { data: program, error: programError } = await sbAnon
        .from("TrainingProgram")
        .insert({
          trainer_id: trainerId,
          title,
          description: null,
          goal: goal || null,
          level: level || null,
          duration_weeks: duration_weeks || null,
          created_by: authUid || null,
        })
        .select("id")
        .single();

      if (programError || !program) {
        console.error("Error creando TrainingProgram desde CSV", programError);
        return res.status(500).json({ error: "No se pudo crear el programa." });
      }

      const programId = program.id;

      // 5) Crear Workouts (uno por day_number)
      const daysMap = new Map(); // day_number -> { workoutId, title, notes }

      // Necesitamos días únicos
      const uniqueDays = [...new Set(normalized.map((r) => r.day_number))].sort(
        (a, b) => a - b
      );

      for (const day of uniqueDays) {
        const rowForDay = normalized.find((r) => r.day_number === day);
        const { data: workout, error: workoutError } = await sbAnon
          .from("Workout")
          .insert({
            program_id: programId,
            day_number: day,
            title: rowForDay.workout_title,
            notes: rowForDay.workout_notes,
          })
          .select("id, day_number")
          .single();

        if (workoutError || !workout) {
          console.error("Error creando Workout (día)", day, workoutError);
          return res.status(500).json({
            error: `No se pudo crear el día ${day} del programa.`,
          });
        }

        daysMap.set(day, workout.id);
      }

      // 6) Resolver Exercise IDs por nombre
      const allExerciseNames = [
        ...new Set(normalized.map((r) => r.exercise_name)),
      ];

      const { data: existingExercises, error: exError } = await sbAnon
        .from("Exercise")
        .select("id, name")
        .in("name", allExerciseNames);

      if (exError) {
        console.error("Error buscando ejercicios existentes", exError);
        return res.status(500).json({
          error: "Error buscando ejercicios en la base de datos.",
        });
      }

      const existingMap = new Map(
        (existingExercises || []).map((ex) => [ex.name, ex.id])
      );

      // Para MVP: si un ejercicio no existe, lo creamos con nombre y sin más datos
      const missingNames = allExerciseNames.filter(
        (name) => !existingMap.has(name)
      );

      if (missingNames.length > 0) {
        const insertRows = missingNames.map((name) => ({
          name,
          primary_muscle: null,
          equipment: null,
          instructions: null,
          video_url: null,
        }));

        const { data: newExercises, error: insertExError } = await sbAnon
          .from("Exercise")
          .insert(insertRows)
          .select("id, name");

        if (insertExError) {
          console.error("Error creando ejercicios faltantes", insertExError);
          return res.status(500).json({
            error:
              "No se pudieron crear algunos ejercicios nuevos. Revisá los nombres.",
          });
        }

        newExercises.forEach((ex) => {
          existingMap.set(ex.name, ex.id);
        });
      }

      // 7) Crear WorkoutExercise para cada fila
      const workoutExercisesToInsert = [];

      // Para sequence_order, usamos el índice dentro de cada día
      const rowsByDay = normalized.reduce((acc, row) => {
        if (!acc[row.day_number]) acc[row.day_number] = [];
        acc[row.day_number].push(row);
        return acc;
      }, {});

      for (const [dayStr, dayRows] of Object.entries(rowsByDay)) {
        const day = Number(dayStr);
        const workoutId = daysMap.get(day);
        if (!workoutId) continue;

        dayRows.forEach((row, index) => {
          const exerciseId = existingMap.get(row.exercise_name);
          if (!exerciseId) {
            console.warn("No se encontró exercise_id para", row.exercise_name);
            return;
          }

          workoutExercisesToInsert.push({
            workout_id: workoutId,
            exercise_id: exerciseId,
            sequence_order: index + 1,
            sets: row.sets,
            reps: row.reps,
            rest_sec: row.rest_sec,
            tempo: null,
            weight_hint: null,
            notes: null,
          });
        });
      }

      if (workoutExercisesToInsert.length === 0) {
        return res.status(400).json({
          error:
            "No se pudo generar ningún ejercicio. Revisá el CSV (nombres de ejercicios, columnas, etc.).",
        });
      }

      const { error: wexError } = await sbAnon
        .from("WorkoutExercise")
        .insert(workoutExercisesToInsert);

      if (wexError) {
        console.error("Error insertando WorkoutExercise desde CSV", wexError);
        return res.status(500).json({
          error:
            "No se pudieron crear los ejercicios del programa. Revisá el CSV.",
        });
      }

      // 8) Respuesta OK
      return res.status(201).json({
        ok: true,
        program_id: programId,
        workouts_created: uniqueDays.length,
        exercises_created: workoutExercisesToInsert.length,
      });
    } catch (err) {
      console.error("Error general en from-csv", err);
      return res
        .status(500)
        .json({ error: err.message || "Error interno procesando el CSV." });
    }
  }
);

// ---- Schemas para validar el body ----
const aiExerciseSchema = z.object({
  name: z.string(),
  sets: z.number(),
  reps: z.string(),
  rest_sec: z.number(),
  tempo: z.string(),
  weight_hint: z.string(),
  notes: z.string(),
});

const aiWorkoutSchema = z.object({
  day_number: z.number(),
  title: z.string(),
  notes: z.string(),
  exercises: z.array(aiExerciseSchema).min(1),
});

const aiProgramSchema = z.object({
  program_title: z.string(),
  goal: z.string(),
  level: z.string(),
  duration_weeks: z.number(),
  workouts: z.array(aiWorkoutSchema).min(1),
  finalNote: z.string(),
});

const aiCommitBodySchema = z.object({
  draftProgram: aiProgramSchema,
  userProfile: z.object({
    user_id: z.number().int().min(1),
    sex: z.string().nullable().optional(),
    height_cm: z.number().nullable().optional(),
    weight_kg: z.number().nullable().optional(),
    primary_goal: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    activity_level: z.string().nullable().optional(),
    dietary_prefs: z.any().optional(),
    allergies: z.array(z.any()).optional(),
  }),
  answers: z.any().optional(), // por si querés guardarlo después
  start_date: z.string().optional(), // "YYYY-MM-DD" opcional
});

// Designar programa a un usuario por IA trainer
router.post(
  "/workout/commit",
  validate(aiCommitBodySchema),
  async (req, res) => {
    const sb = supabaseService();

    const { draftProgram, userProfile, start_date } = req.validated;
    const userId = userProfile.user_id;

    // ⚙️ ID del trainer IA (TrainerProfile.id)
    const aiTrainerId = Number(process.env.AI_TRAINER_ID);
    if (!aiTrainerId) {
      return res.status(500).json({
        error: "ai_trainer_not_configured",
        detail:
          "Configurar AI_TRAINER_ID en variables de entorno (TrainerProfile.id del coach IA).",
      });
    }

    try {
      // 1) Crear TrainingProgram propiedad del trainer IA
      const { data: programRows, error: programError } = await sb
        .from("TrainingProgram")
        .insert({
          trainer_id: aiTrainerId,
          title: draftProgram.program_title,
          description: draftProgram.finalNote, // usamos finalNote como descripción
          goal: draftProgram.goal,
          level: draftProgram.level,
          duration_weeks: draftProgram.duration_weeks,
          is_public: false,
        })
        .select("*");

      if (programError || !programRows || !programRows[0]) {
        console.error(
          "[AI commit] Error creando TrainingProgram",
          programError
        );
        return res
          .status(500)
          .json({
            error: "create_program_failed",
            detail: programError?.message,
          });
      }

      const program = programRows[0];

      // 2) Crear Workouts
      const workoutsPayload = draftProgram.workouts.map((w) => ({
        program_id: program.id,
        day_number: w.day_number,
        title: w.title,
        notes: w.notes,
      }));

      const { data: workoutRows, error: workoutsError } = await sb
        .from("Workout")
        .insert(workoutsPayload)
        .select("*");

      if (workoutsError || !workoutRows || workoutRows.length === 0) {
        console.error("[AI commit] Error creando Workouts", workoutsError);
        return res.status(500).json({
          error: "create_workouts_failed",
          detail: workoutsError?.message,
        });
      }

      // Aseguramos mismo orden (supabase respeta el orden de insert)
      // draftProgram.workouts[i] -> workoutRows[i]
      // 3) Crear Exercises (si hace falta) y WorkoutExercise
      for (let i = 0; i < draftProgram.workouts.length; i++) {
        const draftW = draftProgram.workouts[i];
        const dbWorkout = workoutRows[i];

        for (let j = 0; j < draftW.exercises.length; j++) {
          const ex = draftW.exercises[j];

          // 3.a) Buscar Exercise por nombre (case-insensitive)
          let exerciseId = null;

          const { data: existingEx, error: selectExError } = await sb
            .from("Exercise")
            .select("id")
            .ilike("name", ex.name)
            .maybeSingle();

          if (selectExError) {
            console.error(
              "[AI commit] Error buscando Exercise",
              ex.name,
              selectExError
            );
          }

          if (existingEx?.id) {
            exerciseId = existingEx.id;
          } else {
            // 3.b) Crear Exercise si no existe
            const { data: newExRows, error: insertExError } = await sb
              .from("Exercise")
              .insert({
                name: ex.name,
                primary_muscle: null,
                equipment: null,
                instructions: ex.notes, // algo simple
              })
              .select("id")
              .single();

            if (insertExError || !newExRows) {
              console.error(
                "[AI commit] Error creando Exercise",
                ex.name,
                insertExError
              );
              return res.status(500).json({
                error: "create_exercise_failed",
                detail: insertExError?.message,
              });
            }

            exerciseId = newExRows.id;
          }

          // 3.c) Crear WorkoutExercise
          const { error: insertWEError } = await sb
            .from("WorkoutExercise")
            .insert({
              workout_id: dbWorkout.id,
              exercise_id: exerciseId,
              sequence_order: j + 1,
              sets: ex.sets,
              reps: ex.reps,
              rest_sec: ex.rest_sec,
              tempo: ex.tempo,
              weight_hint: ex.weight_hint,
              notes: ex.notes,
            });

          if (insertWEError) {
            console.error(
              "[AI commit] Error creando WorkoutExercise",
              insertWEError
            );
            return res.status(500).json({
              error: "create_workout_exercise_failed",
              detail: insertWEError?.message,
            });
          }
        }
      }

      // 4) Marcar como "ended" programas activos previos del user
      const { error: endPrevError } = await sb
        .from("UserProgramAssignment")
        .update({ status: "ended" })
        .eq("user_id", userId)
        .eq("status", "active");

      if (endPrevError) {
        console.error(
          "[AI commit] Error marcando assignments previos como ended",
          endPrevError
        );
        // no cortamos, pero queda logueado
      }

      // 5) Crear nuevo UserProgramAssignment
      const assignmentPayload = {
        user_id: userId,
        program_id: program.id,
        assigned_by: aiTrainerId,
        status: "active",
        start_date: start_date || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      };

      const { data: assignmentRows, error: insertAssignError } = await sb
        .from("UserProgramAssignment")
        .insert(assignmentPayload)
        .select("*");

      if (insertAssignError || !assignmentRows || !assignmentRows[0]) {
        console.error(
          "[AI commit] Error creando UserProgramAssignment",
          insertAssignError
        );
        return res.status(500).json({
          error: "create_assignment_failed",
          detail: insertAssignError?.message,
        });
      }

      const assignment = assignmentRows[0];

      // 6) Respuesta final
      return res.status(201).json({
        ok: true,
        program,
        assignment,
      });
    } catch (e) {
      console.error("[AI commit] ERROR general", e);
      return res.status(500).json({
        error: "ai_workout_commit_failed",
        detail: e?.message,
      });
    }
  }
);

module.exports = router;
