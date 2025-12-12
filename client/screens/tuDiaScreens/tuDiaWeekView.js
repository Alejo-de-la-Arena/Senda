// ./screens/TuDiaWeekView.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TuDiaWeekView = ({ weekPlan, todayKey, onBackToToday }) => {
  return (
    <View style={styles.weekViewContainer}>
      <TouchableOpacity
        style={styles.backToTodayButton}
        onPress={onBackToToday}
      >
        <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.7)" />
        <Text style={styles.backToTodayText}>Volver a Hoy</Text>
      </TouchableOpacity>

      <Text style={styles.weekViewTitle}>Plan Semanal</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(weekPlan).map(([day, plan]) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.weekDayCard,
              day === todayKey && styles.todayWeekCard,
            ]}
          >
            <View style={styles.weekDayHeader}>
              <View>
                <Text style={styles.weekDayName}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Text style={styles.weekDayType}>{plan.dayTypeLabel}</Text>
              </View>
              <View
                style={[
                  styles.weekDayIcon,
                  { backgroundColor: plan.dayTypeColor + "20" },
                ]}
              >
                <Ionicons
                  name={plan.dayTypeIcon}
                  size={20}
                  color={plan.dayTypeColor}
                />
              </View>
            </View>

            {plan.isShoppingDay && (
              <View style={styles.weekDaySpecial}>
                <Ionicons name="cart-outline" size={16} color="#FFB347" />
                <Text style={styles.weekDaySpecialText}>Día de Compras</Text>
              </View>
            )}

            {plan.isMealPrepDay && (
              <View style={styles.weekDaySpecial}>
                <Ionicons name="restaurant-outline" size={16} color="#4ECDC4" />
                <Text style={styles.weekDaySpecialText}>Meal Prep</Text>
              </View>
            )}

            {plan.workout && (
              <View style={styles.weekDayActivity}>
                <Ionicons
                  name="barbell-outline"
                  size={14}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.weekDayActivityText}>
                  {plan.workout.name} • {plan.workout.duration}
                </Text>
              </View>
            )}

            {plan.totalCalories && (
              <View style={styles.weekDayActivity}>
                <Ionicons
                  name="nutrition-outline"
                  size={14}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.weekDayActivityText}>
                  {plan.totalCalories} kcal
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  weekViewContainer: {
    paddingHorizontal: 20,
  },
  backToTodayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backToTodayText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  weekViewTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 20,
  },
  weekDayCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  todayWeekCard: {
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  weekDayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  weekDayName: {
    fontSize: 16,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    textTransform: "capitalize",
  },
  weekDayType: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  weekDayIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  weekDaySpecial: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  weekDaySpecialText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  weekDayActivity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  weekDayActivityText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
});

export default TuDiaWeekView;
