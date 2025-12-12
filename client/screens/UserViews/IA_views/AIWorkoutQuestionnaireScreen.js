// ./screens/Entrenamiento/AIWorkoutQuestionnaireScreen.js

import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getMe, generateAIWorkout } from "../../../api/user"; // 👈 ajustá el path si hace falta
import { colors } from "../../../styles/theme";

function PillOptionRow({ label, options, value, onChange }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.questionLabel}>{label}</Text>
      <View style={styles.pillsRow}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onChange(opt.value)}
            >
              <Text
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MultiPillRow({ label, options, values, onToggle }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.questionLabel}>{label}</Text>
      <View style={styles.pillsRow}>
        {options.map((opt) => {
          const isActive = values.includes(opt.value);
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onToggle(opt.value)}
            >
              <Text
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Helper para calcular edad desde "YYYY-MM-DD"
function getAgeFromBirthdate(birthdate) {
  if (!birthdate) return null;
  const [year, month, day] = birthdate.split("-").map((n) => parseInt(n, 10));
  if (!year || !month || !day) return null;

  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1 - month;
  const d = today.getDate() - day;

  if (m < 0 || (m === 0 && d < 0)) {
    age--;
  }
  return age;
}

export default function AIWorkoutQuestionnaireScreen() {
  const navigation = useNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 🔹 Estados del cuestionario
  const [daysPerWeek, setDaysPerWeek] = useState(null);
  const [hasGymAccess, setHasGymAccess] = useState(null);
  const [extraActivities, setExtraActivities] = useState([]);
  const [timePerDay, setTimePerDay] = useState(null);
  const [intensity, setIntensity] = useState(null);

  // 🔹 Perfil del usuario (getMe)
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");
        const me = await getMe();
        setUserProfile(me);
        // console.log("[AI Questionnaire] Perfil usuario:", me);
      } catch (e) {
        console.log("Error cargando perfil en cuestionario IA", e);
        setProfileError(
          "No pudimos cargar tus datos. Igual podés continuar, pero el plan será menos preciso."
        );
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const toggleActivity = (value) => {
    setExtraActivities((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      return [...prev, value];
    });
  };

  const canContinue = useMemo(() => {
    return (
      daysPerWeek !== null &&
      hasGymAccess !== null &&
      timePerDay !== null &&
      intensity !== null
    );
  }, [daysPerWeek, hasGymAccess, timePerDay, intensity]);

  const handleContinue = async () => {
    // Datos de perfil relevantes para la IA
    const age = getAgeFromBirthdate(userProfile?.birthdate);

    const aiRequest = {
      userProfile: {
        user_id: userProfile?.id,
        sex: userProfile?.sex,
        height_cm: userProfile?.height_cm,
        weight_kg: userProfile?.weight_kg,
        primary_goal: userProfile?.primary_goal,
        age,
        dietary_prefs: userProfile?.dietary_prefs || null,
        allergies: userProfile?.allergies || [],
        activity_level: userProfile?.activity_level || null,
      },
      answers: {
        days_per_week: daysPerWeek,
        has_gym: hasGymAccess,
        extra_activities: extraActivities,
        time_per_day: timePerDay,
        intensity,
      },
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const aiProgram = await generateAIWorkout(aiRequest);
      console.log("✅ Programa IA generado:", aiProgram);

      if (!aiProgram) {
        setSubmitError(
          "La IA no pudo generar un entrenamiento válido. Probá de nuevo."
        );
        return;
      }

      // 👉 Ir a la pantalla de previsualización
      navigation.navigate("AIWorkoutPreview", {
        draftProgram: aiProgram,
        userProfile: aiRequest.userProfile,
        answers: aiRequest.answers,
      });
    } catch (e) {
      console.log("Error generando entrenamiento con IA", e);
      setSubmitError(
        e?.response?.data?.error ||
          "No pudimos generar tu entrenamiento. Intentalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Info rápida de perfil para mostrar arriba
  const quickGoal = userProfile?.primary_goal;
  const quickWeight = userProfile?.weight_kg;
  const quickHeight = userProfile?.height_cm;
  const quickAge = getAgeFromBirthdate(userProfile?.birthdate);

  return (
    <LinearGradient
      colors={[
        colors.azulProfundo,
        colors.fondoBaseOscuro,
        colors.marronTierra,
      ]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.screenTitle}>Entrenamiento con IA</Text>
              <Text style={styles.subtitle}>
                Contanos un poco de vos y de tu rutina
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* Mini info arriba (perfil + explicación) */}
          <View style={styles.infoCard}>
            <Ionicons
              name="sparkles-outline"
              size={22}
              color="rgba(255,255,255,0.9)"
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoTitle}>Plan 100% personal</Text>
              <Text style={styles.infoText}>
                Usamos tus respuestas, junto con tus datos de perfil (edad,
                peso, objetivo, etc.), para armar un programa hecho a tu medida.
              </Text>

              {profileLoading ? (
                <View style={styles.profileMiniRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.profileMiniText}>
                    Cargando tus datos...
                  </Text>
                </View>
              ) : profileError ? (
                <Text style={[styles.profileMiniText, { color: "#FFB3B3" }]}>
                  {profileError}
                </Text>
              ) : userProfile ? (
                <View style={styles.profileChipsRow}>
                  {quickAge && (
                    <View style={styles.profileChip}>
                      <Ionicons
                        name="person-outline"
                        size={12}
                        color="rgba(255,255,255,0.85)"
                      />
                      <Text style={styles.profileChipText}>
                        {quickAge} años
                      </Text>
                    </View>
                  )}
                  {quickWeight && (
                    <View style={styles.profileChip}>
                      <Ionicons
                        name="barbell-outline"
                        size={12}
                        color="rgba(255,255,255,0.85)"
                      />
                      <Text style={styles.profileChipText}>
                        {quickWeight} kg
                      </Text>
                    </View>
                  )}
                  {quickHeight && (
                    <View style={styles.profileChip}>
                      <Ionicons
                        name="resize-outline"
                        size={12}
                        color="rgba(255,255,255,0.85)"
                      />
                      <Text style={styles.profileChipText}>
                        {quickHeight} cm
                      </Text>
                    </View>
                  )}
                  {quickGoal && (
                    <View style={styles.profileChip}>
                      <Ionicons
                        name="flag-outline"
                        size={12}
                        color="rgba(255,255,255,0.85)"
                      />
                      <Text style={styles.profileChipText}>
                        Objetivo: {quickGoal}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          </View>

          {/* Pregunta 1: días por semana */}
          <PillOptionRow
            label="¿Cuántos días a la semana pensás entrenar?"
            value={daysPerWeek}
            onChange={setDaysPerWeek}
            options={[
              { label: "2", value: 2 },
              { label: "3", value: 3 },
              { label: "4", value: 4 },
              { label: "5", value: 5 },
              { label: "6", value: 6 },
              { label: "7", value: 7 },
            ]}
          />

          {/* Pregunta 2: acceso a gimnasio */}
          <PillOptionRow
            label="¿Tenés acceso a un gimnasio?"
            value={hasGymAccess}
            onChange={setHasGymAccess}
            options={[
              { label: "Sí, gimnasio completo", value: "full_gym" },
              { label: "Algunas máquinas/pesas", value: "partial_gym" },
              { label: "No, entreno en casa", value: "home" },
            ]}
          />

          {/* Pregunta 3: actividades extras */}
          <MultiPillRow
            label="¿Querés que tengamos en cuenta actividades fuera del gym?"
            values={extraActivities}
            onToggle={toggleActivity}
            options={[
              { label: "Correr", value: "running" },
              { label: "Ciclismo", value: "cycling" },
              { label: "Caminatas", value: "walking" },
              { label: "Deportes en equipo", value: "team_sports" },
              { label: "Otra / ocasional", value: "other" },
            ]}
          />

          {/* Pregunta 4: tiempo diario */}
          <PillOptionRow
            label="¿Cuánto tiempo aproximado tenés para entrenar cada día?"
            value={timePerDay}
            onChange={setTimePerDay}
            options={[
              { label: "Hasta 30 min", value: "up_to_30_minutes" },
              { label: "30-45 min", value: "30_45_minutes" },
              { label: "45-60 min", value: "45_60_minutes" },
              { label: "Más de 60 min", value: "more_than_60_minutes" },
            ]}
          />

          {/* Pregunta 5: intensidad */}
          <PillOptionRow
            label="¿Qué intensidad buscás en tu plan?"
            value={intensity}
            onChange={setIntensity}
            options={[
              { label: "Suave / inicial", value: "light" },
              { label: "Moderada", value: "moderate" },
              { label: "Intensa", value: "intense" },
            ]}
          />

          {/* Botón continuar */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!canContinue || isSubmitting) && styles.primaryButtonDisabled,
            ]}
            disabled={!canContinue || isSubmitting}
            onPress={handleContinue}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#111" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Generar Plan</Text>
                <Ionicons
                  name="sparkles-outline"
                  size={22}
                  color="rgba(0, 0, 0, 0.9)"
                />
              </>
            )}
          </TouchableOpacity>

          {!canContinue && !isSubmitting && (
            <Text style={styles.helperText}>
              Completá las preguntas principales para continuar.
            </Text>
          )}

          {submitError ? (
            <Text
              style={[styles.helperText, { color: "#FFB3B3", marginTop: 4 }]}
            >
              {submitError}
            </Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  profileMiniRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  profileMiniText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginLeft: 8,
  },
  profileChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  profileChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  profileChipText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },

  questionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  pillActive: {
    backgroundColor: "#FFCF4A",
    borderColor: "#FFCF4A",
  },
  pillText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  pillTextActive: {
    color: "#111",
    fontWeight: "700",
  },

  primaryButton: {
    marginTop: 8,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "#FFCF4A",
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: "15"
  },
  primaryButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});
