const router = require("express").Router();
const { supabaseAdmin, supabaseAnon } = require("../lib/supabase");
const { validate, z } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { sbFromAuth } = require('../middleware/sbFromAuth'); 

// POST /users
router.post(
  "/",
  validate(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1),
      surname: z.string().optional(),
      role: z.enum(["user", "trainer", "admin"]).default("user"),

      // ---- campos de perfil opcionales ----
      phone: z.string().min(6).max(30).optional(),
      birthdate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(), // YYYY-MM-DD
      sex: z.enum(["male", "female", "other"]).optional(),
      height_cm: z.coerce.number().int().positive().max(300).optional(),
      weight_kg: z.coerce.number().positive().max(500).optional(),
      activity_level: z
        .enum(["sedentary", "light", "moderate", "active", "very_active"])
        .optional(),
      primary_goal: z
        .enum(["weight_loss", "maintenance", "muscle_gain", "performance"])
        .optional(),
      dietary_prefs: z
        .object({
          keto: z.boolean().optional(),
          vegetarian: z.boolean().optional(),
          gluten_free: z.boolean().optional(),
          dairy_free: z.boolean().optional(),
        })
        .optional(),
      allergies: z.array(z.string()).optional(), // text[]
    })
  ),
  async (req, res) => {
    const sb = supabaseAdmin();

    const {
      email,
      password,
      name,
      surname,
      role,
      phone,
      birthdate,
      sex,
      height_cm,
      weight_kg,
      activity_level,
      primary_goal,
      dietary_prefs,
      allergies,
    } = req.validated;

    // 1) crear en Auth (guardá algo útil en metadata)
    const { data: created, error: e1 } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role,
        name,
        surname: surname ?? null,
        phone: phone ?? null,
        birthdate: birthdate ?? null,
        sex: sex ?? null,
      },
    });
    if (e1) return res.status(400).json({ error: e1.message });

    // 2) crear fila en "User" con TODOS los campos
    const { error: e2 } = await sb.from("User").insert({
      auth_uid: created.user.id,
      email,
      name,
      surname: surname ?? null,
      role,

      phone: phone ?? null,
      birthdate: birthdate ?? null, // date
      sex: sex ?? null,
      height_cm: height_cm ?? null, // int4
      weight_kg: weight_kg ?? null, // numeric
      activity_level: activity_level ?? null,
      primary_goal: primary_goal ?? null,
      dietary_prefs: dietary_prefs ?? null, // jsonb
      allergies: allergies ?? null, // text[]
      // created_at / updated_at: que lo maneje la DB
    });

    if (e2) {
      // opcional: rollback del auth user si falla el insert
      try {
        await sb.auth.admin.deleteUser(created.user.id);
      } catch {}
      return res.status(400).json({ error: e2.message });
    }

    return res.status(201).json({ id: created.user.id });
  }
);

// POST /auth/login
router.post(
  "/auth/login",
  validate(
    z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
  ),
  async (req, res) => {
    const sb = supabaseAnon(); // para auth NO uses service role
    const { email, password } = req.validated;

    const { data, error } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return res.status(401).json({ error: error.message });

    return res.json({ session: data.session, user: data.user });
  }
);

/**
 * GET /users/me
 * Devuelve el perfil del usuario autenticado (según el token del header)
 */
router.get("/me", sbFromAuth, async (req, res) => {
  const sb = req.sb;

  // 1) obtener el user del token
  const { data: u, error: e0 } = await sb.auth.getUser();
  if (e0 || !u?.user) return res.status(401).json({ error: "Invalid token" });

  // 2) buscar su fila de perfil
  const { data, error } = await sb
    .from("User")
    .select("*")
    .eq("auth_uid", u.user.id)
    .single();

  if (error) return res.status(404).json({ error: error.message });

  // opcional: mergear metadata del auth user
  const resp = {
    ...data,
    metadata: u.user.user_metadata || {},
    email_verified: !!u.user.email_confirmed_at,
  };

  return res.json(resp);
});

/**
 * PATCH /users/me
 * Actualiza campos del propio perfil del usuario autenticado
 */
router.patch(
  "/me",
  sbFromAuth,
  validate(
    z.object({
      weight_kg: z.number().positive().optional(),
      primary_goal: z.string().optional(),
      phone: z.string().optional(),
      name: z.string().min(1).optional(),
      surname: z.string().optional(),
      // agregá los que quieras permitir
    })
  ),
  async (req, res) => {
    const sb = req.sb;

    // 1) user del token
    const { data: u, error: e0 } = await sb.auth.getUser();
    if (e0 || !u?.user) return res.status(401).json({ error: "Invalid token" });

    // 2) update de la fila propia
    const { error } = await sb
      .from("User")
      .update(req.validated)
      .eq("auth_uid", u.user.id);

    if (error) return res.status(400).json({ error: error.message });

    return res.json({ ok: true });
  }
);

module.exports = router;
