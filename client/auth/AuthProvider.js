// /client/auth/AuthProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "../api/api";
import { login as loginApi } from "../api/auth";

const STORAGE_KEY = "senda.session"; // guarda access_token, expires_at, userId, email

const AuthCtx = createContext({
  auth: { session: null, restoring: true },
  login: async (_email, _password) => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ session: null, restoring: true });

  // Al abrir la app: intentar restaurar sesión
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!raw) return setAuth({ session: null, restoring: false });

        const session = JSON.parse(raw);
        if (session?.expires_at * 1000 > Date.now()) {
          setAuth({ session, restoring: false });
        } else {
          await SecureStore.deleteItemAsync(STORAGE_KEY);
          setAuth({ session: null, restoring: false });
        }
      } catch {
        setAuth({ session: null, restoring: false });
      }
    })();
  }, []);

  // Interceptor: agrega Authorization en cada request
  useEffect(() => {
    const id = api.interceptors.request.use((config) => {
      const token = auth.session?.access_token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(id);
  }, [auth.session?.access_token]);

  const login = async (email, password) => {
    // Usa tu endpoint actual /users/auth/login
    const data = await loginApi(email, password); // { session, user }

    const lite = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at, // epoch seconds
      userId: data.user?.id ?? data.session?.user?.id ?? null,
      email: data.user?.email ?? data.session?.user?.email ?? null,
    };

    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(lite));
    setAuth({ session: lite, restoring: false });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);

    setAuth({ session: null, restoring: false });
  };

  return (
    <AuthCtx.Provider value={{ auth, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
