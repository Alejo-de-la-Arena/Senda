// server/routes/diet.js
const router = require("express").Router({ mergeParams: true });
const { z } = require("../middleware/validate");
const { supabaseAdmin } = require("../lib/supabase");
const { openai } = require("../openaiClient");

// ---------- Esquema de lo que esperamos guardar en DietPlan ----------
const aiSchema = z.object({
    kcal_target: z.number(),
    macros_target: z.object({
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
    }),
    plan: z.object({
        total_kcal: z.number(),
        meals: z.array(
            z.object({
                id: z.string(),
                label: z.string(),
                title: z.string(),
                time: z.string(),
                kcal: z.number(),
                // Nuevo: ingredientes con cantidades
                ingredients: z
                    .array(
                        z.object({
                            name: z.string(),
                            amount: z.number(),
                            unit: z.string(),
                        })
                    )
                    .optional(),
            })
        ),
    }),
    source: z.literal("ai"),
    updated_by: z.string(),
    updated_at: z.string(),
});

// ---------- GET /users/:id/diet ----------
router.get("/:id/diet", async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
        return res.status(400).json({ error: "Invalid user id" });
    }

    const sb = supabaseAdmin();

    const { data, error } = await sb
        .from("DietPlan")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("[diet] Error leyendo DietPlan:", error);
        return res.status(400).json({ error: error.message });
    }

    if (!data) return res.status(404).json({ error: "No diet plan" });

    return res.json(data);
});

// ---------- Helpers para el prompt ----------

