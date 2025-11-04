const router = require('express').Router();
const { supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');

// POST /user-program-assignments
router.post('/user-program-assignments',
    validate(z.object({
        user_id: z.number().int(),
        program_id: z.number().int(),
        assigned_by: z.number().int().optional(), // id del trainer (User.id) si así lo guardás
        start_date: z.string().optional(),
        status: z.enum(['active', 'paused', 'ended']).default('active')
    })),
    async (req, res) => {
        const sb = supabaseAnon();
        const { error } = await sb.from('UserProgramAssignment').insert(req.validated);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ ok: true });
    }
);

// GET /users/:id/programs/active
router.get('/users/:id/programs/active', async (req, res) => {
    const userId = Number(req.params.id);
    const sb = supabaseAnon();
    const a = await sb.from('UserProgramAssignment').select('*')
        .eq('user_id', userId).eq('status', 'active').maybeSingle();
    if (a.error) return res.status(400).json({ error: a.error.message });
    if (!a.data) return res.json(null);
    const p = await sb.from('TrainingProgram').select('*').eq('id', a.data.program_id).single();
    return res.json({ assignment: a.data, program: p.data || null });
});

module.exports = router;
