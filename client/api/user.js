import { api } from "./api";
// El interceptor de api ya pone Authorization: Bearer <access_token>
export async function getMe() {
  const res = await api.get("/users/me");
  return res.data;
}

export async function updateMe(patch) {
  const res = await api.patch("/users/me", patch);
  return res.data; // { ok: true }
}
