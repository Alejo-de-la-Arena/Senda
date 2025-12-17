// server/routes/diet.js
const router = require("express").Router({ mergeParams: true });
const { z } = require("../middleware/validate");
const { supabaseAdmin } = require("../lib/supabase");
const { openai } = require("../openaiClient");
const crypto = require("crypto");

// ---------- Esquema IA (por día) ----------
const mealSchema = z.object({
    id: z.string(),
    label: z.string(),
    title: z.string(),
    time: z.string(),
    kcal: z.number(),
    ingredients: z
        .array(
            z.object({
                name: z.string(),
                amount: z.number(),
                unit: z.string(),
            })
        )
        .optional(),
});

const aiDaySchema = z.object({
    kcal_target: z.number(),
    macros_target: z.object({
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
    }),
    plan: z.object({
        total_kcal: z.number(),
        meals: z.array(mealSchema),
    }),
});

// ---------- Helpers base ----------
function calcAgeFromBirthdate(birthdate) {
    if (!birthdate) return null;
    const d = new Date(birthdate);
    if (Number.isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function describeActivity(level) {
    switch (level) {
        case "sedentary": return "sedentaria (casi nada de ejercicio)";
        case "light": return "ligera (algo de movimiento diario)";
        case "moderate": return "moderada (entrena 3-4 veces por semana)";
        case "active": return "activa (entrena intenso casi todos los días)";
        case "very_active": return "muy activa (entrenamiento muy intenso)";
        default: return "no especificado";
    }
}

function describeGoal(goal) {
    switch (goal) {
        case "weight_loss": return "pérdida de grasa";
        case "maintenance": return "mantenimiento";
        case "muscle_gain": return "ganar masa muscular";
        case "performance": return "rendimiento deportivo";
        default: return "no especificado";
    }
}

// Mifflin-St Jeor simplificado + ajuste por objetivo
function estimateTargetKcal(userRow) {
    const age = calcAgeFromBirthdate(userRow.birthdate) ?? 30;
    const weight = userRow.weight_kg ?? 70;
    const height = userRow.height_cm ?? 170;

    let bmr;
    if (userRow.sex === "female") bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    else bmr = 10 * weight + 6.25 * height - 5 * age + 5;

    let factor = 1.4;
    switch (userRow.activity_level) {
        case "sedentary": factor = 1.2; break;
        case "light": factor = 1.375; break;
        case "moderate": factor = 1.55; break;
        case "active": factor = 1.725; break;
        case "very_active": factor = 1.9; break;
        default: break;
    }

    const tdee = bmr * factor;

    let goalFactor = 1;
    switch (userRow.primary_goal) {
        case "weight_loss": goalFactor = 0.8; break;
        case "maintenance": goalFactor = 1; break;
        case "muscle_gain": goalFactor = 1.1; break;
        case "performance": goalFactor = 1.05; break;
        default: break;
    }

    return Math.round(tdee * goalFactor);
}

function buildUserContext(userRow) {
    const prefs = userRow.dietary_prefs || {};
    const allergies = userRow.allergies || [];

    return `
Perfil del usuario:
- Sexo: ${userRow.sex || "no especificado"}
- Altura: ${userRow.height_cm || "?"} cm
- Peso: ${userRow.weight_kg || "?"} kg
- Actividad: ${describeActivity(userRow.activity_level)}
- Objetivo: ${describeGoal(userRow.primary_goal)}

Restricciones:
- Keto: ${prefs.keto ? "sí" : "no"}
- Sin lácteos: ${prefs.dairy_free ? "sí" : "no"}
- Vegetariano: ${prefs.vegetarian ? "sí" : "no"}
- Sin gluten: ${prefs.gluten_free ? "sí" : "no"}
- Alergias: ${Array.isArray(allergies) && allergies.length ? allergies.join(", ") : "ninguna"
        }
`.trim();
}

function sha(text) {
    return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function getDayKeyServer(date = new Date()) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[date.getDay()];
}

function getWeekStartMonday(date = new Date()) {
    // devuelve YYYY-MM-DD del lunes de esa semana
    const d = new Date(date);
    const day = d.getDay(); // 0 domingo, 1 lunes...
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diffToMonday);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
}

// ---------- Entrenamiento ----------
async function getActiveTrainingForUser(sb, userId) {
    const { data: assignments, error: assError } = await sb
        .from("UserProgramAssignment")
        .select("id, program_id, status, start_date")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("start_date", { ascending: false })
        .limit(1);

    if (assError || !assignments || assignments.length === 0) return null;

    const assignment = assignments[0];

    const { data: workoutsRaw, error: workoutsError } = await sb
        .from("Workout")
        .select(`
      id,
      day_number,
      title,
      WorkoutExercise (
        sets,
        reps,
        Exercise ( name )
      )
    `)
        .eq("program_id", assignment.program_id)
        .order("day_number", { ascending: true });

    if (workoutsError || !workoutsRaw) return { assignment, workouts: [] };

    const workouts = workoutsRaw.map((w) => ({
        id: w.id,
        day_number: w.day_number,
        title: w.title,
        exercises: (w.WorkoutExercise || []).map((we) => ({
            name: we.Exercise?.name || "Ejercicio",
            sets: we.sets,
            reps: we.reps,
        })),
    }));

    return { assignment, workouts };
}

function classifyIntensity(workout) {
    if (!workout || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
        return { dayType: "rest", label: "descanso" };
    }

    const names = workout.exercises.map(e => (e.name || "").toLowerCase()).join(" | ");

    const heavyKeywords = [
        "sentadilla", "squat",
        "peso muerto", "deadlift",
        "press banca", "bench",
        "press militar", "overhead",
        "hip thrust", "thrust",
    ];

    const isHeavy = heavyKeywords.some(k => names.includes(k));

    // volumen aproximado
    const vol = workout.exercises.reduce((acc, e) => {
        const sets = Number(e.sets || 0);
        const reps = Number(e.reps || 0);
        return acc + sets * reps;
    }, 0);

    if (isHeavy || vol >= 90) return { dayType: "intense", label: "entrenamiento fuerte" };
    if (vol >= 45) return { dayType: "light", label: "entrenamiento liviano" };
    return { dayType: "recovery", label: "recuperación" };
}

function buildTrainingMap(trainingSummary) {
    const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const map = {};

    for (const dayKey of dayNames) {
        map[dayKey] = { dayType: "rest", text: "Día sin entrenamiento (descanso)." };
    }

    if (!trainingSummary || !trainingSummary.workouts) return map;

    for (const w of trainingSummary.workouts) {
        const idx = ((w.day_number || 1) - 1) % 7;
        const dayKey = dayNames[idx];

        const intensity = classifyIntensity(w);
        const ex = (w.exercises || []).slice(0, 6).map(e => e.name).join(", ");
        map[dayKey] = {
            dayType: intensity.dayType,
            text: `Entrenamiento del día: "${w.title || "Workout"}". Intensidad: ${intensity.label}. Ejercicios: ${ex || "—"}.`,
        };
    }

    return map;
}

function dayKcalAdjustment(base, dayType) {
    // simple y estable (podés ajustar luego)
    if (dayType === "intense") return Math.round(base * 1.10);
    if (dayType === "light") return Math.round(base * 1.03);
    if (dayType === "recovery") return Math.round(base * 0.97);
    if (dayType === "rest") return Math.round(base * 0.90);
    return base;
}

// ---------- Prompt por día ----------
function buildDietPromptForDay({ userRow, dayKey, dayType, dayTrainingText, baseTargetKcal }) {
    const context = buildUserContext(userRow);
    const targetKcalDay = dayKcalAdjustment(baseTargetKcal, dayType);

    return `
IMPORTANTE:
- No uses saltos de línea dentro de strings.
- No uses comillas dobles dentro de strings (si hace falta, usa comillas simples).
- Todos los textos (title, name) deben ser de una sola línea.

${context}

Contexto de entrenamiento del día (${dayKey}):
${dayTrainingText}

Vas a crear el plan de comidas SOLO para este día: "${dayKey}".
Tipo de día: "${dayType}". Objetivo calórico del día: ${targetKcalDay} kcal.

REQUISITOS:
1) Argentina: ingredientes simples de supermercado argentino.
2) EXACTAMENTE 4 comidas: breakfast, lunch, snack, dinner.
3) Total diario cercano a ${targetKcalDay} kcal.
4) Máximo 4 ingredientes por comida (no más).
5) Ajuste por tipo de día:
   - intense: más carbohidratos (arroz/pasta/papa/avena/fruta) y algo más de kcal
   - rest: proteína estable, menos carbohidratos, grasas saludables moderadas

FORMATO: devolvé EXCLUSIVAMENTE JSON válido (sin texto extra):
{
  "kcal_target": number,
  "macros_target": { "protein": number, "carbs": number, "fat": number },
  "plan": {
    "total_kcal": number,
    "meals": [
      {
        "id": "breakfast"|"lunch"|"snack"|"dinner",
        "label": "Breakfast"|"Lunch"|"Snack"|"Dinner",
        "title": string,
        "time": "HH:MM",
        "kcal": number,
        "ingredients": [{ "name": string, "amount": number, "unit": "g"|"ml"|"unidad"|"cda"|"cdta" }]
      }
    ]
  }
}
`.trim();
}

// ---------- Week summary + shopping list ----------
function buildWeekSummary(weekPlan) {
    const out = {};
    for (const [dayKey, day] of Object.entries(weekPlan || {})) {
        out[dayKey] = {
            dayType: day.dayType || "normal",
            total_kcal: day.total_kcal || 0,
            meals: Array.isArray(day.meals)
                ? day.meals.map(m => ({
                    id: m.id,
                    title: m.title,
                    time: m.time,
                    kcal: m.kcal,
                }))
                : [],
        };
    }
    return out;
}

function buildShoppingList(weekPlan) {
    const map = new Map(); // key = name|unit
    for (const day of Object.values(weekPlan || {})) {
        const meals = Array.isArray(day.meals) ? day.meals : [];
        for (const meal of meals) {
            const ings = Array.isArray(meal.ingredients) ? meal.ingredients : [];
            for (const ing of ings) {
                const name = (ing.name || "").trim().toLowerCase();
                const unit = (ing.unit || "").trim().toLowerCase();
                if (!name || !unit) continue;
                const key = `${name}__${unit}`;
                const prev = map.get(key) || { name, unit, amount: 0 };
                prev.amount += Number(ing.amount || 0);
                map.set(key, prev);
            }
        }
    }

    const items = Array.from(map.values())
        .map(i => ({
            name: i.name,
            unit: i.unit,
            amount: Math.round(i.amount * 100) / 100,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return { items };
}

// ---------- Regen info ----------
function computeRegenInfo(existingPlan, todayISO, maxPerDay) {
    let regenCountToday = 0;
    if (existingPlan && existingPlan.regen_date === todayISO) {
        regenCountToday = existingPlan.regen_count || 0;
    }
    const remaining = Math.max(maxPerDay - regenCountToday, 0);
    return { regenCountToday, remaining, max: maxPerDay };
}

// ---------- GET /users/:id/diet (scope=today) ----------
router.get("/:id/diet", async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ error: "Invalid user id" });

    const scope = (req.query.scope || req.body?.scope || "today").toString();
    const dayKey = (req.query.dayKey || req.body?.dayKey || getDayKeyServer()).toString();


    const sb = supabaseAdmin();
    const { data, error } = await sb
        .from("DietPlan")
        .select("user_id,kcal_target,macros_target,source,updated_at,regen_count,regen_date,week_start_date,week_plan")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "No diet plan" });

    const MAX_REGEN_PER_DAY = 3;
    const todayISO = new Date().toISOString().slice(0, 10);
    const { remaining, max } = computeRegenInfo(data, todayISO, MAX_REGEN_PER_DAY);

    if (scope !== "today") {
        // por ahora solo soportamos today acá
        return res.json({ ...data, remaining_regens: remaining, max_regens: max });
    }

    const dayPlan = data.week_plan?.[dayKey] || null;

    return res.json({
        user_id: data.user_id,
        kcal_target: data.kcal_target,
        macros_target: data.macros_target,
        source: data.source,
        updated_at: data.updated_at,
        week_start_date: data.week_start_date,
        day_key: dayKey,
        day_plan: dayPlan,
        remaining_regens: remaining,
        max_regens: max,
    });
});

