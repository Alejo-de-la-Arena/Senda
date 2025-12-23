// routes/ai.js
const { Router } = require("express");
const { openai } = require("../OpenAIClient");
const r = Router();

// ========= helper: parse text/json de Responses =========
function getJsonFromResponses(resp) {
  const txt = resp?.output?.[0]?.content?.[0]?.text ?? "{}";
  try {
    return JSON.parse(txt);
  } catch {
    return { _raw: txt };
  }
}

// ---------- Ping: verifica que la key funciona ----------
r.get("/ping", async (_req, res) => {
  try {
    const out = await openai.responses.create({
      model: "gpt-5",
      input: [{ role: "user", content: "Di OK en una palabra." }],
    });
    const text = out?.output?.[0]?.content?.[0]?.text ?? "OK";
    res.json({ ok: true, model: "gpt-5", reply: text.trim() });
  } catch (e) {
    console.error("[ai/ping]", e?.status || "", e?.message);
    res
      .status(500)
      .json({ ok: false, error: "openai_ping_failed", detail: e?.message });
  }
});

// ---------- Nutrición ----------
r.post("/nutrition/recommend", async (req, res) => {
  try {
    const profile = req.body?.profile || {};

    const schema = {
      type: "object",
      properties: {
        day_plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              meal: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    qty: { type: "string" },
                    kcal: { type: "number" },
                    protein_g: { type: "number" },
                    carbs_g: { type: "number" },
                    fat_g: { type: "number" },
                  },
                  required: [
                    "name",
                    "qty",
                    "kcal",
                    "protein_g",
                    "carbs_g",
                    "fat_g",
                  ],
                  additionalProperties: false,
                },
              },
              subtotal: {
                type: "object",
                properties: {
                  kcal: { type: "number" },
                  protein_g: { type: "number" },
                  carbs_g: { type: "number" },
                  fat_g: { type: "number" },
                },
                required: ["kcal", "protein_g", "carbs_g", "fat_g"],
                additionalProperties: false,
              },
            },
            required: ["meal", "items", "subtotal"],
            additionalProperties: false,
          },
        },
        totals: {
          type: "object",
          properties: {
            kcal: { type: "number" },
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fat_g: { type: "number" },
          },
          required: ["kcal", "protein_g", "carbs_g", "fat_g"],
          additionalProperties: false,
        },
        notes: { type: "array", items: { type: "string" } },
      },
      required: ["day_plan", "totals", "notes"],
      additionalProperties: false,
    };

    const resp = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: "Eres un planificador de nutrición preciso y seguro.",
        },
        {
          role: "user",
          content:
            `Genera un plan diario EXACTO.\n` +
            `Objetivo: ${profile.kcal} kcal / ${profile.protein_g} g P / ${profile.carbs_g} g C / ${profile.fat_g} g G.\n` +
            `Alergias/preferencias: ${JSON.stringify(
              profile.allergies || []
            )} / ${JSON.stringify(profile.preferences || [])}.\n` +
            `Devuelve SOLO el JSON que cumple el schema.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "DietPlan",
          schema,
          strict: true,
        },
      },
    });

    res.json(getJsonFromResponses(resp));
  } catch (e) {
    console.error("[ai/nutrition]", e?.message);
    res.status(500).json({ error: "nutrition_failed", detail: e?.message });
  }
});

// ---------- Workouts: validar/corregir ----------
r.post("/workouts/validate", async (req, res) => {
  try {
    const { workoutCsv, userProfile } = req.body || {};
    const schema = {
      type: "object",
      properties: {
        is_valid: { type: "boolean" },
        issues: { type: "array", items: { type: "string" } },
        suggested_changes: { type: "array", items: { type: "string" } },
      },
      required: ["is_valid", "issues", "suggested_changes"],
      additionalProperties: false,
    };

    const resp = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content:
            "Eres un asistente que revisa rutinas de fuerza con criterio profesional.",
        },
        {
          role: "user",
          content:
            `Perfil usuario: ${JSON.stringify(userProfile)}\n` +
            `CSV (headers): day,exercise,sets,reps,rest,tempo,notes\n` +
            workoutCsv +
            `\n` +
            `Valida seguridad, volumen y progresión; sugiere mejoras concretas.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "WorkoutReview",
          schema,
          strict: true,
        },
      },
    });

    res.json(getJsonFromResponses(resp));
  } catch (e) {
    console.error("[ai/workouts]", e?.message);
    res.status(500).json({ error: "workout_failed", detail: e?.message });
  }
});

// ---------- Respiración / meditación por mood (breathing) ----------
r.post("/mood/breathing", async (req, res) => {
  try {
    const { moodCode, minutes = 5 } = req.body || {};
    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
        cadence_bpm: { type: "number" },
      },
      required: ["title", "steps", "cadence_bpm"],
      additionalProperties: false,
    };

    const resp = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: "Eres un instructor de respiración basado en evidencia.",
        },
        {
          role: "user",
          content:
            `Mood: "${moodCode}". Diseña una micro-rutina de ${minutes} minutos ` +
            `para principiantes. Devuelve JSON según schema.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "BreathingRoutine",
          schema,
          strict: true,
        },
      },
    });

    res.json(getJsonFromResponses(resp));
  } catch (e) {
    console.error("[ai/breathing]", e?.message);
    res.status(500).json({ error: "breathing_failed", detail: e?.message });
  }
});

// ---------- Meditación guiada por mood ----------
r.post("/meditation", async (req, res) => {
  try {
    const {
      moodCode = "neutral",
      minutes = 5,
      experience = "beginner",
    } = req.body || {};

    const schema = {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        steps: { type: "array", items: { type: "string" } },
        recommended_breath: { type: "string" },
      },
      required: ["title", "description", "steps", "recommended_breath"],
      additionalProperties: false,
    };

    const resp = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content:
            "Eres un instructor de meditación y respiración. " +
            "Diseñas rutinas breves, claras y seguras para usuarios de apps móviles. " +
            "Nunca des consejos médicos ni sugieras dejar medicación.",
        },
        {
          role: "user",
          content:
            `Usuario con mood "${moodCode}", experiencia "${experience}", ` +
            `duración deseada: ${minutes} minutos. ` +
            `Crea una mini sesión guiada en pasos cortos (frases breves) y RESPONDE SOLO EN JSON.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "MeditationRoutine",
          schema,
          strict: true,
        },
      },
    });

    res.json(getJsonFromResponses(resp));
  } catch (e) {
    console.error("[ai/meditation]", e?.message);
    res.status(500).json({ error: "meditation_failed", detail: e?.message });
  }
});

