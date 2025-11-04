# 🌟 Senda - Organiza tu día con rituales mindful

Una app móvil minimalista para organizar tu día a través de 3 rituales clave: **respirar**, **entrenar** y **comer**.

## 📱 Características

- **Diseño Premium**: Interfaz oscura inspirada en apps como OPEN, con degradados cálidos y animaciones fluidas
- **3 Rituales Diarios**: Breathe (respiración), Train (ejercicio), Eat (nutrición)
- **Sesiones Curadas**: Contenido seleccionado de expertos reconocidos
- **Tracking Simple**: Visualiza tu progreso con estadísticas diarias
- **Week Strip**: Vista semanal con indicador del día actual

## 🚀 Instalación

1. **Prerrequisitos**
   - Node.js (v16 o superior)
   - npm o yarn
   - Expo CLI (`npm install -g expo-cli`)
   - Expo Go app en tu dispositivo móvil

2. **Clonar e instalar dependencias**
   ```bash
   cd senda
   npm install
   ```

3. **Iniciar el proyecto**
   ```bash
   npx expo start
   ```

4. **Ejecutar en tu dispositivo**
   - Escanea el código QR con Expo Go (Android) o la cámara (iOS)
   - O presiona `a` para Android emulator / `i` para iOS simulator

## 🎨 Estructura del Proyecto

```
senda/
├── App.js                 # Punto de entrada
├── components/           
│   ├── WeekStrip.js      # Calendario semanal
│   ├── PillSwitcher.js   # Selector de rituales
│   └── RitualCard.js     # Tarjeta de sesión
├── screens/
│   ├── TuDiaScreen.js    # Pantalla principal
│   ├── ExploreScreen.js  # Explorar (placeholder)
│   └── ProfileScreen.js  # Perfil (placeholder)
├── navigation/
│   └── TabNavigator.js   # Navegación inferior
└── data/
    └── rituals.js        # Base de datos de rituales
```

## 🎯 Próximas Funcionalidades

- [ ] Funcionalidad real del botón Play
- [ ] Integración con timer/cronómetro
- [ ] Persistencia de datos locales
- [ ] Notificaciones push para recordatorios
- [ ] Pantalla de exploración con más rituales
- [ ] Sistema de logros y gamificación
- [ ] Modo offline completo
- [ ] Integración con Apple Health / Google Fit
- [ ] Compartir progreso en redes sociales
- [ ] Personalización de rituales

## 🛠️ Tecnologías

- **React Native** + **Expo** (SDK 50)
- **React Navigation** para navegación
- **Expo Linear Gradient** para fondos degradados
- **Expo Blur** para efectos de desenfoque
- **React Native Reanimated** para animaciones fluidas

## 📝 Notas de Desarrollo

- La app está optimizada para modo oscuro
- Los rituales se seleccionan dinámicamente según el día
- Las animaciones usan el native driver para mejor performance
- El diseño es responsive y se adapta a diferentes tamaños de pantalla

## 🎨 Personalización

Para cambiar los colores principales, edita los gradientes en:
- `screens/TuDiaScreen.js` → LinearGradient colors
- `components/RitualCard.js` → getTypeColor()

Para agregar nuevos rituales, edita:
- `data/rituals.js` → ritualsData object

## 📱 Capturas de Pantalla

La app cuenta con 3 pantallas principales:
1. **Tu Día**: Vista principal con los 3 rituales diarios
2. **Explorar**: Descubre nuevos rituales (próximamente)
3. **Perfil**: Tu progreso y estadísticas (próximamente)

## 🤝 Contribuir

Feel free to fork y mejorar la app! Algunas ideas:
- Agregar más tipos de rituales
- Mejorar las animaciones
- Implementar backend con Firebase
- Agregar tests
- Mejorar la accesibilidad

## 📄 Licencia

MIT

---

**Creado con 💜 para ayudarte a organizar tu día de forma mindful**