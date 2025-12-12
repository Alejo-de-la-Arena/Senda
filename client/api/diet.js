// client/api/diet.js
import { api } from "./api";

/**
 * GET /users/:id/diet
 */
export async function getDiet(userId) {
    const res = await api.get(`/users/${userId}/diet`);
    return res.data;
}

/**
 * POST /users/:id/diet/refresh
 */
export async function refreshDiet(userId) {
    const res = await api.post(`/users/${userId}/diet/refresh`);
    return res.data;
}
