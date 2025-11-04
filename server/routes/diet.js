const router = require('express').Router({ mergeParams: true });
const { supabaseAnon } = require('../lib/supabase');
const { validate, z } = require('../middleware/validate');

// GET /users/:id/diet
router.get('/:id/diet', async (req, res) => {
    const userId = Number(req.params.id);
    const sb = supabaseAnon();
    const { data, error } = await sb.from('DietPlan')
        .select('kcal_target,macros_target,plan,source,updated_by,updated_at')
        .eq('user_id', userId).single();
    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

// POST /users/:id/diet/refresh
const aiSchema = z.object({
    kcal_target: z.number(),
    macros_target: z.object({ protein: z.number(), carbs: z.number(), fat: z.number() }),
    plan: z.any(),
    source: z.literal('ai'),
    updated_by: z.string(),
    updated_at: z.string()
});

router.post('/:id/diet/refresh', async (req, res) => {
    const userId = Number(req.params.id);
    const sb = supabaseAnon();

    const { data: np, error: e1 } = await sb.from('NutritionProfile').select('*').eq('user_id', userId).single();
    if (e1) return res.status(400).json({ error: 'NutritionProfile required' });

    // Llama a tu IA aquí usando np (placeholder)
    const aiResp = {
        kcal_target: 2000,
        macros_target: { protein: 150, carbs: 170, fat: 70 },
        plan: { days: [], substitutions: {}, rules: {} },
        source: 'ai',
        updated_by: 'system',
        updated_at: new Date().toISOString()
    };

    try { aiSchema.parse(aiResp); } catch (err) {
        return res.status(400).json({ error: 'AI schema invalid', detail: err.errors });
    }

    const { error: e2 } = await sb.from('DietPlan').upsert({ user_id: userId, ...aiResp }).eq('user_id', userId);
    if (e2) return res.status(400).json({ error: e2.message });

    return res.json({ ok: true });
});

module.exports = router;
