const router = require('express').Router();
const { supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');

// POST /programs
router.post('/programs',
    validate(z.object({
        name: z.string().min(1),
        created_by: z.string().min(1), // auth_uid del trainer
        goal: z.string().optional()
    })),
    async (req, res) => {
        const sb = supabaseAnon();
        const { data, error } = await sb.from('TrainingProgram').insert(req.validated).select('id').single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ id: data.id });
    }
);

// POST /programs/:programId/workouts
router.post('/programs/:programId/workouts',
    validate(z.object({
        day_number: z.number().int().min(1),
        title: z.string().min(1)
    })),
    async (req, res) => {
        const sb = supabaseAnon();
        const payload = Object.assign({}, req.validated, { program_id: Number(req.params.programId) });
        const { data, error } = await sb.from('Workout').insert(payload).select('id').single();
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ id: data.id });
    }
);

// POST /workouts/:workoutId/exercises
router.post('/workouts/:workoutId/exercises',
    validate(z.array(z.object({
        exercise_id: z.number().int(),
        sequence_order: z.number().int().min(1),
        sets: z.number().int().min(1),
        reps: z.string(),
        rest_sec: z.number().int().optional(),
        weight_hint: z.string().optional()
    }))),
    async (req, res) => {
        const sb = supabaseAnon();
        const rows = req.validated.map(x => Object.assign({}, x, { workout_id: Number(req.params.workoutId) }));
        const { error } = await sb.from('WorkoutExercise').insert(rows);
        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ ok: true });
    }
);

// GET /programs/:programId
router.get('/programs/:programId', async (req, res) => {
    const sb = supabaseAnon();
    // programa + días + ejercicios
    const pid = Number(req.params.programId);
    const [p, w] = await Promise.all([
        sb.from('TrainingProgram').select('*').eq('id', pid).single(),
        sb.from('Workout').select('*, WorkoutExercise(*)').eq('program_id', pid).order('day_number', { ascending: true })
    ]);
    if (p.error) return res.status(404).json({ error: p.error.message });
    return res.json({ program: p.data, workouts: w.data || [] });
});

module.exports = router;
