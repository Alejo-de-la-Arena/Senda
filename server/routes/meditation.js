// server/routes/meditation.js
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// POST /meditation/generate-breathing
router.post("/generate-breathing", async (req, res) => {
    try {
        const { mood, minutes, goal, type } = req.body;

        if (!mood || !minutes || !goal) {
            return res
                .status(400)
                .json({ error: "Faltan parámetros (mood, minutes, goal)" });
        }

        const safeMinutes = Math.max(3, Math.min(Number(minutes) || 5, 20));

        const systemPrompt = `
Sos Senda, un coach de respiración y meditación para una app de bienestar.
Tu tarea es crear UNA sola rutina de respiración guiada en español.

Condiciones:
- Debe ser una rutina de respiración simple (tipo box breathing o variantes).
- Usamos SIEMPRE 4 fases: inhale, hold1, exhale, hold2.
- Para cada fase debes definir: label (texto corto), duration (segundos), instruction (frase que lee la app).
- La duración total aproximada debe ajustarse a ${safeMinutes} minutos (no hace falta que sea exacto).
- Adaptá el tono a:
  - Estado de ánimo (mood)
  - Objetivo (goal)
- No des consejos médicos ni menciones de enfermedades. Si el usuario tiene condiciones de salud, debe consultar a un médico.
- Respondé SOLO con un JSON válido y respetando EXACTAMENTE el schema.

El schema es:

{
  "title": string,
  "tip": string,
  "cycles": integer,
  "phases": {
    "inhale": {
      "label": string,
      "duration": integer,
      "instruction": string
    },
    "hold1": {
      "label": string,
      "duration": integer,
      "instruction": string
    },
    "exhale": {
      "label": string,
      "duration": integer,
      "instruction": string
    },
    "hold2": {
      "label": string,
      "duration": integer,
      "instruction": string
    }
  }
}
`.trim();

        const userPrompt = `
Datos del usuario para diseñar la rutina de respiración:

- Estado de ánimo (mood): ${mood}
- Objetivo (goal): ${goal}
- Minutos disponibles: ${safeMinutes}
- Tipo de sesión: ${type || "breathing"}

Diseñá una rutina efectiva, tranquila y fácil de seguir para este contexto.
`.trim();

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "system",
                    content: [{ type: "input_text", text: systemPrompt }],
                },
                {
                    role: "user",
                    content: [{ type: "input_text", text: userPrompt }],
                },
            ],
            // 👇 Nuevo formato: text.format con JSON schema
            text: {
                format: {
                    type: "json_schema",
                    name: "breathing_routine",
                    strict: true,
                    schema: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            title: {
                                type: "string",
                                description:
                                    "Nombre corto de la rutina, p.ej. 'Calma en 5 minutos'.",
                            },
                            tip: {
                                type: "string",
                                description:
                                    "Frase corta que explique cuándo o cómo usar esta rutina.",
                            },
                            cycles: {
                                type: "integer",
                                minimum: 1,
                                maximum: 30,
                                description:
                                    "Cantidad de ciclos completos (inhale, hold1, exhale, hold2).",
                            },
                            phases: {
                                type: "object",
                                additionalProperties: false,
                                properties: {
                                    inhale: {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            label: { type: "string" },
                                            duration: {
                                                type: "integer",
                                                minimum: 1,
                                                maximum: 20,
                                            },
                                            instruction: { type: "string" },
                                        },
                                        required: ["label", "duration", "instruction"],
                                    },
                                    hold1: {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            label: { type: "string" },
                                            duration: {
                                                type: "integer",
                                                minimum: 1,
                                                maximum: 20,
                                            },
                                            instruction: { type: "string" },
                                        },
                                        required: ["label", "duration", "instruction"],
                                    },
                                    exhale: {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            label: { type: "string" },
                                            duration: {
                                                type: "integer",
                                                minimum: 1,
                                                maximum: 20,
                                            },
                                            instruction: { type: "string" },
                                        },
                                        required: ["label", "duration", "instruction"],
                                    },
                                    hold2: {
                                        type: "object",
                                        additionalProperties: false,
                                        properties: {
                                            label: { type: "string" },
                                            duration: {
                                                type: "integer",
                                                minimum: 1,
                                                maximum: 20,
                                            },
                                            instruction: { type: "string" },
                                        },
                                        required: ["label", "duration", "instruction"],
                                    },
                                },
                                required: ["inhale", "hold1", "exhale", "hold2"],
                            },
                        },
                        // 👇 OBLIGATORIO: todos los keys de properties van en required
                        required: ["title", "tip", "cycles", "phases"],
                    },
                },
            },
            max_output_tokens: 700,
        });

        const rawText = response.output?.[0]?.content?.[0]?.text ?? null;

        if (!rawText) {
            console.error("Respuesta sin texto válido de OpenAI:", response);
            return res
                .status(500)
                .json({ error: "No se pudo generar la rutina de respiración" });
        }

        let routine;
        try {
            routine = JSON.parse(rawText);
        } catch (parseErr) {
            console.error("Error parseando JSON de rutina:", parseErr, rawText);
            return res
                .status(500)
                .json({ error: "Error parseando la rutina generada" });
        }

        return res.json(routine);
    } catch (err) {
        console.error("Error en /meditation/generate-breathing:", err);
        return res
            .status(500)
            .json({ error: "Error generando la rutina de respiración" });
    }
});

module.exports = router;
