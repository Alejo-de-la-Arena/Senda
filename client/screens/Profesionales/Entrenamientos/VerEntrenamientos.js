// ./screens/Profesionales/Entrenamientos/VerEntrenamientos

import React, { useEffect, useState } from "react";
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
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from "../../../styles/theme";
import { getUserTrainingForTrainer } from "../../../api/profesionales";

export default function TrainerUserTrainingScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { userId, userName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [training, setTraining] = useState(null); // { program, workouts[] } o null

  const loadTraining = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUserTrainingForTrainer(userId);
      setTraining(data);
    } catch (e) {
      console.log("Error cargando entrenamiento del usuario", e);
      setError(
        e?.response?.data?.error ||
          "No pudimos cargar el entrenamiento de este usuario."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraining();
  }, [userId]);

  const handleConfigurePress = () => {
    navigation.navigate("TrainerConfigureTraining", { userId, userName });
  };

  const workoutsCount =
    Array.isArray(training?.workouts) && training.workouts.length
      ? training.workouts.length
      : 0;

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
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.screenTitle}>Entrenamiento</Text>
              {userName ? (
                <Text style={styles.subtitle}>
                  Alumno: <Text style={styles.highlight}>{userName}</Text>
                </Text>
              ) : null}
            </View>
          </View>

          <TouchableOpacity onPress={loadTraining} style={styles.refreshBtn}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Cargando entrenamiento...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadTraining} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : !training || !training.hasProgram ? (
          // Estado: no tiene programa asignado
          <View style={styles.center}>
            <Ionicons
              name="barbell-outline"
              size={40}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.emptyText}>
              Este usuario no tiene entrenamientos establecidos.
            </Text>
            <TouchableOpacity
              onPress={handleConfigurePress}
              style={styles.primaryButton}
            >
              <Ionicons name="add-outline" size={18} color="#111" />
              <Text style={styles.primaryButtonText}>
                Configurar entrenamiento
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Estado: tiene programa
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {/* Card de programa */}
            <Text style={styles.sectionTitle}>Plan actual</Text>
            <View style={styles.programCard}>
              <View style={styles.programHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.programTitle}>
                    {training.program.title || "Programa sin título"}
                  </Text>
                  {workoutsCount > 0 && (
                    <Text style={styles.programSubtitle}>
                      {workoutsCount}{" "}
                      {workoutsCount === 1
                        ? "día de entrenamiento"
                        : "días de entrenamiento"}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleConfigurePress}
                  style={styles.smallEditButton}
                >
                  <Ionicons name="create-outline" size={16} color="#111" />
                  <Text style={styles.smallEditButtonText}>Cambiar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.programBadgesRow}>
                {training.program.goal ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="flag-outline"
                      size={12}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.badgeText}>
                      Objetivo: {training.program.goal}
                    </Text>
                  </View>
                ) : null}

                {training.program.level ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="bar-chart-outline"
                      size={12}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.badgeText}>
                      Nivel: {training.program.level}
                    </Text>
                  </View>
                ) : null}

                {training.program.duration_weeks ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.badgeText}>
                      {training.program.duration_weeks} semanas
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Divisor sección días */}
            <View style={styles.sectionDivider}>
              <View style={styles.sectionDividerLine} />
              <Text style={styles.sectionDividerText}>
                Días de entrenamiento
              </Text>
              <View style={styles.sectionDividerLine} />
            </View>

            {/* Workouts / días */}
            {Array.isArray(training.workouts) &&
              training.workouts.map((w) => (
                <View key={w.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <View style={styles.dayPill}>
                      <Text style={styles.dayPillText}>Día {w.day_number}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.workoutTitle}>
                        {w.title || "Sesión de entrenamiento"}
                      </Text>
                      {w.notes ? (
                        <Text style={styles.workoutNotes} numberOfLines={2}>
                          {w.notes}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Lista de ejercicios */}
                  {Array.isArray(w.exercises) && w.exercises.length > 0 ? (
                    <View style={styles.exerciseList}>
                      {w.exercises.map((ex, index) => (
                        <View key={ex.id} style={styles.exerciseRow}>
                          <View style={styles.exerciseBullet}>
                            <Text style={styles.exerciseIndex}>
                              {index + 1}
                            </Text>
                          </View>
                          <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            <Text style={styles.exerciseMeta}>
                              {ex.sets ? `${ex.sets} x ` : ""}
                              {ex.reps || "-"}
                              {ex.rest_sec
                                ? ` · Descanso: ${ex.rest_sec}s`
                                : ""}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noExercisesText}>
                      Este día aún no tiene ejercicios cargados.
                    </Text>
                  )}
                </View>
              ))}
          </ScrollView>
        )}
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
  refreshBtn: {
    padding: 6,
    borderRadius: 999,
  },

  // estados
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.7)",
  },
  errorText: {
    color: "#FFB3B3",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.naranjaCTA,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  // sección plan actual
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 6,
  },
  programCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  programTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  programSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  programBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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

  smallEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.naranjaCTA,
  },
  smallEditButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111",
  },

  // Divisor sección días
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  sectionDividerText: {
    marginHorizontal: 8,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // Workout cards
  workoutCard: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
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
    marginTop: 4,
  },

  exerciseList: {
    marginTop: 4,
    gap: 6,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
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
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  noExercisesText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
});
