const router = require("express").Router();
const { validate, z } = require("../middleware/validate");
const { sbFromAuth } = require("../middleware/sbFromAuth");

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

      console.log("[user-trainer] solicitud de conexión", {
        authUid,
        trainer_profile_id,
      });

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
      console.log("[user-trainer] userId interno", userId);

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
        console.log("[user-trainer] ya estaba vinculado");
        return res
          .status(200)
          .json({
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

      console.log("[user-trainer] vínculo creado OK");
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

module.exports = router;