// ---------- GET /users/:id/diet/week ----------
router.get("/:id/diet/week", async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ error: "Invalid user id" });

    const mode = (req.query.mode || "summary").toString(); // summary | shopping
    const sb = supabaseAdmin();

    const { data, error } = await sb
        .from("DietPlan")
        .select("user_id,source,updated_at,week_start_date,week_summary,shopping_list")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "No diet plan" });

    if (mode === "shopping") {
        return res.json({
            user_id: data.user_id,
            week_start_date: data.week_start_date,
            shopping_list: data.shopping_list || { items: [] },
            source: data.source,
            updated_at: data.updated_at,
        });
    }

    return res.json({
        user_id: data.user_id,
        week_start_date: data.week_start_date,
        week_summary: data.week_summary || {},
        source: data.source,
        updated_at: data.updated_at,
    });
});

// ---------- POST /users/:id/diet/refresh ----------
router.post("/:id/diet/refresh", async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) return res.status(400).json({ error: "Invalid user id" });

    const scope = (req.query.scope || "today").toString();
    const dayKey = (req.query.dayKey || getDayKeyServer()).toString();

    const sb = supabaseAdmin();

    // límites
    const MAX_REGEN_PER_DAY = 3;
    const todayISO = new Date().toISOString().slice(0, 10);

    const { data: existingPlan, error: eExisting } = await sb
        .from("DietPlan")
        .select("id,user_id,regen_count,regen_date,inputs_hash,week_start_date,week_plan,kcal_target,macros_target,source,updated_at")
        .eq("user_id", userId)
        .maybeSingle();

    if (eExisting) return res.status(400).json({ error: eExisting.message });

    const { regenCountToday, remaining } = computeRegenInfo(existingPlan, todayISO, MAX_REGEN_PER_DAY);
    if (remaining <= 0) {
        return res.status(429).json({
            error: "Max daily regenerations reached",
            remaining_regens: 0,
            max_regens: MAX_REGEN_PER_DAY,
        });
    }

    // user
    const { data: userRow, error: eUser } = await sb
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

    if (eUser || !userRow) return res.status(400).json({ error: "User not found for diet plan" });

    // training
    const trainingSummary = await getActiveTrainingForUser(sb, userId);
    const trainingMap = buildTrainingMap(trainingSummary);

    // inputs_hash para evitar regeneraciones innecesarias
    const baseTargetKcal = estimateTargetKcal(userRow);
    const trainingHash = sha(JSON.stringify(trainingSummary || {}));
    const userHash = sha(JSON.stringify({
        sex: userRow.sex,
        height_cm: userRow.height_cm,
        weight_kg: userRow.weight_kg,
        birthdate: userRow.birthdate,
        activity_level: userRow.activity_level,
        primary_goal: userRow.primary_goal,
        dietary_prefs: userRow.dietary_prefs,
        allergies: userRow.allergies,
    }));
    const newInputsHash = sha(`${userHash}::${trainingHash}::baseKcal:${baseTargetKcal}`);

    const weekStart = getWeekStartMonday(new Date());

    // ✅ Si ya hay plan para esta semana y no cambiaron inputs, devolvé sin regenerar
    if (
        existingPlan &&
        existingPlan.week_start_date === weekStart &&
        existingPlan.inputs_hash === newInputsHash &&
        existingPlan.week_plan &&
        existingPlan.week_plan?.[dayKey]
    ) {
        const MAX_REGEN_PER_DAY_LOCAL = 3;
        const { remaining: remain2, max } = computeRegenInfo(existingPlan, todayISO, MAX_REGEN_PER_DAY_LOCAL);
        const dayPlan = existingPlan.week_plan?.[dayKey] || null;

        return res.json({
            user_id: userId,
            kcal_target: existingPlan.kcal_target,
            macros_target: existingPlan.macros_target,
            source: existingPlan.source,
            updated_at: existingPlan.updated_at,
            week_start_date: existingPlan.week_start_date,
            day_key: dayKey,
            day_plan: dayPlan,
            remaining_regens: remain2,
            max_regens: max,
            cache_hit: true,
        });
    }

    // 🚀 Generación AI: 7 días, pero guardamos y devolvemos solo lo necesario
    try {
        const DAY_KEYS =
            scope === "today"
                ? [dayKey]
                : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
        const weekPlan = existingPlan?.week_plan ? { ...existingPlan.week_plan } : {};
        let globalKcalTarget = null;
        let globalMacrosTarget = null;

        for (const dk of DAY_KEYS) {
            const dayType = trainingMap[dk]?.dayType || "rest";
            const dayTrainingText = trainingMap[dk]?.text || "Día sin entrenamiento (descanso).";

            let dayData = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const prompt = buildDietPromptForDay({
                        userRow,
                        dayKey: dk,
                        dayType,
                        dayTrainingText,
                        baseTargetKcal,
                    });

                    const completion = await openai.chat.completions.create({
                        model: "gpt-4.1-mini",
                        response_format: { type: "json_object" },
                        temperature: 0.2,
                        max_tokens: 1000,
                        messages: [
                            {
                                role: "system",
                                content: "Eres un nutricionista deportivo argentino. Devuelves SOLO JSON válido, sin explicaciones.",
                            },
                            { role: "user", content: prompt },
                        ],
                    });
                    const choice = completion.choices?.[0];
                    const finish = choice?.finish_reason;

                    if (finish === "length") {
                        throw new Error("AI_TRUNCATED_OUTPUT");
                    }

                    let raw = choice?.message?.content;

                    if (typeof raw !== "string" || !raw.trim()) {
                        throw new Error("Empty AI response");
                    }

                    raw = raw.trim();

                    let jsonText = raw;
                    if (jsonText.startsWith("```")) {
                        const firstBrace = jsonText.indexOf("{");
                        const lastBrace = jsonText.lastIndexOf("}");
                        if (firstBrace !== -1 && lastBrace !== -1) {
                            jsonText = jsonText.slice(firstBrace, lastBrace + 1);
                        }
                    }

                    let parsed;
                    try {
                        parsed = JSON.parse(jsonText);
                    } catch (e) {
                        console.error("[diet] AI returned invalid JSON. Raw tail:", raw.slice(-400));
                        console.error("[diet] JSON tail:", jsonText.slice(-400));
                        throw new Error("AI_INVALID_JSON");
                    }

                    dayData = aiDaySchema.parse(parsed);
                    break;
                } catch (err) {
                    if (attempt === 3) throw err;
                }
            }

            if (!dayData) throw new Error(`No se pudo generar dieta para ${dk}`);

            if (globalKcalTarget == null) globalKcalTarget = dayData.kcal_target;
            if (globalMacrosTarget == null) globalMacrosTarget = dayData.macros_target;

            weekPlan[dk] = {
                dayType,
                total_kcal: dayData.plan.total_kcal,
                meals: dayData.plan.meals,
            };
        }

        const weekSummary = buildWeekSummary(weekPlan);
        const shoppingList = buildShoppingList(weekPlan);
        const newRegenCount = regenCountToday + 1;

        const { data: saved, error: eSave } = await sb
            .from("DietPlan")
            .upsert(
                {
                    user_id: userId,
                    kcal_target: globalKcalTarget ?? baseTargetKcal,
                    macros_target: globalMacrosTarget ?? { protein: 0, carbs: 0, fat: 0 },
                    plan: weekPlan,    
                    week_plan: weekPlan,
                    week_summary: weekSummary,
                    shopping_list: shoppingList,
                    week_start_date: weekStart,
                    inputs_hash: newInputsHash,
                    source: "ai",
                    updated_by: `user:${userId}`,
                    updated_at: new Date().toISOString(),
                    regen_count: newRegenCount,
                    regen_date: todayISO,
                    plan_scope: "week",
                    plan_date: todayISO,
                },
                { onConflict: "user_id" }
            )
            .select("user_id,kcal_target,macros_target,source,updated_at,week_start_date,week_plan,regen_count,regen_date")
            .single();

        if (eSave) return res.status(400).json({ error: eSave.message });

        const remain = Math.max(MAX_REGEN_PER_DAY - newRegenCount, 0);

        if (scope === "today") {
            return res.json({
                user_id: saved.user_id,
                kcal_target: saved.kcal_target,
                macros_target: saved.macros_target,
                source: saved.source,
                updated_at: saved.updated_at,
                week_start_date: saved.week_start_date,
                day_key: dayKey,
                day_plan: saved.week_plan?.[dayKey] || null,
                remaining_regens: remain,
                max_regens: MAX_REGEN_PER_DAY,
                cache_hit: false,
            });
        }

        // fallback para otros scopes si algún día lo necesitás
        return res.json({
            ...saved,
            remaining_regens: remain,
            max_regens: MAX_REGEN_PER_DAY,
        });
    } catch (err) {
        console.error("[diet] Error AI:", err);
        return res.status(500).json({ error: "Failed to generate diet plan with AI" });
    }
});

module.exports = router;
