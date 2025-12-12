// /client/auth/AuthProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
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

  // 1) Al abrir la app: intentar restaurar sesión
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!raw) {
          return setAuth({ session: null, restoring: false });
        }

        const session = JSON.parse(raw);

        if (session?.expires_at * 1000 > Date.now()) {
          setAuth({ session, restoring: false });
        } else {
          console.log("[Auth] Session expirada, limpiando");
          await SecureStore.deleteItemAsync(STORAGE_KEY);
          setAuth({ session: null, restoring: false });
        }
      } catch (err) {
        setAuth({ session: null, restoring: false });
      }
    })();
  }, []);

  // 2) Interceptor: agrega Authorization en cada request
  useEffect(() => {
    const id = api.interceptors.request.use((config) => {
      const token = auth.session?.access_token;

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(id);
    };
  }, [auth.session?.access_token]);

  // 3) Mientras estamos restaurando, NO renderizamos el árbol de la app
  if (auth.restoring) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#02010A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            marginTop: 8,
            fontSize: 13,
          }}
        >
          Cargando tu sesión...
        </Text>
      </View>
    );
  }

  // 4) Login
  const login = async (email, password) => {
    const data = await loginApi(email, password); // { session, user }

    const lite = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
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
