// navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import BoxBreathingScreen from "../screens/BoxBreathingScreen";
import SendaAIChatScreen from "../screens/SendaAIChatScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/registers/RegisterScreen";
import { colors } from "../styles/theme";
import { useAuth } from "../auth/AuthProvider";

import BreatheSetupScreen from "../screens/BreatheSetupScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { auth } = useAuth();
  const isLogged = !!auth.session;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.fondoBaseOscuro },
      }}
    >
      {!isLogged ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />

          {/* 👇 NUEVA SCREEN PARA EL SETUP DE BREATHE */}
          <Stack.Screen name="BreatheSetup" component={BreatheSetupScreen} />

          <Stack.Screen name="BoxBreathing" component={BoxBreathingScreen} />
          <Stack.Screen name="SendaAIChat" component={SendaAIChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
