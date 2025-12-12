// ./screens/TuDiaTodayView.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import PillSwitcher from "../../components/PillSwitcher";

const TuDiaTodayView = ({
  navigation,
  todayPlan,
  selectedRitual,
  onSelectRitual,
  breathingStatus,
  setViewMode,
  supplements,
  toggleSupplement,
  openSupplementsModal,
  training, // { hasProgram, program, workouts[] }
  trainingLoading,
  trainingError,
  diet,
  dietToday,
  dietLoading,
  dietError,
  regenLeft,
  regenMax,
  onGenerateDiet,
  onPressMeal,
}) => {
  const hasProgram = !!training?.hasProgram;

  // 👉 Definimos el "entrenamiento del día" en base a workouts
  let todayWorkout = null;
  if (
    hasProgram &&
    Array.isArray(training?.workouts) &&
    training.workouts.length > 0
  ) {
    const sorted = [...training.workouts].sort(
      (a, b) => (a.day_number ?? 0) - (b.day_number ?? 0)
    );
    // Por ahora: tomamos el primer día del programa como "día de hoy"
    todayWorkout = sorted[0];
  }
  return (
    <>
      {/* Tipo de día */}
      <View style={styles.dayTypeCard}>
        <View
          style={[
            styles.dayTypeIcon,
            { backgroundColor: todayPlan.dayTypeColor + "20" },
          ]}
        >
          <Ionicons
            name={todayPlan.dayTypeIcon}
            size={24}
            color={todayPlan.dayTypeColor}
          />
        </View>
        <View style={styles.dayTypeInfo}>
          <Text style={styles.dayTypeLabel}>{todayPlan.dayTypeLabel}</Text>
          <Text style={styles.dayTypeSubtext}>
            {todayPlan.isMealPrepDay && "Día de Meal Prep • "}
            {todayPlan.isShoppingDay && "Día de Compras • "}
            {todayPlan.totalCalories &&
              `${todayPlan.totalCalories} kcal objetivo`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setViewMode("week")}>
          <Ionicons
            name="calendar-outline"
            size={24}
            color="rgba(255,255,255,0.6)"
          />
        </TouchableOpacity>
      </View>

      {/* Shopping List Alert (si es día de compras) */}
      {todayPlan.isShoppingDay && (
        <TouchableOpacity style={styles.shoppingAlert}>
          <LinearGradient
            colors={["#FFB347", "#FF8C42"]}
            style={styles.shoppingAlertGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cart-outline" size={24} color="white" />
            <View style={styles.shoppingAlertContent}>
              <Text style={styles.shoppingAlertTitle}>
                Lista de Compras Lista
              </Text>
              <Text style={styles.shoppingAlertSubtext}>
                {todayPlan.shoppingList?.filter((i) => !i.bought).length || 0}{" "}
                items • {todayPlan.estimatedBudget || "$0"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Ritual Switcher */}
      <PillSwitcher selected={selectedRitual} onSelect={onSelectRitual} />

      {/* Breathe */}
      {selectedRitual === "breathe" && todayPlan.breathing && (
        <View style={styles.plannedCard}>
          <View style={styles.plannedHeader}>
            <Text style={styles.plannedTitle}>Breathe de hoy</Text>
            <View
              style={[
                styles.statusBadge,
                breathingStatus === "completed" && styles.completedBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {breathingStatus === "completed"
                  ? "Completado"
                  : breathingStatus === "incomplete"
                    ? "No realizada del todo"
                    : "Pendiente"}
              </Text>
            </View>
          </View>
          <View style={styles.plannedContent}>
            <Text style={styles.plannedName}>
              Sesión personalizada de respiración
            </Text>
            <Text style={styles.plannedDuration}>
              Generada según tu estado de ánimo de hoy
            </Text>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("BreatheSetup")}
          >
            <Text style={styles.startButtonText}>
              {breathingStatus === "completed" ? "Repetir" : "Iniciar"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ENTRENAMIENTO DEL DÍA */}
      {selectedRitual === "train" && (
        <>
          {trainingLoading ? (
            <View style={styles.trainingEmptyCard}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.trainingEmptyTitle}>
                Cargando tu entrenamiento...
              </Text>
            </View>
          ) : trainingError ? (
            <View style={styles.trainingEmptyCard}>
              <Text style={styles.trainingEmptyTitle}>
                No pudimos cargar tu entrenamiento
              </Text>
              <Text style={styles.trainingEmptySubtitle}>{trainingError}</Text>
            </View>
          ) : !hasProgram || !todayWorkout ? (
            <View style={styles.trainingEmptyCard}>
              <Ionicons
                name="barbell-outline"
                size={28}
                color="rgba(255,255,255,0.7)"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.trainingEmptyTitle}>
                No tienes ningún programa de entrenamiento asignado
              </Text>
              <Text style={styles.trainingEmptySubtitle}>
                Pídele a tu entrenador que te asigne uno o generá uno con IA.
              </Text>

              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => {
                  navigation.navigate("AIWorkoutQuestionnaire");
                }}
              >
                <Ionicons name="sparkles-outline" size={18} color="#111" />
                <Text style={styles.aiButtonText}>
                  Generar entrenamiento con IA
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.plannedCard}>
              <View style={styles.plannedHeader}>
                <View>
                  <Text style={styles.plannedTitle}>Entrenamiento del Día</Text>
                  {training.program?.title ? (
                    <Text style={styles.trainingProgramName}>
                      {training.program.title}
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.statusBadge]}>
                  <Text style={styles.statusText}>
                    Día {todayWorkout.day_number}
                  </Text>
                </View>
              </View>

              <View style={styles.plannedContent}>
                <Text style={styles.plannedName}>
                  {todayWorkout.title
                    ? todayWorkout.title
                    : `Día ${todayWorkout.day_number}`}
                </Text>
                {todayWorkout.exercises?.length ? (
                  <Text style={styles.plannedDuration}>
                    {todayWorkout.exercises.length} ejercicios para hoy
                  </Text>
                ) : (
                  <Text style={styles.plannedDuration}>
                    Aún no hay ejercicios cargados para hoy.
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() =>
                  navigation.navigate("UserWorkoutToday", {
                    training,
                    todayWorkout,
                  })
                }
              >
                <Text style={styles.startButtonText}>Ver entrenamiento</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Comidas */}
      {selectedRitual === "eat" && (
        <View style={styles.mealsContainer}>
          <View style={styles.mealsHeader}>
            <View>
              <Text style={styles.mealsTitle}>Plan de Comidas de Hoy</Text>
              <Text style={styles.mealsSubtitle}>
                Generado en tiempo real según tu perfil
              </Text>
            </View>
            {dietToday?.totalCalories && (
              <Text style={styles.mealsCalories}>
                {dietToday.totalCalories} kcal
              </Text>
            )}
          </View>

          {/* Botón principal de IA */}
          <TouchableOpacity
            style={[
              styles.regenerateButton,
              (dietLoading || regenLeft === 0) && { opacity: 0.5 },
            ]}
            onPress={onGenerateDiet}
            disabled={dietLoading || regenLeft === 0}
          >
            {dietLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.regenerateButtonText}>
                  Generando tu plan...
                </Text>
              </>
            ) : (
              <Text style={styles.regenerateButtonText}>
                {diet
                  ? "Regenerar plan personalizado de hoy"
                  : "Generar plan personalizado de hoy"}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.mealsHint}>
            Tocá cualquier comida para ver los ingredientes y cantidades exactas.
          </Text>

          {typeof regenLeft === "number" && regenMax && (
            <Text style={styles.regenInfoText}>
              {regenLeft > 0
                ? `Te quedan ${regenLeft}/${regenMax} regeneraciones hoy`
                : "Alcanzaste el máximo de regeneraciones para hoy."}
            </Text>
          )}

          {/* Mensajes de estado */}
          {dietError && !dietLoading && (
            <View style={{ paddingVertical: 12 }}>
              <Text
                style={{ color: "#ffb3b3", fontSize: 13, marginBottom: 8 }}
              >
                {dietError}
              </Text>
              <TouchableOpacity
                style={styles.prepareButton}
                onPress={onGenerateDiet}
              >
                <Text style={styles.prepareButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {!diet && !dietLoading && !dietError && (
            <Text style={styles.mealsHint}>
              Todavía no generaste tu plan de hoy. Tocá el botón de arriba y te
              armamos un plan 100% personalizado con IA.
            </Text>
          )}

          {/* Meals reales de la IA */}
          {!dietLoading && !dietError && dietToday?.meals && (
            <>
              {Object.entries(dietToday.meals).map(([mealType, meal]) => (
                <TouchableOpacity
                  key={mealType}
                  style={styles.mealCard}
                  activeOpacity={0.9}
                  onPress={() => onPressMeal({ ...meal, type: mealType })}
                >
                  <View style={styles.mealTime}>
                    <Text style={styles.mealTimeText}>{meal.time}</Text>
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealType}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Text>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealCalories}>
                      {meal.calories} kcal
                    </Text>
                  </View>
                  <View style={styles.mealStatus}>
                    {meal.prepared ? (
                      <View style={styles.preparedBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4CAF50"
                        />
                        <Text style={styles.preparedText}>Listo</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.prepareButton}>
                        <Text style={styles.prepareButtonText}>Preparar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {todayPlan.isMealPrepDay && (
            <TouchableOpacity style={styles.mealPrepReminder}>
              <Ionicons
                name="restaurant-outline"
                size={20}
                color="#FFB347"
              />
              <Text style={styles.mealPrepText}>Hoy es día de Meal Prep</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFB347" />
            </TouchableOpacity>
          )}
        </View>
      )}


      {/* Suplementos */}
      <View style={styles.supplementsTracker}>
        <View style={styles.supplementsHeader}>
          <Ionicons
            name="medical-outline"
            size={20}
            color="rgba(255,255,255,0.7)"
          />
          <Text style={styles.supplementsTitle}>Suplementos del Día</Text>
          <Text style={styles.supplementsCount}>
            {supplements.filter((s) => s.taken).length}/{supplements.length}
          </Text>
        </View>
        <View style={styles.supplementsList}>
          {supplements.map((supplement) => (
            <TouchableOpacity
              key={supplement.id}
              style={styles.supplementItem}
              onPress={() => toggleSupplement(supplement.id)}
            >
              <View style={styles.supplementCheckbox}>
                {supplement.taken ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                ) : (
                  <Ionicons
                    name="ellipse-outline"
                    size={24}
                    color="rgba(255,255,255,0.3)"
                  />
                )}
              </View>
              <View style={styles.supplementInfo}>
                <Text
                  style={[
                    styles.supplementName,
                    supplement.taken && styles.supplementTaken,
                  ]}
                >
                  {supplement.name}
                </Text>
                <View style={styles.supplementDetails}>
                  <Text style={styles.supplementDose}>{supplement.dose}</Text>
                  <Text style={styles.supplementTime}>• {supplement.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.addSupplementButton}
          onPress={openSupplementsModal}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.addSupplementText}>Agregar suplemento</Text>
        </TouchableOpacity>
      </View>

      {/* Stats diarias */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>días seguidos</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1/3</Text>
          <Text style={styles.statLabel}>rituales hoy</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>45</Text>
          <Text style={styles.statLabel}>minutos totales</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  dayTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dayTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dayTypeInfo: {
    flex: 1,
  },
  dayTypeLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 2,
  },
  dayTypeSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  shoppingAlert: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  shoppingAlertGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  shoppingAlertContent: {
    flex: 1,
  },
  shoppingAlertTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  shoppingAlertSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },

  plannedCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  plannedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  plannedTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  completedBadge: {
    backgroundColor: "rgba(76,175,80,0.2)",
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  plannedContent: {
    marginBottom: 16,
  },
  plannedName: {
    fontSize: 22,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 4,
  },
  plannedDuration: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
  },

  trainingProgramName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  trainingEmptyCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  trainingEmptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
    textAlign: "center",
    marginTop: 4,
  },
  trainingEmptySubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    marginTop: 6,
  },
  aiButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "#FFCF4A",
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  exerciseRow: {
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
  },
  exerciseMeta: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },

  mealsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
  },
  mealsCalories: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  mealCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mealTime: {
    marginRight: 16,
  },
  mealTimeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 2,
  },
  mealCalories: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  mealStatus: {
    alignItems: "center",
  },
  preparedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  preparedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  prepareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 100,
  },
  prepareButtonText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  mealPrepReminder: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,183,71,0.1)",
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  mealPrepText: {
    flex: 1,
    fontSize: 14,
    color: "#FFB347",
    fontWeight: "600",
  },

  supplementsTracker: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  supplementsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  supplementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    flex: 1,
    marginLeft: 8,
  },
  supplementsCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
  },
  supplementsList: {
    gap: 12,
  },
  supplementItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  supplementCheckbox: {
    marginRight: 12,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 2,
  },
  supplementTaken: {
    textDecorationLine: "line-through",
    color: "rgba(255,255,255,0.5)",
  },
  supplementDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  supplementDose: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
  },
  supplementTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  addSupplementButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(74,144,226,0.1)",
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(74,144,226,0.2)",
  },
  addSupplementText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A90E2",
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  startButton: {
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: "center",
    marginTop: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C0A0A",
  },
});

export default TuDiaTodayView;
