// ./screens/Entrenamiento/AIWorkoutPreviewScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { api } from "../../../api/api";

// Habilitar animaciones en Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AIWorkoutPreviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { draftProgram, userProfile, answers } = route.params || {};

  const [expandedDay, setExpandedDay] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!draftProgram) {
    return (
      <LinearGradient
        colors={["#02010A", "#05030F", "#120C08"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Entrenamiento IA</Text>
          </View>

          <View style={styles.center}>
            <Text style={styles.errorText}>
              No se pudo cargar el programa generado.
            </Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Volver</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const {
    program_title,
    goal,
    level,
    duration_weeks,
    workouts = [],
    finalNote,
  } = draftProgram;

  const toggleDay = (dayNumber) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDay((prev) => (prev === dayNumber ? null : dayNumber));
  };

  const handleAcceptProgram = async () => {
    try {
      setSaving(true);

      const body = {
        draftProgram,
        userProfile,
        answers,
        // opcional:
        // start_date: selectedDate || undefined,
      };

      const resp = await api.post("/program/workout/commit", body);
      console.log("✅ Programa IA guardado y asignado:", resp.data);

      // Opciones de navegación:
      // 1) Volver una screen
      navigation.goBack();

      // 2) O ir directo a la home / Tu día y recargar:
      // navigation.navigate("TuDia", { refreshTraining: true });
    } catch (e) {
      console.log("Error al guardar programa IA", e);
      // Acá podés setear un error local o toast
      // setError("No pudimos guardar tu programa. Intentalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAnother = () => {
    // Opción 1: Volver al cuestionario para que revise cosas
    navigation.goBack();

    // Opción 2 (futuro): re-llamar al endpoint con los mismos answers
    // y hacer un replace de esta screen.
  };

  return (
    <LinearGradient
      colors={["#02010A", "#05030F", "#120C08"]}
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
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.screenTitle}>Revisá tu plan IA</Text>
              {userProfile?.name && (
                <Text style={styles.subtitle}>
                  Para <Text style={styles.highlight}>{userProfile.name}</Text>
                </Text>
              )}
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {/* Card principal del programa */}
          <View style={styles.programCard}>
            <Text style={styles.programTitle}>
              {program_title || "Programa generado con IA"}
            </Text>

            <View style={styles.badgeRow}>
              {goal ? (
                <View style={styles.badge}>
                  <Ionicons
                    name="flag-outline"
                    size={12}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.badgeText}>Objetivo: {goal}</Text>
                </View>
              ) : null}

              {level ? (
                <View style={styles.badge}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={12}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.badgeText}>Nivel: {level}</Text>
                </View>
              ) : null}

              {duration_weeks ? (
                <View style={styles.badge}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.badgeText}>{duration_weeks} semanas</Text>
                </View>
              ) : null}
            </View>

            {answers?.days_per_week && (
              <Text style={styles.programMeta}>
                Días por semana:{" "}
                <Text style={styles.programMetaHighlight}>
                  {answers.days_per_week}
                </Text>
              </Text>
            )}

            {answers?.extra_activities &&
              answers.extra_activities !== "ninguna" && (
                <Text style={styles.programMeta}>
                  Actividades extra:{" "}
                  <Text style={styles.programMetaHighlight}>
                    {answers.extra_activities}
                  </Text>
                </Text>
              )}
          </View>

          {/* Días de entrenamiento */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Días de entrenamiento</Text>
            <Text style={styles.sectionSubtitle}>
              Tocá un día para ver los ejercicios
            </Text>
          </View>

          {Array.isArray(workouts) &&
            workouts.map((w) => {
              const isExpanded = expandedDay === w.day_number;
              return (
                <View key={w.day_number} style={styles.workoutCard}>
                  <TouchableOpacity
                    style={styles.workoutHeader}
                    onPress={() => toggleDay(w.day_number)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.dayPill}>
                      <Text style={styles.dayPillText}>Día {w.day_number}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.workoutTitle}>
                        {w.title || "Sesión de entrenamiento"}
                      </Text>
                      {w.notes ? (
                        <Text style={styles.workoutNotes} numberOfLines={2}>
                          {w.notes}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="rgba(255,255,255,0.7)"
                    />
                  </TouchableOpacity>

                  {isExpanded && Array.isArray(w.exercises) && (
                    <View style={styles.exerciseList}>
                      {w.exercises.map((ex, idx) => (
                        <View key={idx} style={styles.exerciseRow}>
                          <View style={styles.exerciseBullet}>
                            <Text style={styles.exerciseIndex}>{idx + 1}</Text>
                          </View>
                          <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            <Text style={styles.exerciseMeta}>
                              {ex.sets} x {ex.reps} · Descanso {ex.rest_sec}s
                            </Text>
                            {ex.weight_hint ? (
                              <Text style={styles.exerciseMetaSecondary}>
                                {ex.weight_hint}
                              </Text>
                            ) : null}
                            {ex.notes ? (
                              <Text style={styles.exerciseNotes}>
                                {ex.notes}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}

          {/* Nota final */}
          {finalNote && (
            <View style={styles.finalNoteCard}>
              <View style={styles.finalNoteHeader}>
                <Ionicons
                  name="bulb-outline"
                  size={18}
                  color="rgba(255,255,255,0.85)"
                />
                <Text style={styles.finalNoteTitle}>Tips finales</Text>
              </View>
              <Text style={styles.finalNoteText}>{finalNote}</Text>
            </View>
          )}

          {/* Botones de acción */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGenerateAnother}
              disabled={saving}
            >
              <Text style={styles.secondaryButtonText}>Generar otro</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, saving && { opacity: 0.7 }]}
              onPress={handleAcceptProgram}
              disabled={saving}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color="#111"
              />
              <Text style={styles.primaryButtonText}>
                {saving ? "Guardando..." : "Aceptar programa"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 12,
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
  highlight: {
    color: "#fff",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#FFB3B3",
    textAlign: "center",
    marginBottom: 12,
  },

  programCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  programTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  badgeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },
  programMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  programMetaHighlight: {
    color: "rgba(255,255,255,0.96)",
    fontWeight: "600",
  },

  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  workoutCard: {
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  workoutTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
  },
  workoutNotes: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  exerciseList: {
    marginTop: 10,
    gap: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  exerciseBullet: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 2,
  },
  exerciseIndex: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "500",
  },
  exerciseMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  exerciseMetaSecondary: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  exerciseNotes: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  finalNoteCard: {
    marginTop: 12,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  finalNoteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  finalNoteTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  finalNoteText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});
