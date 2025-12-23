import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { signup } from "../../api/auth";
import {
  components,
  colors,
  borderRadius,
  typography,
} from "../../styles/theme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

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

function formatDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function UserRegisterForm({ navigation }) {
  // Campos básicos (requeridos)
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  // Campos de perfil
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState(null); // Date | null
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  const [activityLevel, setActivityLevel] = useState(null);
  const [primaryGoal, setPrimaryGoal] = useState(null);

  // Preferencias dietarias
  const [dietKeto, setDietKeto] = useState(false);
  const [dietVegetarian, setDietVegetarian] = useState(false);
  const [dietGlutenFree, setDietGlutenFree] = useState(false);
  const [dietDairyFree, setDietDairyFree] = useState(false);

  // Alergias como lista de tags
  const [allergies, setAllergies] = useState([]); // string[]
  const [allergyInput, setAllergyInput] = useState("");

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Validaciones locales
  const errors = useMemo(() => {
    const e = email.trim();
    const p = password;
    const n = name.trim();

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

  const handleAddAllergy = () => {
    const value = allergyInput.trim();
    if (!value) return;
    if (allergies.includes(value)) {
      setAllergyInput("");
      return;
    }
    setAllergies((prev) => [...prev, value]);
    setAllergyInput("");
  };

  const handleRemoveAllergy = (value) => {
    setAllergies((prev) => prev.filter((a) => a !== value));
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (event?.type !== "set") return;
      if (selectedDate) setBirthdate(selectedDate);
    } else {
      // iOS: se muestra inline o en modal según config
      if (selectedDate) setBirthdate(selectedDate);
    }
  };

  const onSubmit = async () => {
    markAllTouched();
    if (hasAnyError) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        surname: surname.trim() || null,
        email: email.trim(),
        password,
        role: "user",
        phone: phone.trim() || null,
        birthdate: birthdate ? formatDate(birthdate) : null, // YYYY-MM-DD desde Date
        sex,
        height_cm: heightCm === "" ? null : Number(heightCm),
        weight_kg: weightKg === "" ? null : Number(weightKg),
        activity_level: activityLevel,
        primary_goal: primaryGoal,
        dietary_prefs: {
          keto: dietKeto,
          vegetarian: dietVegetarian,
          gluten_free: dietGlutenFree,
          dairy_free: dietDairyFree,
        },
        allergies, // ya es array de strings
      };

      await signup(payload);
      Alert.alert("Cuenta creada", "Tu cuenta fue creada con éxito ✨");
      navigation.replace("Login");
    } catch (e) {
      console.error(e?.response?.data || e);
      Alert.alert(
        "Error",
        e?.response?.data?.error || "Ocurrió un error al crear la cuenta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
      {touched.password && !errors.emptyPassword && errors.shortPassword && (
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

      {/* Fecha de nacimiento con datepicker */}
      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TouchableOpacity
        onPress={() => {
          setTouched((t) => ({ ...t, birthdate: true }));
          setShowDatePicker(true);
        }}
        style={[styles.input, styles.dateInput]}
        activeOpacity={0.8}
      >
        <Text
          style={{
            color: birthdate ? colors.textoPrincipal : "#ffffff88",
          }}
        >
          {birthdate ? formatDate(birthdate) : "Seleccionar fecha"}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={18}
          color="#ffffffaa"
          style={{ position: "absolute", right: 12 }}
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={
            birthdate || new Date(new Date().getFullYear() - 20, 0, 1) // por defecto 20 años atrás
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
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
              style={[styles.chipText, sex === opt && styles.chipTextActive]}
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
            style={[styles.chip, activityLevel === opt && styles.chipActive]}
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

      {/* ====== Alergias con tags ====== */}
      <Text style={styles.label}>Alergias</Text>
      <View style={styles.allergyRow}>
        <TextInput
          value={allergyInput}
          onChangeText={setAllergyInput}
          placeholder="Ej: maní, gluten"
          placeholderTextColor="#ffffff88"
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={handleAddAllergy}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      {allergies.length > 0 && (
        <View style={styles.tagsContainer}>
          {allergies.map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveAllergy(item)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close" size={14} color="#1E1E1E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ====== Acción ====== */}
      <TouchableOpacity
        onPress={onSubmit}
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
    </>
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
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
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
  allergyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  addTagButton: {
    height: 48,
    width: 48,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.naranjaCTA,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 4,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },
  tagText: {
    color: "#1E1E1E",
    fontSize: 12,
    marginRight: 6,
    fontWeight: "600",
  },
});
