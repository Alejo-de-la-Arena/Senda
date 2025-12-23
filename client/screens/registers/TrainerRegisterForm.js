import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signup } from "../../api/auth";
import { components, colors } from "../../styles/theme";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function TrainerRegisterForm({ navigation }) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Especialidades como tags
  const [specialties, setSpecialties] = useState([]); // string[]
  const [specialtyInput, setSpecialtyInput] = useState("");

  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const e = email.trim();
    const p = password;
    const n = name.trim();
    const b = bio.trim();
    return {
      emptyName: n.length === 0,
      emptyEmail: e.length === 0,
      invalidEmail: e.length > 0 && !EMAIL_REGEX.test(e),
      emptyPassword: p.length === 0,
      shortPassword: p.length > 0 && p.length < 8,
      emptyBio: b.length === 0,
    };
  }, [name, email, password, bio]);

  const hasAnyError =
    errors.emptyName ||
    errors.emptyEmail ||
    errors.invalidEmail ||
    errors.emptyPassword ||
    errors.shortPassword ||
    errors.emptyBio;

  const markAllTouched = () =>
    setTouched({ name: true, email: true, password: true, bio: true });

  const handleAddSpecialty = () => {
    const value = specialtyInput.trim();
    if (!value) return;
    if (specialties.includes(value)) {
      setSpecialtyInput("");
      return;
    }
    setSpecialties((prev) => [...prev, value]);
    setSpecialtyInput("");
  };

  const handleRemoveSpecialty = (value) => {
    setSpecialties((prev) => prev.filter((s) => s !== value));
  };

  const onSubmit = async () => {
    markAllTouched();
    if (hasAnyError) return;

    setSubmitting(true);
    try {
      // 1) crear usuario como "trainer"
      const payload = {
        name: name.trim(),
        surname: surname.trim() || null,
        email: email.trim(),
        password,
        role: "trainer",
        phone: phone.trim() || null,

        // estos 2 si querés inventarlos
        activity_level: "moderate",
        primary_goal: "performance",

        trainer_profile: {
          bio: bio.trim(),
          specialties, // ahora ya es array de strings
          social_links: {
            instagram: instagram.trim() || "",
            youtube: youtube.trim() || "",
            tiktok: tiktok.trim() || "",
          },
        },
      };

      await signup(payload);
      Alert.alert(
        "Cuenta creada",
        "Tu cuenta de entrenador fue creada con éxito ✨"
      );
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
    <View>
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
        keyboardType="email-address"
        autoCapitalize="none"
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

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+54 9 11 2345 6789"
        placeholderTextColor="#ffffff88"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Bio *</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        onBlur={() => setTouched((t) => ({ ...t, bio: true }))}
        placeholder="Contá brevemente quién sos como entrenador..."
        placeholderTextColor="#ffffff88"
        multiline
        numberOfLines={4}
        style={[
          styles.input,
          styles.multiline,
          touched.bio && errors.emptyBio && styles.inputError,
        ]}
      />
      {touched.bio && errors.emptyBio && (
        <Text style={styles.errorText}>La bio es obligatoria.</Text>
      )}

      {/* Especialidades como tags */}
      <Text style={styles.label}>Especialidades</Text>
      <View style={styles.specialtyRow}>
        <TextInput
          value={specialtyInput}
          onChangeText={setSpecialtyInput}
          placeholder="Hipertrofia, Crossfit, Running..."
          placeholderTextColor="#ffffff88"
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={handleAddSpecialty}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#1E1E1E" />
        </TouchableOpacity>
      </View>

      {specialties.length > 0 && (
        <View style={styles.tagsContainer}>
          {specialties.map((item) => (
            <View key={item} style={styles.tag}>
              <Text style={styles.tagText}>{item}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveSpecialty(item)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close" size={14} color="#1E1E1E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>Instagram</Text>
      <TextInput
        value={instagram}
        onChangeText={setInstagram}
        placeholder="@tucuenta"
        placeholderTextColor="#ffffff88"
        style={styles.input}
      />

      <Text style={styles.label}>YouTube</Text>
      <TextInput
        value={youtube}
        onChangeText={setYoutube}
        placeholder="link o usuario"
        placeholderTextColor="#ffffff88"
        style={styles.input}
      />

      <Text style={styles.label}>TikTok</Text>
      <TextInput
        value={tiktok}
        onChangeText={setTiktok}
        placeholder="@tucuenta"
        placeholderTextColor="#ffffff88"
        style={styles.input}
      />

      <TouchableOpacity
        onPress={onSubmit}
        disabled={submitting}
        style={[
          components.buttonPrimary,
          { marginTop: 16 },
          submitting && { opacity: 0.6 },
        ]}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {submitting ? "Creando..." : "Crear cuenta de entrenador"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: "#fff", marginTop: 10, marginBottom: 6 },
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
  multiline: { height: 100, textAlignVertical: "top" },
  inputError: { borderColor: "#FF6B6B" },
  errorText: { color: "#FFB3B3", fontSize: 12, marginBottom: 2 },

  specialtyRow: {
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