function calcAgeFromBirthdate(birthdate) {
    if (!birthdate) return null;
    const d = new Date(birthdate);
    if (Number.isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function describeActivity(level) {
    switch (level) {
        case "sedentary":
            return "sedentaria (casi nada de ejercicio)";
        case "light":
            return "ligera (algo de movimiento diario)";
        case "moderate":
            return "moderada (entrena 3-4 veces por semana)";
        case "active":
            return "activa (entrena intenso casi todos los días)";
        case "very_active":
            return "muy activa (entrenamiento muy intenso)";
        default:
            return "no especificado";
    }
}

function describeGoal(goal) {
    switch (goal) {
        case "weight_loss":
            return "pérdida de grasa";
        case "maintenance":
            return "mantenimiento";
        case "muscle_gain":
            return "ganar masa muscular";
        case "performance":
            return "rendimiento deportivo";
        default:
            return "no especificado";
    }
}

function describePrefs(dietary_prefs = {}, allergies = []) {
    const prefs = [];
    if (dietary_prefs.keto) prefs.push("keto");
    if (dietary_prefs.dairy_free) prefs.push("sin lácteos");
    if (dietary_prefs.vegetarian) prefs.push("vegetariano");
    if (dietary_prefs.gluten_free) prefs.push("sin gluten");

    const prefsText = prefs.length ? prefs.join(", ") : "sin preferencias especiales";
    const allergiesText =
        Array.isArray(allergies) && allergies.length
            ? allergies.join(", ")
            : "sin alergias registradas";

    return `${prefsText}. Alergias: ${allergiesText}.`;
}

function estimateTargetKcal(userRow) {
    const age = calcAgeFromBirthdate(userRow.birthdate) ?? 30;
    const weight = userRow.weight_kg ?? 70;
    const height = userRow.height_cm ?? 170;

    // Mifflin-St Jeor muy simple
    let bmr;
    if (userRow.sex === "female") {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
        // default male / other
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    }

    let factor = 1.4;
    switch (userRow.activity_level) {
        case "sedentary":
            factor = 1.2;
            break;
        case "light":
            factor = 1.375;
            break;
        case "moderate":
            factor = 1.55;
            break;
        case "active":
            factor = 1.725;
            break;
        case "very_active":
            factor = 1.9;
            break;
        default:
            break;
    }

    let tdee = bmr * factor;

    let goalFactor = 1;
    switch (userRow.primary_goal) {
        case "weight_loss":
            goalFactor = 0.8;
            break;
        case "maintenance":
            goalFactor = 1;
            break;
        case "muscle_gain":
            goalFactor = 1.1;
            break;
        case "performance":
            goalFactor = 1.05;
            break;
        default:
            break;
    }

    return tdee * goalFactor;
}

function buildUserContext(userRow) {
    const prefs = userRow.dietary_prefs || {};
    const allergies = userRow.allergies || [];

    return `
Perfil del usuario:
- Nombre: ${userRow.name || ""} ${userRow.surname || ""}
- Sexo: ${userRow.sex || "no especificado"}
- Altura: ${userRow.height_cm || "?"} cm
- Peso: ${userRow.weight_kg || "?"} kg
- Nivel de actividad: ${userRow.activity_level || "no especificado"}
- Objetivo principal: ${userRow.primary_goal || "no especificado"}

Preferencias alimentarias:
- Keto: ${prefs.keto ? "sí" : "no"}
- Sin lácteos: ${prefs.dairy_free ? "sí" : "no"}
- Vegetariano: ${prefs.vegetarian ? "sí" : "no"}
- Sin gluten: ${prefs.gluten_free ? "sí" : "no"}

Alergias o restricciones adicionales:
- ${Array.isArray(allergies) && allergies.length > 0
            ? allergies.join(", ")
            : "ninguna registrada"
        }
`.trim();
}


// Pequeña ayuda para aproximar kcal objetivo
function estimateTargetKcal(user) {
    const w = user.weight_kg || 80;

    switch (user.primary_goal) {
        case "fat_loss":
            return Math.round(w * 28);
        case "muscle_gain":
            return Math.round(w * 38);
        default:
            return Math.round(w * 33); // mantenimiento
    }
}

function buildDietPrompt(userRow) {
    const context = buildUserContext(userRow);
    const targetKcal = estimateTargetKcal(userRow);

    return `
${context}

Como nutricionista deportivo argentino vas a crear UN SOLO día de comidas completo, pensado para un adulto de clase media / media-alta en Argentina.

REQUISITOS IMPORTANTES:

1) Adaptación a Argentina:
   - Ingredientes que se consigan fácil en supermercados argentinos (Coto, Carrefour, Día, chino).
   - Proteínas típicas: pollo, carne vacuna magra, carne picada magra, huevos, atún en lata, quesos magros, yogur, legumbres (lentejas, garbanzos, porotos).
   - Carbohidratos: arroz, fideos, pan común, avena, papa, batata, frutas clásicas (banana, manzana, naranja), verduras comunes (lechuga, tomate, zanahoria, cebolla, brócoli, espinaca).
   - Grasas: aceite de oliva o girasol, frutos secos, palta de vez en cuando.
   - Evitá ingredientes demasiado caros o exóticos (salmón fresco, mariscos caros, cosas muy gourmet).

2) Estructura del día:
   - Solo 4 comidas: desayuno, almuerzo, merienda y cena.
   - Cada comida entre 400 y 800 kcal aprox.
   - El total diario debe acercarse a ${targetKcal} kcal.

3) Detalle de cada comida:
   - Nombre/título amigable.
   - Hora sugerida en formato "HH:MM".
   - Calorías aproximadas de la comida (kcal).
   - Lista de ingredientes con cantidades realistas:
     * name: nombre del ingrediente (en español de Argentina).
     * amount: número (gramos, mililitros o unidades).
     * unit: "g" | "ml" | "unidad" | "cda" | "cdta".

4) FORMATO DE RESPUESTA (MUY IMPORTANTE):
   - Devolvé EXCLUSIVAMENTE el siguiente JSON.
   - No agregues texto antes ni después.
   - No comentes nada, no expliques nada.

{
  "kcal_target": number,
  "macros_target": {
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "plan": {
    "total_kcal": number,
    "meals": [
      {
        "id": "breakfast" | "lunch" | "snack" | "dinner",
        "label": "Breakfast" | "Lunch" | "Snack" | "Dinner",
        "title": string,
        "time": "HH:MM",
        "kcal": number,
        "ingredients": [
          {
            "name": string,
            "amount": number,
            "unit": "g" | "ml" | "unidad" | "cda" | "cdta"
          }
        ]
      }
    ]
  }
}

Recordá: SOLO ese JSON, bien formado, sin texto extra, sin comentarios.
`;
}

// ---------- POST /users/:id/diet/refresh ----------
router.post("/:id/diet/refresh", async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
        return res.status(400).json({ error: "Invalid user id" });
    }

    const sb = supabaseAdmin();

    // 1) Traer el usuario desde nuestra tabla User
    const { data: userRow, error: eUser } = await sb
        .from("User")
        .select("*")
        .eq("id", userId)
        .single();

    console.log("[diet] Consulta a User:", {
        userId,
        data: userRow,
        error: eUser?.message,
    });

    if (eUser || !userRow) {
        console.log("[diet] USER NOT FOUND, id =", userId);
        return res.status(400).json({ error: "User not found for diet plan" });
    }

    // 2) Llamada a OpenAI usando Chat Completions en modo JSON
    try {
        const prompt = buildDietPrompt(userRow);

        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            response_format: { type: "json_object" },
            temperature: 0.35,
            max_tokens: 900,
            messages: [
                {
                    role: "system",
                    content:
                        "Eres un nutricionista deportivo argentino. Siempre devuelves SOLO JSON válido, sin explicaciones.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        let raw = completion.choices?.[0]?.message?.content;

        if (typeof raw !== "string") {
            console.error("[diet] Respuesta de OpenAI sin content:", completion);
            return res.status(500).json({ error: "Empty AI response" });
        }

        raw = raw.trim();

        // Por si alguna vez viniera envuelto en ```json ... ```
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
        } catch (parseErr) {
            console.error("[diet] Error parseando JSON de la IA:", parseErr);
            console.error("[diet] RAW IA TEXT ===>\n", raw);
            console.error("[diet] JSON LIMPIO INTENTADO ===>\n", jsonText);
            return res
                .status(500)
                .json({ error: "AI response was not valid JSON" });
        }

        // 3) Validar con Zod
        const aiData = aiSchema.parse({
            ...parsed,
            source: "ai",
            updated_by: `user:${userId}`,
            updated_at: new Date().toISOString(),
        });

        // 4) Guardar en DietPlan
        const { data: saved, error: eSave } = await sb
            .from("DietPlan")
            .upsert({
                user_id: userId,
                ...aiData,
            })
            .select()
            .single();

        if (eSave) {
            console.error("[diet] Error guardando DietPlan:", eSave);
            return res.status(400).json({ error: eSave.message });
        }

        return res.json(saved);
    } catch (err) {
        console.error("[diet] Error llamando a OpenAI o procesando respuesta:", err);
        return res
            .status(500)
            .json({ error: "Failed to generate diet plan with AI" });
    }

});

module.exports = router;
