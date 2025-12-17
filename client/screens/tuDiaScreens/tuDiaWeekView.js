// ./screens/TuDiaWeekView.js
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DAY_LABEL = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

const MEAL_ORDER = ["breakfast", "lunch", "snack", "dinner"];
const MEAL_LABEL = {
  breakfast: "BREAKFAST",
  lunch: "LUNCH",
  snack: "SNACK",
  dinner: "DINNER",
};

const TuDiaWeekView = ({
  weekPlan,
  todayKey,
  selectedDayKey,
  onSelectDay,
  onBackToToday,

  dietToday,
  dietLoading,
  dietError,

  onPressMeal,
}) => {
  const selectedPlan = weekPlan?.[selectedDayKey];

  // meals “reales” (con ingredientes) si ya está dietToday
  const mealsToRender = useMemo(() => {
    // 1) si dietToday tiene meals, usamos eso (data real con ingredients)
    if (dietToday?.meals && typeof dietToday.meals === "object") {
      return MEAL_ORDER.map((k) => {
        const m = dietToday.meals[k];
        return m ? { id: k, ...m } : null;
      }).filter(Boolean);
    }

    // 2) fallback al summary del weekPlan (sin ingredients)
    const mealsObj = selectedPlan?.meals || {};
    return MEAL_ORDER.map((k) => {
      const m = mealsObj[k];
      return m ? { id: k, ...m } : null;
    }).filter(Boolean);
  }, [dietToday, selectedPlan]);

  const totalKcal =
    dietToday?.totalCalories ??
    selectedPlan?.totalCalories ??
    null;

  return (
    <View style={styles.weekViewContainer}>
      <TouchableOpacity style={styles.backToTodayButton} onPress={onBackToToday}>
        <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.7)" />
        <Text style={styles.backToTodayText}>Volver a Hoy</Text>
      </TouchableOpacity>

      <Text style={styles.weekViewTitle}>Plan Semanal</Text>

      {/* Día seleccionado */}
      <View style={styles.selectedDayCard}>
        <View style={styles.selectedDayHeader}>
          <Text style={styles.selectedDayName}>
            {DAY_LABEL[selectedDayKey] || selectedDayKey}
            {selectedDayKey === todayKey ? " (Hoy)" : ""}
          </Text>

          {totalKcal != null && (
            <Text style={styles.selectedDayKcal}>{totalKcal} kcal</Text>
          )}
        </View>

        {dietLoading ? (
          <Text style={styles.loadingText}>Cargando día...</Text>
        ) : dietError ? (
          <Text style={styles.errorText}>{dietError}</Text>
        ) : null}
      </View>

      {/* Comidas del día seleccionado */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
        {mealsToRender.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={styles.mealCard}
            onPress={() => {
              // Importante: para que el modal tenga ingredients, idealmente dietToday ya está cargado
              onPressMeal?.({
                type: m.id,
                name: m.name,
                time: m.time,
                calories: m.calories,
                ingredients: m.ingredients || [],
              });
            }}
          >
            <View style={styles.mealRow}>
              <Text style={styles.mealLabel}>{MEAL_LABEL[m.id] || m.id.toUpperCase()}</Text>
              <Text style={styles.mealTime}>{m.time || ""}</Text>
            </View>

            <Text style={styles.mealName}>{m.name}</Text>

            <Text style={styles.mealKcal}>{m.calories || 0} kcal</Text>
          </TouchableOpacity>
        ))}

        {/* (Opcional) Lista de días para cambiar tocando card */}
        <Text style={styles.daysHint}>Cambiar día</Text>
        {Object.keys(weekPlan || {}).map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayChip,
              day === selectedDayKey && styles.dayChipActive,
            ]}
            onPress={() => onSelectDay?.(day)}
          >
            <Text style={styles.dayChipText}>
              {DAY_LABEL[day] || day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  weekViewContainer: { paddingHorizontal: 20 },

  backToTodayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  backToTodayText: { fontSize: 14, color: "rgba(255,255,255,0.7)" },

  weekViewTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 12,
  },

  selectedDayCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  selectedDayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  selectedDayName: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.95)",
  },
  selectedDayKcal: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
  },
  loadingText: { marginTop: 8, color: "rgba(255,255,255,0.65)" },
  errorText: { marginTop: 8, color: "rgba(255,100,100,0.9)" },

  mealCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  mealLabel: { fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: "700" },
  mealTime: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  mealName: { fontSize: 16, color: "rgba(255,255,255,0.95)", fontWeight: "700" },
  mealKcal: { marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.6)" },

  daysHint: {
    marginTop: 8,
    marginBottom: 8,
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dayChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    marginBottom: 8,
  },
  dayChipActive: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.20)",
  },
  dayChipText: { color: "rgba(255,255,255,0.85)", fontWeight: "700" },
});

export default TuDiaWeekView;
