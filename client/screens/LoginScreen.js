import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme, { colors, typography, components } from "../styles/theme";
import logo from "../assets/logo.png";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthProvider";
import { commonStyles } from "../styles/commonStyles";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  // Modal de error
  const [errorMenu, setErrorMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Animaciones del modal
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  const openError = () => {
    setErrorMenu(true);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeError = () => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => setErrorMenu(false));
  };

  useEffect(() => {
    if (errorMessage) openError();
  }, [errorMessage]);

  // Validaciones
  const errors = useMemo(() => {
    const e = email.trim();
    const p = password;
    return {
      emptyEmail: e.length === 0,
      invalidEmail: e.length > 0 && !EMAIL_REGEX.test(e),
      emptyPassword: p.length === 0,
      shortPassword: p.length > 0 && p.length < 8,
    };
  }, [email, password]);

  const hasAnyError =
    errors.emptyEmail ||
    errors.invalidEmail ||
    errors.emptyPassword ||
    errors.shortPassword;

  const onLogin = async () => {
    setErrorMessage("");
    setTouched({ email: true, password: true });
    if (hasAnyError) return;

    try {
      setSubmitting(true);
      await login(email.trim(), password);
    } catch (err) {
      const apiMsg = err?.response?.data?.error;
      if (apiMsg === "Invalid login credentials") {
        setErrorMessage(
          "Credenciales inválidas. Revisá tu email y contraseña."
        );
      } else {
        setErrorMessage(apiMsg || "Error desconocido. Intentá de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#355E3B", "#4B3621"]}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.gradient}
    >
      {/* MODAL DE ERROR */}
      {errorMenu && (
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeError}
          />
          <Animated.View style={[styles.errCard, { transform: [{ scale }] }]}>
            <View style={styles.errIconWrap}>
              <Ionicons name="alert-circle" size={28} color="#fff" />
            </View>

            <Text style={styles.errTitle}>Ups, no pudimos ingresar</Text>
            <Text style={styles.errMsg}>
              {errorMessage ||
                "Ocurrió un error inesperado. Intentá nuevamente."}
            </Text>

            <View style={styles.errActions}>
              <TouchableOpacity onPress={closeError} style={styles.errBtnGhost}>
                <Text style={styles.errBtnGhostText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Contenedor general con space-between */}
          <View style={{ flex: 1, justifyContent: "space-between" }}>
            {/* ======== Bloque superior: formulario ======== */}
            <View>
              <Image source={logo} style={styles.logo} />

              <Text style={[styles.title, { color: "#fff" }]}>
                Bienvenido a Senda
              </Text>
              <Text style={[styles.subTitle, { color: "#fff" }]}>
                Iniciar sesión
              </Text>

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                placeholder="tu@correo.com"
                placeholderTextColor="#ffffff88"
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  { color: "#fff", borderColor: "#ffffff33" },
                  touched.email &&
                    (errors.emptyEmail || errors.invalidEmail) &&
                    styles.inputError,
                ]}
                returnKeyType="next"
              />
              {touched.email && errors.emptyEmail && (
                <Text style={styles.errorText}>El email es obligatorio.</Text>
              )}
              {touched.email && !errors.emptyEmail && errors.invalidEmail && (
                <Text style={styles.errorText}>Ingresá un email válido.</Text>
              )}

              {/* Password */}
              <Text style={styles.label}>Contraseña</Text>
              <View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  placeholder="••••••••"
                  placeholderTextColor="#ffffff88"
                  secureTextEntry={isVisible}
                  style={[
                    styles.input,
                    { color: "#fff", borderColor: "#ffffff33" },
                    touched.password &&
                      (errors.emptyPassword || errors.shortPassword) &&
                      styles.inputError,
                  ]}
                  returnKeyType="go"
                  onSubmitEditing={onLogin}
                />
                <Ionicons
                  name={isVisible ? "eye" : "eye-off"}
                  size={20}
                  color="#fff"
                  style={{ position: "absolute", right: 14, top: 14 }}
                  onPress={() => setIsVisible(!isVisible)}
                />
                <Text
                  style={{
                    fontSize: typography.sizes.caption,
                    color: "white",
                    alignSelf: "flex-end",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Text>
              </View>
              {touched.password && errors.emptyPassword && (
                <Text style={styles.errorText}>
                  La contraseña es obligatoria.
                </Text>
              )}
              {touched.password &&
                !errors.emptyPassword &&
                errors.shortPassword && (
                  <Text style={styles.errorText}>Mínimo 8 caracteres.</Text>
                )}

              {/* Botón Ingresar */}
              <TouchableOpacity
                onPress={onLogin}
                disabled={hasAnyError || submitting}
                style={[
                  components.buttonPrimary,
                  (hasAnyError || submitting) && { opacity: 0.6 },
                  { marginTop: 15 },
                ]}
              >
                <Text style={styles.buttonText}>
                  {submitting ? "Ingresando..." : "Ingresar"}
                </Text>
              </TouchableOpacity>

              {/* Separador */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o continuar con</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Botones sociales */}
              <View style={styles.socialCol}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.socialBtn, styles.socialApple]}
                  onPress={() => {}}
                >
                  <Ionicons
                    name="logo-apple"
                    size={20}
                    color="#fff"
                    style={styles.socialIcon}
                  />
                  <Text style={[styles.socialText, styles.socialTextApple]}>
                    Continuar con Apple
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.socialBtn, styles.socialGoogle]}
                  onPress={() => {}}
                >
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color="#000"
                    style={styles.socialIcon}
                  />
                  <Text style={[styles.socialText, styles.socialTextGoogle]}>
                    Continuar con Google
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ======== Bloque inferior: registro ======== */}
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                color: "white",
                marginBottom: 20,
              }}
            >
              Si aún no tienes cuenta
              <Text
                style={commonStyles.buttonSecondaryText}
                onPress={() => navigation.navigate("Register")}
              >
                {" "}
                registráte{" "}
              </Text>
              acá
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
    backgroundColor: "transparent",
    fontFamily: typography?.secondaryFont,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 24,
    resizeMode: "contain",
  },
  title: {
    color: colors.textoPrincipal,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  subTitle: {
    color: colors.textoSecundario,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    color: "#fff",
    marginTop: 6,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.fondoBaseOscuro,
    color: colors.textoPrincipal,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.textoSecundario + "33",
  },
  inputError: { borderColor: "#FF6B6B" },
  buttonText: { color: "#fff", fontWeight: "700" },
  errorText: {
    color: "#FFB3B3",
    fontSize: 12,
    marginBottom: 6,
    alignSelf: "flex-start",
  },

  // ===== MODAL DE ERROR =====
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  errCard: {
    width: "85%",
    maxWidth: 420,
    backgroundColor: "#101418",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  errIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E86B6B",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  errTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  errMsg: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 6,
    marginBottom: 14,
    lineHeight: 20,
  },
  errActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  errBtnPrimary: {
    backgroundColor: "#2F7BFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  errBtnText: { color: "#fff", fontWeight: "700" },
  errBtnGhost: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  errBtnGhostText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
  },

  // ===== Separador y sociales =====
  dividerRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },
  socialCol: {
    gap: 10,
  },
  socialBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  socialApple: {
    backgroundColor: "#000",
  },
  socialGoogle: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
  },
  socialIcon: {
    marginRight: 8,
  },
  socialText: {
    fontWeight: "700",
    fontSize: 14,
  },
  socialTextApple: {
    color: "#fff",
  },
  socialTextGoogle: {
    color: "#000",
  },
});