// ---------- AI: generar entrenamiento ----------

r.post("/workout/generate", async (req, res) => {
  console.log(">>> [/ai/workout/generate] HIT", new Date().toISOString());
  console.time("[ai/workout/generate_total]");

  try {
    const { userProfile, answers } = req.body || {};

    // ✅ SCHEMA COMPATIBLE con json_schema (required incluye TODAS las keys)
    const schema = {
      type: "object",
      properties: {
        program_title: { type: "string" },
        goal: { type: "string" },
        level: { type: "string" },
        duration_weeks: { type: "number" },
        workouts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day_number: { type: "number" },
              title: { type: "string" },
              notes: { type: "string" },
              exercises: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    sets: { type: "number" },
                    reps: { type: "string" },
                    rest_sec: { type: "number" },
                    tempo: { type: "string" },
                    weight_hint: { type: "string" },
                    notes: { type: "string" },
                  },
                  required: [
                    "name",
                    "sets",
                    "reps",
                    "rest_sec",
                    "tempo",
                    "weight_hint",
                    "notes",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["day_number", "title", "notes", "exercises"],
            additionalProperties: false,
          },
        },
        finalNote: { type: "string" },
      },
      // ⛔ ANTES: te faltaba duration_weeks en algún momento
      // ✅ AHORA: todas las keys de properties:
      required: [
        "program_title",
        "goal",
        "level",
        "duration_weeks",
        "workouts",
        "finalNote",
      ],
      additionalProperties: false,
    };

    console.time("[ai/workout/openai_call]");

    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      max_output_tokens: 4000,
      input: [
        {
          role: "system",
          content:
            "Sos un entrenador personal experto, hacé programas basados en evidencia. Siempre respondés en español neutro (estilo Argentina). Devolvé SOLO JSON válido para la base de datos.",
        },
        {
          role: "user",
          content: [
            `Datos del usuario:`,
            `- Sexo: ${userProfile?.sex || "?"}`,
            `- Edad: ${userProfile?.age || "?"}`,
            `- Altura: ${userProfile?.height_cm || "?"} cm`,
            `- Peso: ${userProfile?.weight_kg || "?"} kg`,
            `- Objetivo: ${userProfile?.primary_goal || "?"}`,
            `- Nivel actividad: ${userProfile?.activity_level || "?"}`,
            ``,
            `Respuestas del cuestionario:`,
            `- Días por semana: ${answers?.days_per_week || "?"}`,
            `- Tiene gimnasio: ${answers?.has_gym ? "sí" : "no"}`,
            `- Actividades extra: ${answers?.extra_activities || "ninguna"}`,
            `- Minutos por día: ${answers?.time_per_day || "?"}`,
            `- Intensidad deseada: ${answers?.intensity || "?"}`,
            ``,
            `Generá un programa completo listo para insertar en la DB.`,
            `Cada día debe tener al menos 4 ejercicios. y debe obligatoriamente integrar tambien las actividades extras que se exijen`,
            `En finalNote hay que colocar un mini resumen del entrenamiento. con algun que otro tip`,
            `Respetá el schema JSON EXACTAMENTE, sin texto extra.`,
          ].join("\n"),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "AITrainingProgram",
          schema,
          strict: true,
        },
      },
    });

    console.timeEnd("[ai/workout/openai_call]");

    // 🔍 Si querés debugear:
    // console.log("[AI raw response workout]", JSON.stringify(resp, null, 2));

    // 1) Intentamos parsear desde output_text (más directo)
    let json = null;
    try {
      if (resp.output_text) {
        json = JSON.parse(resp.output_text);
      } else {
        const msg = (resp.output || []).find((o) => o.type === "message");
        const contentArr = msg?.content || [];
        const textBlock = contentArr.find((c) => c.type === "output_text");
        if (textBlock?.text) {
          json = JSON.parse(textBlock.text);
        }
      }
    } catch (parseErr) {
      console.error(
        "[ai/workout/generate] JSON parse error:",
        parseErr?.message
      );
      console.timeEnd("[ai/workout/generate_total]");
      return res.status(500).json({
        error: "workout_parse_failed",
        detail: parseErr?.message,
      });
    }

    console.log("[AI workout program]", JSON.stringify(json, null, 2));
    console.timeEnd("[ai/workout/generate_total]");

    return res.json(json);
  } catch (e) {
    console.timeEnd("[ai/workout/generate_total]");
    console.error("[ai/workout/generate ERROR]", e);
    return res.status(500).json({
      error: "workout_generate_failed",
      detail: e?.message,
    });
  }
});

module.exports = r;
