// ./screens/Entrenamiento/UserWorkoutTodayScreen.js

import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function UserWorkoutTodayScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { training, todayWorkout } = route.params || {};

  const exercises = Array.isArray(todayWorkout?.exercises)
    ? todayWorkout.exercises
    : [];

  // Estado local para checkboxes (por ahora solo en memoria)
  const [completedIds, setCompletedIds] = useState(() => new Set());

  const toggleExercise = (id) => {
    setCompletedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const completedCount = useMemo(() => completedIds.size, [completedIds.size]);

  const totalCount = exercises.length;

  const progressLabel =
    totalCount > 0
      ? `${completedCount}/${totalCount} ejercicios`
      : "Sin ejercicios";

  return (
    <LinearGradient
      colors={["#02010A", "#050816", "#1B0E0A"]}
      locations={[0, 0.4, 1]}
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
              <Text style={styles.screenTitle}>Entrenamiento de hoy</Text>
              {training?.program?.title ? (
                <Text style={styles.subtitle}>
                  Programa:{" "}
                  <Text style={styles.highlight}>{training.program.title}</Text>
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Si por alguna razón no viene todayWorkout */}
        {!todayWorkout ? (
          <View style={styles.center}>
            <Ionicons
              name="barbell-outline"
              size={40}
              color="rgba(255,255,255,0.6)"
            />
            <Text style={styles.emptyText}>
              No encontramos el entrenamiento de hoy.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {/* Card principal del día */}
            <View style={styles.mainCard}>
              <View style={styles.mainCardHeader}>
                <View style={styles.dayPill}>
                  <Ionicons
                    name="flame-outline"
                    size={14}
                    color="rgba(255,255,255,0.9)"
                  />
                  <Text style={styles.dayPillText}>
                    Día {todayWorkout.day_number}
                  </Text>
                </View>

                {training?.program?.duration_weeks ? (
                  <View style={styles.weekPill}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.weekPillText}>
                      {training.program.duration_weeks} semanas
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.workoutTitle}>
                {todayWorkout.title || `Sesión día ${todayWorkout.day_number}`}
              </Text>

              {/* Badges de info extra */}
              <View style={styles.badgesRow}>
                {training?.program?.goal ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="flag-outline"
                      size={13}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.badgeText}>
                      {training.program.goal}
                    </Text>
                  </View>
                ) : null}

                {training?.program?.level ? (
                  <View style={styles.badge}>
                    <Ionicons
                      name="bar-chart-outline"
                      size={13}
                      color="rgba(255,255,255,0.9)"
                    />
                    <Text style={styles.badgeText}>
                      Nivel {training.program.level}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Progreso del día */}
              <View style={styles.progressRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.progressLabel}>
                    Progreso de la sesión
                  </Text>
                  <Text style={styles.progressValue}>{progressLabel}</Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressCircleText}>
                    {totalCount > 0
                      ? Math.round((completedCount / totalCount) * 100)
                      : 0}
                    %
                  </Text>
                </View>
              </View>
            </View>

            {/* Lista de ejercicios */}
            <Text style={styles.sectionTitle}>Ejercicios de hoy</Text>

            {exercises.length === 0 ? (
              <View style={styles.emptyExercisesCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color="rgba(255,255,255,0.7)"
                />
                <Text style={styles.emptyExercisesText}>
                  Tu entrenador todavía no cargó ejercicios para este día.
                </Text>
              </View>
            ) : (
              exercises.map((ex, index) => {
                const done = completedIds.has(ex.id);
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={[
                      styles.exerciseCard,
                      done && styles.exerciseCardDone,
                    ]}
                    onPress={() => toggleExercise(ex.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.exerciseLeft}>
                      <TouchableOpacity
                        onPress={() => toggleExercise(ex.id)}
                        style={styles.checkbox}
                        activeOpacity={0.9}
                      >
                        <Ionicons
                          name={done ? "checkbox-outline" : "square-outline"}
                          size={22}
                          color={done ? "#4CAF50" : "rgba(255,255,255,0.85)"}
                        />
                      </TouchableOpacity>

                      <View style={styles.exerciseInfo}>
                        <View style={styles.exerciseTitleRow}>
                          <Text
                            style={[
                              styles.exerciseName,
                              done && styles.exerciseNameDone,
                            ]}
                          >
                            {index + 1}. {ex.name}
                          </Text>
                          {done && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color="#4CAF50"
                            />
                          )}
                        </View>

                        <Text style={styles.exerciseMeta}>
                          {ex.sets ? `${ex.sets} series` : "Series: -"}
                          {ex.reps ? ` · ${ex.reps} reps` : ""}
                          {ex.rest_sec ? ` · Descanso ${ex.rest_sec}s` : ""}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* Botón al final (futuro: marcar sesión completa, guardar en backend, etc) */}
            {exercises.length > 0 && (
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Finalizar entrenamiento
                </Text>
              </TouchableOpacity>
            )}
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

  // Header
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

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },

  // Card principal
  mainCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  weekPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  weekPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 10,
  },

  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  badgeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
    marginTop: 2,
  },
  progressCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  progressCircleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },

  // Lista de ejercicios
  emptyExercisesCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.3)",
    marginBottom: 18,
  },
  emptyExercisesText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },

  exerciseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  exerciseCardDone: {
    backgroundColor: "rgba(76,175,80,0.1)",
    borderColor: "rgba(76,175,80,0.6)",
  },
  exerciseLeft: {
    flexDirection: "row",
    flex: 1,
  },
  checkbox: {
    marginRight: 10,
    marginTop: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
  },
  exerciseNameDone: {
    textDecorationLine: "line-through",
    color: "rgba(200,255,200,0.9)",
  },
  exerciseMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
  },

  primaryButton: {
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: "#FFCF4A",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
});
