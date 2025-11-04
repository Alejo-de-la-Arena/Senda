const router = require('express').Router({ mergeParams: true });
const { supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');

router.get('/:id/nutrition-profile', async (req, res) => {
    const userId = Number(req.params.id);
    const sb = supabaseAnon();
    const { data, error } = await sb.from('NutritionProfile').select('*').eq('user_id', userId).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

const profileSchema = z.object({
    sex: z.enum(['male', 'female', 'other']),
    age_years: z.number().int().min(10).max(120),
    height_cm: z.number().min(100).max(250),
    weight_kg: z.number().min(20).max(400),
    activity_level: z.enum(['sedentary', 'light', 'moderate', 'high', 'athlete']),
    primary_goal: z.enum(['fat_loss', 'maintenance', 'muscle_gain']),
    allergies: z.array(z.string()).default([]),
    dietary_prefs: z.record(z.boolean()).default({})
});

router.put('/:id/nutrition-profile', validate(profileSchema), async (req, res) => {
    const userId = Number(req.params.id);
    const sb = supabaseAnon();
    const payload = Object.assign({}, req.validated, { user_id: userId });
    const { error } = await sb.from('NutritionProfile').upsert(payload).eq('user_id', userId);
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ ok: true });
});

module.exports = router;
