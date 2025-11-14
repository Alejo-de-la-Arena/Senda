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
                        )} / ${JSON.stringify(
                            profile.preferences || []
                        )}.\n` +
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
        res
            .status(500)
            .json({ error: "meditation_failed", detail: e?.message });
    }
});

module.exports = r;
