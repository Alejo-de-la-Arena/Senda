import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography } from "../../styles/theme";
import logo from "../../assets/logo.png";

import { UserRegisterForm } from "./UserRegisterForm";
import TrainerRegisterForm from "./TrainerRegisterForm";

export default function RegisterScreen({ navigation }) {
  const [mode, setMode] = useState("user"); // "user" | "trainer"

  return (
    <LinearGradient
      colors={["#355E3B", "#4B3621"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image source={logo} style={styles.logo} />

          <Text style={[styles.title, { color: "#fff" }]}>Crear cuenta</Text>
          <Text style={[styles.subTitle, { color: "#fff" }]}>
            {mode === "user"
              ? "Completá tus datos para personalizar tu experiencia"
              : "Registrate como entrenador para ayudar a otros a lograr sus objetivos"}
          </Text>

          {/* TOGGLE USER / TRAINER */}
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                mode === "user" && styles.toggleOptionActive,
              ]}
              onPress={() => setMode("user")}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === "user" && styles.toggleTextActive,
                ]}
              >
                Usuario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleOption,
                mode === "trainer" && styles.toggleOptionActive,
              ]}
              onPress={() => setMode("trainer")}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === "trainer" && styles.toggleTextActive,
                ]}
              >
                Entrenador
              </Text>
            </TouchableOpacity>
          </View>

          {/* AQUÍ RENDERIZAMOS UNO U OTRO FORM */}
          {mode === "user" ? (
            <UserRegisterForm navigation={navigation} />
          ) : (
            <TrainerRegisterForm navigation={navigation} />
          )}

          {/* Botón común abajo */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.ghostBtn}
          >
            <Text style={styles.ghostBtnText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
    fontFamily: typography?.secondaryFont,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 16,
    resizeMode: "contain",
  },
  title: {
    color: colors.textoPrincipal,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subTitle: {
    color: colors.textoSecundario,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 18,
    marginTop: 6,
  },
  toggleWrapper: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    padding: 3,
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleOptionActive: {
    backgroundColor: "#fff",
  },
  toggleText: {
    color: "#fff",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#1E1E1E",
    fontWeight: "700",
  },
  ghostBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    marginTop: 16,
  },
  ghostBtnText: { color: "#fff", fontWeight: "700" },
});
