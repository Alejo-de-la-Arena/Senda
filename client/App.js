import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { colors } from "./styles/theme";

// Este componente decide qué mostrar (Login o MainTabs)
function Gate() {
  const { auth } = useAuth();

  if (auth.restoring) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.fondoBaseOscuro,
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Si hay sesión -> MainTabs, si no -> Login
  // AppNavigator ya sabe ir a esas pantallas según la navegación
  return <AppNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer
        theme={{
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.fondoBaseOscuro,
            text: colors.textoPrincipal,
            border: colors.textoSecundario,
            notification: colors.accent,
          },
        }}
      >
        <StatusBar style="light" backgroundColor={colors.fondoBaseOscuro} />
        <Gate />
      </NavigationContainer>
    </AuthProvider>
  );
}
