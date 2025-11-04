const router = require('express').Router();
const { supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');

// POST /trainers
router.post('/trainers',
    validate(z.object({
        user_id: z.number().int(),
        bio: z.string().optional(),
        specialties: z.array(z.string()).default([])
    })),
    async (req, res) => {
        const sb = supabaseAnon();
        const { error } = await sb.from('TrainerProfile').insert(req.validated);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ ok: true });
    }
);

// GET /trainers/:id
router.get('/trainers/:id', async (req, res) => {
    const sb = supabaseAnon();
    const { data, error } = await sb.from('TrainerProfile').select('*').eq('id', Number(req.params.id)).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

// GET /trainers?specialty=hypertrophy
router.get('/trainers', async (req, res) => {
    const sb = supabaseAnon();
    const q = sb.from('TrainerProfile').select('*');
    if (req.query.specialty) q.contains('specialties', [String(req.query.specialty)]);
    const { data, error } = await q;
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data || []);
});

module.exports = router;
