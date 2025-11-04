const router = require('express').Router();
const { supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');

// POST /workouts/:workoutId/logs
router.post('/workouts/:workoutId/logs',
    validate(z.object({
        user_id: z.number().int(),
        performed_at: z.string().optional()
    })),
    async (req, res) => {
        const sb = supabaseAnon();
        const payload = Object.assign({}, req.validated, {
            workout_id: Number(req.params.workoutId),
            performed_at: req.validated.performed_at || new Date().toISOString()
        });
        const { data, error } = await sb.from('WorkoutLog').insert(payload).select('id').single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ workout_log_id: data.id });
    }
);

// POST /workout-logs/:logId/sets
router.post('/workout-logs/:logId/sets',
    validate(z.array(z.object({
        exercise_id: z.number().int(),
        set_number: z.number().int(),
        reps_done: z.number().int(),
        weight_kg: z.number(),
        rpe: z.number().optional()
    }))),
    async (req, res) => {
        const sb = supabaseAnon();
        const rows = req.validated.map(x => Object.assign({}, x, { workout_log_id: Number(req.params.logId) }));
        const { error } = await sb.from('WorkoutSetLog').insert(rows);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ ok: true });
    }
);

// GET /users/:id/progress?range=last_30d
router.get('/users/:id/progress', async (req, res) => {
    const days = req.query.range === 'last_90d' ? 90 : 30;
    const sb = supabaseAnon();
    const { data, error } = await sb.rpc('user_progress', { p_user_id: Number(req.params.id), p_days: days });
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data || {});
});

module.exports = router;
