# Senda — Setup Local (Client + Server)

Este repositorio contiene dos proyectos:

- server/ → API Node.js (Express/Fastify) integrada con Supabase y OpenAI
- client/ → Aplicación móvil Expo (React Native)

El objetivo de este README es permitir levantar la aplicación en entorno local luego de clonar el repositorio.

---

## Requisitos

- Node.js 18+ (recomendado Node 20 LTS)
- npm
- Git
- (Opcional) Expo Go en el celular para pruebas reales
- (Opcional) Android Studio / Xcode para emuladores

---

## Estructura del proyecto

    /
    ├── client/
    └── server/

---

## 1) Clonar el repositorio

    git clone <URL_DEL_REPO>
    cd <NOMBRE_DEL_REPO>

---

## 2) Backend — Server

### 2.1 Instalar dependencias

    cd server
    npm install

### 2.2 Variables de entorno

Crear el archivo: server/.env con el siguiente contenido (COMPLETAR):

    PORT=4000
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    OPENAI_API_KEY=YOUR_OPENAI_API_KEY
    AI_TRAINER_ID=3

IMPORTANTE:

- El archivo .env no debe subirse a GitHub
- SUPABASE_SERVICE_ROLE_KEY y OPENAI_API_KEY solo deben existir en el backend
- Nunca exponer estas claves en el frontend

### 2.3 Ejecutar el servidor

Modo desarrollo:

    npm run dev

Modo producción:

    npm start

Backend disponible en:

    http://localhost:4000

---

## 3) Frontend — Client (Expo)

### 3.1 Instalar dependencias

    cd ../client
    npm install

### 3.2 Variables de entorno

Crear el archivo: client/.env según el entorno a utilizar

A) Emulador Android (recomendado):
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000

B) iOS Simulator (Mac):
EXPO_PUBLIC_API_URL=http://localhost:4000

C) Celular real (Expo Go):
Usar la IP local de la computadora (misma red WiFi), por ejemplo:
EXPO_PUBLIC_API_URL=http://192.168.X.X:4000

Para obtener la IP local:

- Windows: ipconfig
- Mac / Linux: ifconfig o ip a

NOTA:
Si se usa un celular real, NO usar localhost (localhost apunta al celular, no a tu PC).

### 3.3 Configuración de Axios (client/api/api.js)

Asegurarse de que el baseURL use EXPO_PUBLIC_API_URL.
Ejemplo:

    import axios from "axios";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    export const api = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_URL,
      timeout: 20000,
      headers: { "Content-Type": "application/json" },
    });

    api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("senda_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

Cada vez que se modifique el archivo client/.env, es necesario reiniciar Expo.

### 3.4 Ejecutar la aplicación

    npm run start

Opciones:

- Escanear el QR con Expo Go (celular)
- Presionar "a" para Android
- Presionar "i" para iOS (solo Mac)

---

## 4) Scripts disponibles

Server:

- npm run dev → Desarrollo con watch
- npm start → Producción

Client:

- npm run start → Expo start
- npm run android → expo run:android
- npm run ios → expo run:ios
- npm run web → Expo web

---

## 5) Troubleshooting

Error: Network request failed

- Verificar que el backend esté corriendo
- No usar localhost en celular real
- Usar la IP local correcta
- PC y celular deben estar en la misma red WiFi

Emulador Android no conecta

- Usar http://10.0.2.2:4000
- No usar localhost

Cambios en .env no se reflejan

- Detener Expo (CTRL + C)
- Volver a ejecutar: npm run start

---

## 6) Seguridad

- No subir archivos .env al repositorio
- No exponer claves privadas en el frontend
- Se recomienda incluir .env.example para documentar variables sin valores

---

## 7) Contacto

Ante cualquier inconveniente para levantar el proyecto, contactar al equipo de desarrollo.
