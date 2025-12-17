// client/api/diet.js
import { api } from "./api";

/**
 * GET /users/:id/diet?scope=today&dayKey=...
 * Devuelve { day_plan, kcal_target, macros_target, ... }
 */
export async function getDietToday(userId, dayKey) {
    const res = await api.get(`/users/${userId}/diet`, {
        params: { scope: "today", dayKey },
    });
    return res.data;
}

/**
 * GET /users/:id/diet/week?mode=summary
 */
export async function getDietWeekSummary(userId) {
    const res = await api.get(`/users/${userId}/diet/week`, {
        params: { mode: "summary" },
    });
    return res.data;
}

/**
 * GET /users/:id/diet/week?mode=shopping
 */
export async function getDietShoppingList(userId) {
    const res = await api.get(`/users/${userId}/diet/week`, {
        params: { mode: "shopping" },
    });
    return res.data;
}

/**
 * POST /users/:id/diet/refresh?scope=today&dayKey=...
 * Por defecto devuelve el día pedido (payload chico)
 */
export async function refreshDiet(userId, { dayKey } = {}) {
    const qs = new URLSearchParams();
    qs.set("scope", "today");
    if (dayKey) qs.set("dayKey", dayKey);

    const res = await api.post(`/users/${userId}/diet/refresh?${qs.toString()}`);
    return res.data;
}

