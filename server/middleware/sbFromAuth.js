// middleware/sbFromAuth.js
const { createClient } = require("@supabase/supabase-js");

function sbFromAuth(req, res, next) {

  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token" });

    // Cliente "anon" pero actuando como el usuario (propaga el JWT)
    req.sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { sbFromAuth };
