const router = require("express").Router();
const { validate, z } = require("../middleware/validate");
const { sbFromAuth } = require("../middleware/sbFromAuth");
const { supabaseAdmin } = require("../lib/supabase");
const { authRequired } = require("../middleware/auth"); // mismo que usás en otros routers

// POST /user-trainer  -> vincula usuario logueado con un TrainerProfile
router.post(
  "/",
  sbFromAuth,
  validate(
    z.object({
      trainer_profile_id: z.number().int(),
    })
  ),
  async (req, res) => {
    const sb = req.sb; // <-- cliente Supabase CON el access_token del user
    const { trainer_profile_id } = req.validated;

    try {
      // 0) Traer user desde el token
      const { data: u, error: e0 } = await sb.auth.getUser();
      if (e0 || !u?.user) {
        console.error("[user-trainer] getUser error", e0);
        return res.status(401).json({ error: "Token inválido." });
      }

      const authUid = u.user.id; // uuid de Supabase Auth

      // 1) Buscar el User.id interno (int4) a partir del auth_uid
      const { data: userRow, error: uErr } = await sb
        .from("User")
        .select("id")
        .eq("auth_uid", authUid)
        .single();

      if (uErr || !userRow) {
        console.error("[user-trainer] no se encontró User para auth_uid", uErr);
        return res
          .status(404)
          .json({ error: "No encontramos tu perfil de usuario." });
      }

      const userId = userRow.id;

      // 2) ¿ya existe el vínculo?
      const { data: existing, error: e1 } = await sb
        .from("UserTrainer")
        .select("*")
        .eq("user_id", userId)
        .eq("trainer_id", trainer_profile_id)
        .maybeSingle();

      if (e1) {
        console.error("[user-trainer] error check existing", e1);
        return res
          .status(500)
          .json({ error: "Error revisando vínculo con el entrenador." });
      }

      if (existing) {
        return res.status(200).json({
          ok: true,
          alreadyLinked: true,
          message: "Ya estabas conectado con este entrenador.",
        });
      }

      // 3) Crear vínculo
      const { error: e2 } = await sb.from("UserTrainer").insert({
        user_id: userId,
        trainer_id: trainer_profile_id,
        status: "active",
        started_at: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      });

      if (e2) {
        console.error("[user-trainer] error insert", e2);
        return res
          .status(500)
          .json({ error: "No se pudo conectar con el entrenador." });
      }
      return res.status(201).json({
        ok: true,
        alreadyLinked: false,
        message: "Conexión creada con éxito.",
      });
    } catch (err) {
      console.error("[user-trainer] unexpected", err);
      return res
        .status(500)
        .json({ error: "Error interno conectando con el entrenador." });
    }
  }
);

// GET /user-trainer/my-users
// Devuelve los usuarios "entrenados" del trainer logueado
router.get("/my-users", authRequired, async (req, res) => {
  const sb = supabaseAdmin();
  const authUid = req.user.id; // viene del token (igual que en /trainers)

  try {
    // 1) Buscar el User interno por auth_uid
    const { data: userRow, error: eUser } = await sb
      .from("User")
      .select("id, role")
      .eq("auth_uid", authUid)
      .maybeSingle();

    if (eUser) {
      console.error("[user-trainer/my-users] error buscando User", eUser);
      return res
        .status(500)
        .json({ error: "Error obteniendo tu usuario interno." });
    }

    if (!userRow) {
      console.warn("[user-trainer/my-users] User no encontrado", authUid);
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    if (userRow.role !== "trainer") {
      // Por si un usuario normal intenta pegarle
      return res.status(403).json({
        error: "Solo los entrenadores pueden ver sus entrenados.",
      });
    }

    // 2) Buscar el TrainerProfile de este user
    const { data: trainerProfile, error: eTrainer } = await sb
      .from("TrainerProfile")
      .select("id")
      .eq("user_id", userRow.id)
      .maybeSingle();

    if (eTrainer) {
      console.error(
        "[user-trainer/my-users] error buscando TrainerProfile",
        eTrainer
      );
      return res
        .status(500)
        .json({ error: "Error obteniendo tu perfil de entrenador." });
    }

    if (!trainerProfile) {
      console.warn(
        "[user-trainer/my-users] TrainerProfile no encontrado para user_id",
        userRow.id
      );
      return res
        .status(404)
        .json({ error: "No encontramos tu perfil de entrenador." });
    }

    const trainerId = trainerProfile.id; // 👈 AHORA SÍ: ESTE ES EL QUE USA UserTrainerWithUser

    // 3) Traer entrenados desde la view
    const { data, error } = await sb
      .from("UserTrainerWithUser")
      .select("*")
      .eq("trainer_id", trainerId)
      .eq("status", "active"); // si querés solo activos

    if (error) {
      console.error("[user-trainer/my-users] error listando entrenados", error);
      return res
        .status(500)
        .json({ error: "No pudimos cargar tus entrenados." });
    }
    return res.json(data || []);
  } catch (err) {
    console.error("[user-trainer/my-users] error inesperado", err);
    return res
      .status(500)
      .json({ error: "Error interno cargando tus entrenados." });
  }
});


module.exports = router;
