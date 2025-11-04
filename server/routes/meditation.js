const express = require('express');
const router = express.Router();
const { supabaseAnon } = require('../lib/supabase');
const { z } = require('zod');

// ---------- Clientes ----------
const supabase = supabaseAnon();

// ---------- Schemas ----------
const presetQuerySchema = z.object({
    mood: z.string().min(1),
    local_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato esperado HH:MM'),
});

// ---------- Helpers ----------
function mapTimeWindow(localTime) {
    const [hourStr] = localTime.split(':');
    const hour = parseInt(hourStr, 10);

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 23) return 'evening';
    return 'late_night';
}

// ---------- Rutas ----------

// GET /meditation/moods
router.get('/moods', async (_req, res) => {
    const { data, error } = await supabase.from('MoodOption').select('*').order('code');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// GET /meditation/preset?mood=stressed&local_time=07:30
router.get('/preset', async (req, res) => {
    const parse = presetQuerySchema.safeParse(req.query);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { mood, local_time } = parse.data;
    const time_window = mapTimeWindow(local_time);

    // Buscar preset exacto
    const { data, error } = await supabase
        .from('MeditationPreset')
        .select('*')
        .eq('mood_code', mood)
        .eq('time_window', time_window)
        .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (data) return res.json(data);

    // Si no hay match exacto → buscar default
    const { data: fallback } = await supabase
        .from('MeditationPreset')
        .select('*')
        .eq('mood_code', 'default')
        .maybeSingle();

    if (!fallback) return res.status(404).json({ error: 'No se encontró preset' });
    res.json(fallback);
});

module.exports = router;
