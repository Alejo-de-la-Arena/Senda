const router = require("express").Router();
const { supabaseAnon } = require("../lib/supabase");
const { validate, z } = require("../middleware/validate");
const { authRequired } = require("../middleware/auth");

// ==========================
// SCHEMA
// ==========================
const TrainerSchema = z.object({
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  social_links: z.record(z.string()).optional(), // { instagram: "...", youtube: "...", tiktok: "..." }
});

// ==========================
// POST /  (create profile)
// ==========================
// Solo un usuario logueado puede crearlo, y solo uno por user_id
router.post(
  "/",
  authRequired,
  validate(TrainerSchema),
  async (req, res) => {
    const sb = supabaseAnon();
    const userId = req.user.id; // viene desde authOptional/authRequired

    // Check si ya tiene un perfil creado
    const { data: existing } = await sb
      .from("TrainerProfile")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing)
      return res
        .status(400)
        .json({ error: "El usuario ya tiene un perfil de entrenador" });

    const payload = {
      ...req.validated,
      user_id: userId,
    };

    const { error } = await sb.from("TrainerProfile").insert(payload);

    if (error) return res.status(400).json({ error: error.message });

    return res.status(201).json({ ok: true });
  }
);

// ==========================
// GET /  (lista, con filtros)
// ==========================
router.get("/", async (req, res) => {
  const sb = supabaseAnon();

  let query = sb.from("TrainerProfile").select(`
            *,
            user:User(id, name, surname, email)
        `);

  if (req.query.specialty)
    query = query.contains("specialties", [String(req.query.specialty)]);

  const { data, error } = await query;

  if (error) return res.status(400).json({ error: error.message });

  return res.json(data || []);
});

// ==========================
// GET //:id
// ==========================
router.get("/:id", async (req, res) => {
  const sb = supabaseAnon();

  const { data, error } = await sb
    .from("TrainerProfile")
    .select(
      `
            *,
            user:User(id, name, surname, email)
        `
    )
    .eq("id", Number(req.params.id))
    .single();

  if (error) return res.status(404).json({ error: error.message });

  return res.json(data);
});

// ==========================
// GET //user/:user_id
// ==========================
router.get("/user/:user_id", async (req, res) => {
  const sb = supabaseAnon();

  const { data, error } = await sb
    .from("TrainerProfile")
    .select("*")
    .eq("user_id", Number(req.params.user_id))
    .single();

  if (error) return res.status(404).json({ error: error.message });

  return res.json(data);
});

// ==========================
// PUT //:id
// ==========================
// Solo el dueño del trainer profile lo puede editar
router.put(
  "/:id",
  authRequired,
  validate(TrainerSchema.partial()),
  async (req, res) => {
    const sb = supabaseAnon();
    const trainerId = Number(req.params.id);

    // Obtener el profile para verificar que le pertenece al usuario
    const { data: existing } = await sb
      .from("TrainerProfile")
      .select("*")
      .eq("id", trainerId)
      .single();

    if (!existing)
      return res.status(404).json({ error: "Trainer no encontrado" });

    if (existing.user_id !== req.user.id)
      return res
        .status(403)
        .json({ error: "No tienes permiso para editar este perfil" });

    const { error } = await sb
      .from("TrainerProfile")
      .update(req.validated)
      .eq("id", trainerId);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ ok: true });
  }
);

// ==========================
// DELETE //:id
// ==========================
router.delete("/:id", authRequired, async (req, res) => {
  const sb = supabaseAnon();
  const trainerId = Number(req.params.id);

  const { data: existing } = await sb
    .from("TrainerProfile")
    .select("*")
    .eq("id", trainerId)
    .single();

  if (!existing) return res.status(404).json({ error: "Perfil no encontrado" });

  if (existing.user_id !== req.user.id)
    return res
      .status(403)
      .json({ error: "No tienes permiso para eliminar este perfil" });

  const { error } = await sb
    .from("TrainerProfile")
    .delete()
    .eq("id", trainerId);

  if (error) return res.status(400).json({ error: error.message });

  return res.json({ ok: true });
});

module.exports = router;
