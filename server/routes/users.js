const router = require('express').Router();
const { supabaseAdmin, supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

// POST /users
router.post('/',
    validate(z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(1),
        surname: z.string().optional(),
        role: z.enum(['user', 'trainer', 'admin']).default('user')
    })),
    async (req, res) => {
        const sb = supabaseAdmin();
        const { email, password, name, surname, role } = req.validated;

        const { data: created, error: e1 } = await sb.auth.admin.createUser({
            email, password, email_confirm: true, user_metadata: { role, name }
        });
        if (e1) return res.status(400).json({ error: e1.message });

        const { error: e2 } = await sb.from('User').insert({
            auth_uid: created.user.id, email, name, surname: surname || null, role
        });
        if (e2) return res.status(400).json({ error: e2.message });

        return res.status(201).json({ id: created.user.id });
    }
);

// GET /users/:id
router.get('/:id', async (req, res) => {
    const sb = supabaseAnon();
    const { data, error } = await sb.from('User').select('*').eq('auth_uid', req.params.id).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

// PATCH /users/:id
router.patch('/:id',
    validate(z.object({
        weight_kg: z.number().positive().optional(),
        primary_goal: z.string().optional(),
        phone: z.string().optional()
    })),
    async (req, res) => {
        const sb = supabaseAnon();
        const { error } = await sb.from('User').update(req.validated).eq('auth_uid', req.params.id);
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ ok: true });
    }
);

module.exports = router;
