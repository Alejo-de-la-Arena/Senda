import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { StyleSheet, View, Text } from "react-native";
import { colors, typography, spacing } from "../styles/theme";

import TuDiaScreen from "../screens/tuDiaScreens/TuDiaScreen";
import ComunidadScreen from "../screens/ComunidadScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Tu Día"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let showBadge = false;
          let badgeCount = 0;

          if (route.name === "Comunidad") {
            iconName = focused ? "people" : "people-outline";
            showBadge = true;
            badgeCount = 3; // Número de notificaciones simuladas
          } else if (route.name === "Tu Día") {
            iconName = focused ? "sunny" : "sunny-outline";
          } else if (route.name === "Chat") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            showBadge = true;
            badgeCount = 5; // Mensajes no leídos simulados
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {showBadge && badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: colors.textoPrincipal,
        tabBarInactiveTintColor: colors.textoSecundario,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: colors.fondoBaseOscuro + "E6", // 90% opacity
          borderTopWidth: 0,
          elevation: 0,
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          borderTopColor: "transparent",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            style={StyleSheet.absoluteFillObject}
            tint="dark"
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Comunidad" component={ComunidadScreen} />
      <Tab.Screen name="Tu Día" component={TuDiaScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: -8,
    top: -4,
    backgroundColor: colors.naranjaCTA,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textoPrincipal,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
});

export default TabNavigator;
