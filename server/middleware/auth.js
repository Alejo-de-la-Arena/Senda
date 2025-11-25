const cookie = require('cookie');
const { supabaseAnon } = require('../lib/supabase');

async function authOptional(req, _res, next) {
    try {
        const header = req.headers.authorization || '';
        let token = header.startsWith('Bearer ') ? header.slice(7) : null;

        if (!token && req.headers.cookie) {
            const parsed = cookie.parse(req.headers.cookie || '');
            token = parsed['sb:token'] || null;
        }

        if (!token) {
            req.user = null;
            return next();
        }

        const sb = supabaseAnon();
        // pequeña trampa para validar token: usamos getUser con el token recibido
        const { data, error } = await sb.auth.getUser(token);
        if (error || !data?.user) {
            req.user = null;
            return next();
        }

        req.user = data.user;
        next();
    } catch (e) {
        req.user = null;
        next();
    }
}

function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

function authRequired(req, res, next) {
  // authOptional debería haberte puesto req.user si la sesión es válida
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticación requerida' });
  }
  next();
}

module.exports = {
  authOptional,
  authRequired,
};

module.exports = { authOptional, requireAuth, authRequired };
