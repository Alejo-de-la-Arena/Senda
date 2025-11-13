import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme, {
  colors,
  typography,
  components,
  spacing,
  borderRadius,
} from "../styles/theme";
import logo from "../assets/logo.png";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// Opciones en ESPAÑOL (lo mapeamos a backend después)
const SEX_OPTIONS = ["Masculino", "Femenino", "Otro"];
const ACTIVITY_OPTIONS = [
  "Sedentaria",
  "Ligera",
  "Moderada",
  "Activa",
  "Muy activa",
];
const GOAL_OPTIONS = [
  "Pérdida de grasa",
  "Mantenimiento",
  "Ganar masa muscular",
  "Rendimiento",
];

export default function RegisterScreen({ navigation }) {
  // Campos básicos (requeridos)
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  // Campos de perfil
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState(""); // formato: YYYY-MM-DD (por ahora texto)
  const [sex, setSex] = useState(null); // "Masculino" | ...
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const [activityLevel, setActivityLevel] = useState(null); // "Activa" | ...
  const [primaryGoal, setPrimaryGoal] = useState(null); // "Ganar masa muscular" | ...

  // Preferencias dietarias (switches)
  const [dietKeto, setDietKeto] = useState(false);
  const [dietVegetarian, setDietVegetarian] = useState(false);
  const [dietGlutenFree, setDietGlutenFree] = useState(false);
  const [dietDairyFree, setDietDairyFree] = useState(false);

  // Alergias (separadas por coma)
  const [allergies, setAllergies] = useState("");

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Validaciones locales
  const errors = useMemo(() => {
    const e = email.trim();
    const p = password;
    const n = name.trim();

    // formato simple de fecha YYYY-MM-DD
    const birth = birthdate.trim();
    const birthInvalid = birth.length > 0 && !/^\d{4}-\d{2}-\d{2}$/.test(birth);

    const h = Number(heightCm);
    const w = Number(weightKg);
    const heightInvalid =
      heightCm !== "" && (!Number.isFinite(h) || h <= 0 || h > 300);
    const weightInvalid =
      weightKg !== "" && (!Number.isFinite(w) || w <= 0 || w > 500);

    return {
      emptyName: n.length === 0,
      emptyEmail: e.length === 0,
      invalidEmail: e.length > 0 && !EMAIL_REGEX.test(e),
      emptyPassword: p.length === 0,
      shortPassword: p.length > 0 && p.length < 8,

      birthInvalid,
      heightInvalid,
      weightInvalid,

      sexMissing: sex === null,
      activityMissing: activityLevel === null,
      goalMissing: primaryGoal === null,
    };
  }, [
    name,
    email,
    password,
    birthdate,
    heightCm,
    weightKg,
    sex,
    activityLevel,
    primaryGoal,
  ]);

  const hasAnyError =
    errors.emptyName ||
    errors.emptyEmail ||
    errors.invalidEmail ||
    errors.emptyPassword ||
    errors.shortPassword ||
    errors.birthInvalid ||
    errors.heightInvalid ||
    errors.weightInvalid ||
    errors.sexMissing ||
    errors.activityMissing ||
    errors.goalMissing;

  const markAllTouched = () =>
    setTouched({
      name: true,
      email: true,
      password: true,
      birthdate: true,
      height: true,
      weight: true,
      sex: true,
      activity: true,
      goal: true,
    });

  const onSubmit = async () => {
    setTouched((t) => ({
      ...t,
      name: true,
      email: true,
      password: true,
      birthdate: true,
      height: true,
      weight: true,
      sex: true,
      activity: true,
      goal: true,
    }));

    if (hasAnyError) return;

    // Solo UI: mostramos un preview de payload (sin pegarle al backend aún)
    setSubmitting(true);
    try {
      const payloadPreview = {
        name: name.trim(),
        surname: surname.trim() || null,
        email: email.trim(),
        password,
        role: "user", // o "admin" si querés permitirlo acá
        phone: phone.trim() || null,
        birthdate: birthdate.trim() || null,
        sex: sex, // luego mapeamos a "male|female|other" en el pegado real
        height_cm: heightCm === "" ? null : Number(heightCm),
        weight_kg: weightKg === "" ? null : Number(weightKg),
        activity_level: activityLevel, // luego mapeamos a "sedentary|...|very_active"
        primary_goal: primaryGoal, // luego mapeamos a "weight_loss|maintenance|muscle_gain|performance"
        dietary_prefs: {
          keto: dietKeto,
          vegetarian: dietVegetarian,
          gluten_free: dietGlutenFree,
          dairy_free: dietDairyFree,
        },
        allergies: allergies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      // Por ahora solo visual:
      Alert.alert("Vista previa", "Formulario válido y listo para enviar ✨");
      console.log("Payload (preview):", payloadPreview);

      // Luego: pegamos al endpoint y navegamos
      // await signup(payloadPreview);
      // navigation.replace('MainTabs');
    } catch (e) {
      Alert.alert("Error", "Ocurrió un error al validar el formulario.");
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
            Completá tus datos para personalizar tu experiencia
          </Text>

          {/* ====== Datos básicos ====== */}
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="Ezequiel"
            placeholderTextColor="#ffffff88"
            style={[
              styles.input,
              touched.name && errors.emptyName && styles.inputError,
            ]}
          />
          {touched.name && errors.emptyName && (
            <Text style={styles.errorText}>El nombre es obligatorio.</Text>
          )}

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            value={surname}
            onChangeText={setSurname}
            placeholder="Olivero"
            placeholderTextColor="#ffffff88"
            style={styles.input}
          />

          <Text style={styles.label}>Email *</Text>
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
              touched.email &&
                (errors.emptyEmail || errors.invalidEmail) &&
                styles.inputError,
            ]}
          />
          {touched.email && errors.emptyEmail && (
            <Text style={styles.errorText}>El email es obligatorio.</Text>
          )}
          {touched.email && !errors.emptyEmail && errors.invalidEmail && (
            <Text style={styles.errorText}>Ingresá un email válido.</Text>
          )}

          <Text style={styles.label}>Contraseña *</Text>
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
                touched.password &&
                  (errors.emptyPassword || errors.shortPassword) &&
                  styles.inputError,
              ]}
            />
            <Ionicons
              name={isVisible ? "eye" : "eye-off"}
              size={20}
              color="#fff"
              style={{ position: "absolute", right: 14, top: 14 }}
              onPress={() => setIsVisible(!isVisible)}
            />
          </View>
          {touched.password && errors.emptyPassword && (
            <Text style={styles.errorText}>La contraseña es obligatoria.</Text>
          )}
          {touched.password &&
            !errors.emptyPassword &&
            errors.shortPassword && (
              <Text style={styles.errorText}>Mínimo 8 caracteres.</Text>
            )}

          {/* ====== Perfil ====== */}
          <Text style={[styles.sectionTitle]}>Perfil</Text>

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+54 9 11 2345 6789"
            placeholderTextColor="#ffffff88"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Fecha de nacimiento (YYYY-MM-DD)</Text>
          <TextInput
            value={birthdate}
            onChangeText={setBirthdate}
            onBlur={() => setTouched((t) => ({ ...t, birthdate: true }))}
            placeholder="2000-05-14"
            placeholderTextColor="#ffffff88"
            style={[
              styles.input,
              touched.birthdate && errors.birthInvalid && styles.inputError,
            ]}
          />
          {touched.birthdate && errors.birthInvalid && (
            <Text style={styles.errorText}>Usá el formato YYYY-MM-DD.</Text>
          )}

          <Text style={styles.label}>Sexo *</Text>
          <View style={styles.chipsRow}>
            {SEX_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setSex(opt)}
                style={[styles.chip, sex === opt && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    sex === opt && styles.chipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {touched.sex && errors.sexMissing && (
            <Text style={styles.errorText}>Seleccioná una opción.</Text>
          )}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                value={heightCm}
                onChangeText={setHeightCm}
                onBlur={() => setTouched((t) => ({ ...t, height: true }))}
                placeholder="174"
                placeholderTextColor="#ffffff88"
                keyboardType="numeric"
                style={[
                  styles.input,
                  touched.height && errors.heightInvalid && styles.inputError,
                ]}
              />
              {touched.height && errors.heightInvalid && (
                <Text style={styles.errorText}>Valor entre 1 y 300.</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                value={weightKg}
                onChangeText={setWeightKg}
                onBlur={() => setTouched((t) => ({ ...t, weight: true }))}
                placeholder="75.5"
                placeholderTextColor="#ffffff88"
                keyboardType="numeric"
                style={[
                  styles.input,
                  touched.weight && errors.weightInvalid && styles.inputError,
                ]}
              />
              {touched.weight && errors.weightInvalid && (
                <Text style={styles.errorText}>Valor entre 1 y 500.</Text>
              )}
            </View>
          </View>

          <Text style={styles.label}>Nivel de actividad *</Text>
          <View style={styles.chipsRow}>
            {ACTIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setActivityLevel(opt)}
                style={[
                  styles.chip,
                  activityLevel === opt && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    activityLevel === opt && styles.chipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {touched.activity && errors.activityMissing && (
            <Text style={styles.errorText}>Seleccioná una opción.</Text>
          )}

          <Text style={styles.label}>Objetivo principal *</Text>
          <View style={styles.chipsRow}>
            {GOAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setPrimaryGoal(opt)}
                style={[styles.chip, primaryGoal === opt && styles.chipActive]}
              >
                <Text
                  style={[
                    styles.chipText,
                    primaryGoal === opt && styles.chipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {touched.goal && errors.goalMissing && (
            <Text style={styles.errorText}>Seleccioná una opción.</Text>
          )}

          {/* ====== Preferencias dietarias ====== */}
          <Text style={styles.sectionTitle}>Preferencias dietarias</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Keto</Text>
            <Switch value={dietKeto} onValueChange={setDietKeto} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Vegetariana</Text>
            <Switch value={dietVegetarian} onValueChange={setDietVegetarian} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Sin gluten</Text>
            <Switch value={dietGlutenFree} onValueChange={setDietGlutenFree} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Sin lactosa</Text>
            <Switch value={dietDairyFree} onValueChange={setDietDairyFree} />
          </View>

          {/* ====== Alergias ====== */}
          <Text style={styles.label}>Alergias (separadas por coma)</Text>
          <TextInput
            value={allergies}
            onChangeText={setAllergies}
            placeholder="peanut, strawberry"
            placeholderTextColor="#ffffff88"
            style={styles.input}
          />

          {/* ====== Acciones ====== */}
          <TouchableOpacity
            onPress={() => {
              markAllTouched();
              onSubmit();
            }}
            disabled={submitting}
            style={[
              components.buttonPrimary,
              { marginTop: 16 },
              submitting && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.buttonText}>
              {submitting ? "Creando..." : "Crear cuenta"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.ghostBtn, { marginTop: 12 }]}
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
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    color: "#fff",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.fondoBaseOscuro,
    color: colors.textoPrincipal,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.textoSecundario + "33",
  },
  inputError: { borderColor: "#FF6B6B" },
  errorText: {
    color: "#FFB3B3",
    fontSize: 12,
    marginBottom: 2,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: colors.naranjaCTA,
    borderColor: colors.naranjaCTA,
  },
  chipText: { color: "#fff", fontWeight: "600" },
  chipTextActive: { color: "#1E1E1E", fontWeight: "700" },
  buttonText: { color: "#fff", fontWeight: "700" },
  ghostBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  ghostBtnText: { color: "#fff", fontWeight: "700" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  switchLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
