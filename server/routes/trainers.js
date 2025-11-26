// server/routes/trainers.js
const router = require("express").Router();
const { supabaseAnon, supabaseAdmin } = require("../lib/supabase");
const { validate, z } = require("../middleware/validate");
const { authRequired } = require("../middleware/auth");
const { requireAuth } = require("../middleware/auth");

// ==========================
// SCHEMA (para crear/editar perfil)
// ==========================
const TrainerSchema = z.object({
  bio: z.string().optional().nullable(),
  specialties: z.array(z.string()).default([]),
  social_links: z.record(z.string()).optional().nullable(), // { instagram, youtube, tiktok }
});

// ==========================
// POST /  (create profile)
// ==========================
// Solo un usuario logueado puede crearlo, y solo uno por user_id
router.post("/", authRequired, validate(TrainerSchema), async (req, res) => {
  const sb = supabaseAnon();
  const userId = req.user.id; // viene desde authRequired

  // Check si ya tiene un perfil creado
  const { data: existing, error: e0 } = await sb
    .from("TrainerProfile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (e0) return res.status(400).json({ error: e0.message });

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
});

// ==========================
// GET /  Obtener todos los entrenadores
// ==========================
router.get("/", requireAuth, async (req, res) => {
  const sb = supabaseAdmin();
  const authUid = req.user.id; // mismo que venís usando en otros endpoints

  try {
    // 1) Buscar el user interno (tabla "User") por auth_uid
    const { data: userRow, error: eUser } = await sb
      .from("User")
      .select("id")
      .eq("auth_uid", authUid)
      .maybeSingle();

    if (eUser) {
      console.error("[trainers] error buscando User por auth_uid", eUser);
      return res
        .status(500)
        .json({ error: "Error obteniendo tu usuario interno." });
    }

    if (!userRow) {
      console.warn("[trainers] no se encontró User para auth_uid", authUid);
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const currentUserId = userRow.id;
    console.log("[trainers] currentUserId:", currentUserId);

    // 2) Base query de trainers (lo que ya tenías)
    let trainerQuery = sb.from("TrainerProfileWithUser").select("*");

    if (req.query.specialty) {
      trainerQuery = trainerQuery.contains("specialties", [
        String(req.query.specialty),
      ]);
    }

    const { data: trainers, error: eTrainers } = await trainerQuery;

    if (eTrainers) {
      console.error("[trainers] error cargando trainers", eTrainers);
      return res
        .status(400)
        .json({ error: "No pudimos cargar los profesionales." });
    }

    // 3) Traer vínculos de este user con trainers
    const { data: links, error: eLinks } = await sb
      .from("UserTrainer")
      .select("trainer_id")
      .eq("user_id", currentUserId);

    if (eLinks) {
      console.error("[trainers] error cargando vínculos UserTrainer", eLinks);
      const trainersWithoutLink = (trainers || []).map((t) => ({
        ...t,
        is_linked: false,
      }));
      return res.json(trainersWithoutLink);
    }

    // 👈 ACÁ ESTABA EL BUG
    const linkedIds = new Set((links || []).map((l) => l.trainer_id));

    // 4) Enriquecer: agregamos is_linked a cada trainer
    const enriched = (trainers || []).map((t) => ({
      ...t,
      is_linked: linkedIds.has(t.id),
    }));

    return res.json(enriched);
  } catch (err) {
    console.error("[trainers] error inesperado", err);
    return res
      .status(500)
      .json({ error: "Error inesperado cargando entrenadores." });
  }
});

// ==========================
// GET /:id
// ==========================
router.get("/:id", async (req, res) => {
  const sb = supabaseAnon();

  const { data, error } = await sb
    .from("TrainerProfileWithUser")
    .select("*")
    .eq("id", Number(req.params.id))
    .single();

  if (error) return res.status(404).json({ error: error.message });

  return res.json(data);
});

// ==========================
// GET /user/:user_id
// ==========================
router.get("/user/:user_id", async (req, res) => {
  const sb = supabaseAnon();

  const { data, error } = await sb
    .from("TrainerProfileWithUser")
    .select("*")
    .eq("user_id", Number(req.params.user_id))
    .single();

  if (error) return res.status(404).json({ error: error.message });

  return res.json(data);
});

// ==========================
// PUT /:id
// ==========================
router.put(
  "/:id",
  authRequired,
  validate(TrainerSchema.partial()),
  async (req, res) => {
    const sb = supabaseAnon();
    const trainerId = Number(req.params.id);

    // Obtener el profile para verificar que le pertenece al usuario
    const { data: existing, error: e0 } = await sb
      .from("TrainerProfile")
      .select("*")
      .eq("id", trainerId)
      .single();

    if (e0) return res.status(400).json({ error: e0.message });

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
// DELETE /:id
// ==========================
router.delete("/:id", authRequired, async (req, res) => {
  const sb = supabaseAnon();
  const trainerId = Number(req.params.id);

  const { data: existing, error: e0 } = await sb
    .from("TrainerProfile")
    .select("*")
    .eq("id", trainerId)
    .single();

  if (e0) return res.status(400).json({ error: e0.message });

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
