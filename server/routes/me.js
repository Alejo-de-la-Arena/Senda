const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { supabaseAnon } = require('../lib/supabase');

router.get('/', requireAuth, async (req, res) => {
    const sb = supabaseAnon();
    const { data, error } = await sb.from('User').select('*').eq('auth_uid', req.user.id).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

module.exports = router;
