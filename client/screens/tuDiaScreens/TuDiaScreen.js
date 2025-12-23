// ./screens/TuDiaScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WeekStrip from "../../components/WeekStrip";
import SupplementsModal from "../../components/SupplementsModal";
import { colors } from "../../styles/theme";
import TuDiaTodayView from "./tuDiaTodayView";
import TuDiaWeekView from "./tuDiaWeekView";
import { getMe, getMyTraining } from "../../api/user";
import { getDietToday, getDietWeekSummary, refreshDiet } from "../../api/diet";
import { useAuth } from "../../auth/AuthProvider";


// --- Helper para saber el día actual ---
const getDayKey = () => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
};

const TuDiaScreen = ({ navigation, route }) => {
  const { auth } = useAuth();
  const [selectedRitual, setSelectedRitual] = useState("breathe");
  const [viewMode, setViewMode] = useState("today"); // 'today' o 'week'
  const [breathingStatus, setBreathingStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // estados nuevos
  const [dietTodayPayload, setDietTodayPayload] = useState(null); // {day_plan, ...}
  const [weekSummaryPayload, setWeekSummaryPayload] = useState(null); // {week_summary, ...}
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState(null);

  // Usuario de nuestra tabla User (id numérico: /users/me)
  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

  // Modal de ingredientes
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealModalVisible, setMealModalVisible] = useState(false);

  // Regeneraciones
  const [regenLeft, setRegenLeft] = useState(null);
  const [regenMax, setRegenMax] = useState(null);

  // Día seleccionado en la UI (por defecto: hoy)
  const [selectedDayKey, setSelectedDayKey] = useState(getDayKey());

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Estado de suplementos
  const [supplements, setSupplements] = useState([
    {
      id: 1,
      name: "espirulina",
      taken: false,
      time: "Mañana",
      dose: "2 pastillas",
    },
    {
      id: 2,
      name: "Omega 3",
      taken: false,
      time: "Post entreno",
      dose: "2 pastillas",
    },
    {
      id: 3,
      name: "Magnesio",
      taken: false,
      time: "Noche",
      dose: "1 pastilla",
    },
    { id: 4, name: "Mejunge", taken: false, time: "Tarde", dose: "1" },
  ]);

  const loadDietToday = async ({ allowRefresh } = { allowRefresh: false }) => {
    if (!me) return;

    setDietLoading(true);
    setDietError(null);

    const dayKey = selectedDayKey || getDayKey();

    try {
      if (allowRefresh) {
        // regenera semana pero devuelve solo el día
        const refreshed = await refreshDiet(me.id, { dayKey });
        setDietTodayPayload(refreshed);

        if (typeof refreshed.remaining_regens === "number") {
          setRegenLeft(refreshed.remaining_regens);
          setRegenMax(refreshed.max_regens || 3);
        }

        // invalidamos summary para que se recargue cuando vaya a week
        setWeekSummaryPayload(null);
        return;
      }

      const existing = await getDietToday(me.id, dayKey);
      setDietTodayPayload(existing);

      if (typeof existing.remaining_regens === "number") {
        setRegenLeft(existing.remaining_regens);
        setRegenMax(existing.max_regens || 3);
      }
    } catch (err) {
      const status = err?.response?.status;

      if (status === 404 && !allowRefresh) {
        // no existe plan -> generamos y listo
        try {
          const refreshed = await refreshDiet(me.id, { dayKey });
          setDietTodayPayload(refreshed);
          console.log("REFRESHED PAYLOAD:", refreshed);

          if (typeof refreshed.remaining_regens === "number") {
            setRegenLeft(refreshed.remaining_regens);
            setRegenMax(refreshed.max_regens || 3);
          }

          setWeekSummaryPayload(null);
          return;
        } catch (genErr) {
          setDietError("No se pudo generar tu plan de comidas. Probá más tarde.");
          return;
        }
      }

      if (status === 429) {
        const data = err?.response?.data;
        setRegenLeft(data?.remaining_regens ?? 0);
        setRegenMax(data?.max_regens ?? 3);
        setDietError("Alcanzaste el máximo de regeneraciones para hoy.");
        return;
      }

      setDietError("No se pudo cargar tu plan de comidas. Probá más tarde.");
    } finally {
      setDietLoading(false);
    }
  };

  const loadWeekSummary = async () => {
    if (!me) return;
    try {
      const data = await getDietWeekSummary(me.id);
      setWeekSummaryPayload(data);
    } catch (e) {
      // no rompas la UI si falla
      console.log("Error week summary", e?.response?.data || e);
    }
  };

  // cargar HOY cuando me o selectedDayKey cambia
  useEffect(() => {
    if (me) loadDietToday({ allowRefresh: false });
  }, [me, selectedDayKey]);

  // cargar summary solo cuando se entra a week (lazy)
  useEffect(() => {
    if (me && viewMode === "week" && !weekSummaryPayload) {
      loadWeekSummary();
    }
  }, [me, viewMode, weekSummaryPayload]);


  const toggleSupplement = (id) => {
    setSupplements((prev) =>
      prev.map((supp) =>
        supp.id === id ? { ...supp, taken: !supp.taken } : supp
      )
    );
  };

  // 🔥 Estado de entrenamiento real del usuario
  const [training, setTraining] = useState(null);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [trainingError, setTrainingError] = useState("");

  useEffect(() => {
    if (!auth.session?.access_token) {
      // ya sabemos que restoring es false acá, porque AuthProvider no renderiza antes
      setTrainingLoading(false);
      setTraining(null);
      setTrainingError("Necesitás iniciar sesión para ver tu entrenamiento.");
      return;
    }

    const loadTraining = async () => {
      try {
        setTrainingLoading(true);
        setTrainingError("");
        const data = await getMyTraining();
        setTraining(data);
      } catch (e) {
        console.log("Error cargando entrenamiento del usuario", e);
        console.log("response:", e?.response);
        setTrainingError(
          e?.response?.data?.error ||
          "No pudimos cargar tu entrenamiento. Intentalo nuevamente."
        );
      } finally {
        setTrainingLoading(false);
      }
    };

    loadTraining();
  }, [auth.session?.access_token]);

  // Cargar datos de la tabla User
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getMe(); // GET /users/me
        if (mounted) {
          setMe(data); // data.id es el que usa /users/:id/diet
        }
      } catch (err) {
        console.log("Error en getMe():", err?.response?.data || err);
      } finally {
        if (mounted) setMeLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Plan semanal MOCK base (breathe / stats / fallback si no hay dieta IA)
  const mockWeekPlan = {
    monday: {
      dayType: "intense",
      dayTypeLabel: "Día Intenso",
      dayTypeIcon: "flame-outline",
      dayTypeColor: "#FF6B6B",
      meals: {
        breakfast: {
          name: "Avena Proteica",
          time: "7:00 AM",
          calories: 350,
          prepared: true,
        },
        lunch: {
          name: "Pollo con Quinoa",
          time: "1:00 PM",
          calories: 450,
          prepared: true,
        },
        snack: {
          name: "Batido Verde",
          time: "4:00 PM",
          calories: 150,
          prepared: false,
        },
        dinner: {
          name: "Salmón con Vegetales",
          time: "7:30 PM",
          calories: 400,
          prepared: true,
        },
      },
      workout: null, // ahora el entreno real viene de la API
      breathing: {
        name: "Morning Energy",
        duration: "5 min",
        time: "5:45 AM",
        completed: true,
      },
      totalCalories: 1350,
      waterGoal: 8,
      waterCurrent: 5,
    },
    tuesday: {
      dayType: "strength",
      dayTypeLabel: "Día de Fuerza",
      dayTypeIcon: "barbell-outline",
      dayTypeColor: "#4A90E2",
      meals: {
        breakfast: {
          name: "Huevos con Tostadas",
          time: "7:30 AM",
          calories: 380,
          prepared: false,
        },
        lunch: {
          name: "Bowl de Atún",
          time: "1:00 PM",
          calories: 420,
          prepared: true,
        },
        snack: {
          name: "Frutos Secos",
          time: "4:00 PM",
          calories: 180,
          prepared: false,
        },
        dinner: {
          name: "Pasta Integral con Pollo",
          time: "7:30 PM",
          calories: 480,
          prepared: false,
        },
      },
      workout: null,
      breathing: {
        name: "Focus Flow",
        duration: "7 min",
        time: "12:30 PM",
        completed: false,
      },
      isMealPrepDay: true,
      totalCalories: 1460,
      waterGoal: 8,
      waterCurrent: 2,
    },
    wednesday: {
      dayType: "recovery",
      dayTypeLabel: "Recuperación Activa",
      dayTypeIcon: "leaf-outline",
      dayTypeColor: "#4ECDC4",
      meals: {
        breakfast: {
          name: "Smoothie Bowl",
          time: "8:00 AM",
          calories: 320,
          prepared: true,
        },
        lunch: {
          name: "Ensalada Mediterránea",
          time: "1:00 PM",
          calories: 380,
          prepared: true,
        },
        snack: {
          name: "Yogurt con Granola",
          time: "4:00 PM",
          calories: 160,
          prepared: false,
        },
        dinner: {
          name: "Sopa de Verduras",
          time: "7:00 PM",
          calories: 280,
          prepared: true,
        },
      },
      workout: null,
      breathing: {
        name: "Box Breathing",
        duration: "4 min",
        time: "12:30 PM",
        completed: false,
      },
      totalCalories: 1140,
      waterGoal: 10,
      waterCurrent: 0,
    },
    sunday: {
      dayType: "planning",
      dayTypeLabel: "Día de Planificación",
      dayTypeIcon: "calendar-outline",
      dayTypeColor: "#FFB347",
      isShoppingDay: true,
      shoppingList: [
        { item: "Pollo (1.5 kg)", category: "Proteínas", bought: false },
        { item: "Salmón (4 filetes)", category: "Proteínas", bought: false },
        { item: "Quinoa (500g)", category: "Carbohidratos", bought: false },
        { item: "Avena (1kg)", category: "Carbohidratos", bought: false },
        { item: "Espinacas", category: "Vegetales", bought: false },
        { item: "Brócoli", category: "Vegetales", bought: false },
        { item: "Aguacates (6)", category: "Grasas", bought: false },
        { item: "Frutos secos (500g)", category: "Snacks", bought: false },
        { item: "Yogurt griego (1L)", category: "Lácteos", bought: false },
        { item: "Huevos (18)", category: "Proteínas", bought: false },
      ],
      estimatedBudget: "$85",
      meals: {
        breakfast: {
          name: "Brunch Especial",
          time: "10:00 AM",
          calories: 450,
          prepared: false,
        },
        lunch: {
          name: "Comida Libre",
          time: "2:00 PM",
          calories: 600,
          prepared: false,
        },
        dinner: {
          name: "Cena Ligera",
          time: "7:00 PM",
          calories: 350,
          prepared: false,
        },
      },
      workout: null,
      breathing: {
        name: "Weekly Reset",
        duration: "15 min",
        time: "8:00 PM",
        completed: false,
      },
    },
  };

  // Mezcla: mockWeekPlan + dieta real semanal (si existe)
  const weekPlan = React.useMemo(() => {
    const merged = { ...mockWeekPlan };

    const summary = weekSummaryPayload?.week_summary;
    if (!summary) return merged;

    Object.entries(summary).forEach(([dayKey, dayPlan]) => {
      const baseDay = merged[dayKey] || {};

      const mealsById = {};
      if (Array.isArray(dayPlan.meals)) {
        dayPlan.meals.forEach((m) => {
          const key = m.id || "meal";
          mealsById[key] = {
            name: m.title,
            time: m.time || "",
            calories: m.kcal || 0,
            ingredients: [], // summary no trae ingredientes
            prepared: false,
          };
        });
      }

      merged[dayKey] = {
        ...baseDay,
        dayType: dayPlan.dayType || baseDay.dayType || "normal",
        meals: mealsById,
        totalCalories: dayPlan.total_kcal || baseDay.totalCalories || null,
      };
    });

    return merged;
  }, [weekSummaryPayload]);


  const todayKey = selectedDayKey || getDayKey();
  const todayPlan = weekPlan[todayKey] || weekPlan.monday;

  const dietToday = React.useMemo(() => {
    const dayPlan = dietTodayPayload?.day_plan;
    if (!dayPlan) return null;

    const result = { totalCalories: dayPlan.total_kcal || null, meals: {} };

    if (Array.isArray(dayPlan.meals)) {
      dayPlan.meals.forEach((m) => {
        const key = m.id || (m.label || "meal").toLowerCase();
        result.meals[key] = {
          name: m.title,
          time: m.time || "",
          calories: m.kcal || 0,
          ingredients: m.ingredients || [],
          prepared: false,
        };
      });
    }

    return result;
  }, [dietTodayPayload]);


  // Manejo de status de respiración que viene por route params
  useEffect(() => {
    if (route?.params?.breathingStatus) {
      setBreathingStatus(route.params.breathingStatus);
      navigation.setParams({ breathingStatus: undefined });
    }
  }, [route?.params?.breathingStatus]);

  // Animación de entrada
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={[
        colors.azulProfundo,
        colors.fondoBaseOscuro,
        colors.marronTierra,
      ]}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Week Strip */}
            <WeekStrip
              selectedDayKey={todayKey}
              onDayPress={(dayKey) => setSelectedDayKey(dayKey)}
            />

            {viewMode === "today" ? (
              <TuDiaTodayView
                navigation={navigation}
                todayPlan={todayPlan}
                selectedRitual={selectedRitual}
                onSelectRitual={setSelectedRitual}
                breathingStatus={breathingStatus}
                setViewMode={setViewMode}
                supplements={supplements}
                toggleSupplement={toggleSupplement}
                openSupplementsModal={() => setModalVisible(true)}
                training={training}
                trainingLoading={trainingLoading}
                trainingError={trainingError}

                selectedDayKey={todayKey}
                dietTodayPayload={dietTodayPayload}
                dietToday={dietToday}
                dietLoading={dietLoading}
                dietError={dietError}
                regenLeft={regenLeft}
                regenMax={regenMax}
                onGenerateDiet={() => loadDietToday({ allowRefresh: true })}

                onPressMeal={(mealWithType) => {
                  setSelectedMeal(mealWithType);
                  setMealModalVisible(true);
                }}
              />
            ) : (
              <TuDiaWeekView
                weekPlan={weekPlan}
                todayKey={todayKey}
                selectedDayKey={todayKey}                 // hoyKey == selectedDayKey actual
                onSelectDay={(dk) => setSelectedDayKey(dk)} // por si querés click en cards
                onBackToToday={() => setViewMode("today")}

                // para mostrar el día seleccionado con data real
                dietToday={dietToday}
                dietLoading={dietLoading}
                dietError={dietError}

                // para reusar el modal de ingredientes
                onPressMeal={(mealWithType) => {
                  setSelectedMeal(mealWithType);
                  setMealModalVisible(true);
                }}
              />
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Supplements Modal */}
      <SupplementsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        supplements={supplements}
        onUpdateSupplements={(updatedSupplements) => {
          setSupplements(updatedSupplements);
          setModalVisible(false);
        }}
      />

      {/* Modal de ingredientes de la comida */}
      <Modal
        visible={mealModalVisible && !!selectedMeal}
        transparent
        animationType="fade"
        onRequestClose={() => setMealModalVisible(false)}
      >
        <View style={styles.mealModalBackdrop}>
          {/* Tap afuera para cerrar */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMealModalVisible(false)}
          />

          <View style={styles.mealModalContent}>
            <View style={styles.mealModalHeader}>
              <Text style={styles.mealModalTitle}>
                {selectedMeal?.name || "Comida"}
              </Text>

              <TouchableOpacity
                onPress={() => setMealModalVisible(false)}
                style={styles.mealModalX}
              >
                <Text style={styles.mealModalXText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.mealModalSubtitle}>
              {selectedMeal?.time
                ? `${selectedMeal.time} · ${selectedMeal.calories} kcal`
                : `${selectedMeal?.calories || 0} kcal`}
            </Text>

            <View style={styles.mealModalDivider} />

            <ScrollView style={styles.mealModalScroll} showsVerticalScrollIndicator={false}>
              {Array.isArray(selectedMeal?.ingredients) && selectedMeal.ingredients.length > 0 ? (
                selectedMeal.ingredients.map((ing, idx) => (
                  <View key={idx} style={styles.mealModalIngredientRow}>
                    <Text style={styles.mealModalIngredientName}>{ing.name}</Text>
                    <Text style={styles.mealModalIngredientAmount}>
                      {ing.amount} {ing.unit}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.mealModalNoIngredients}>
                  Aún no tenemos el detalle de ingredientes para esta comida.
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.mealModalCloseButton}
              onPress={() => setMealModalVisible(false)}
            >
              <Text style={styles.mealModalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  mealModalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 16,
  },
  mealModalContent: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(20,20,20,0.95)",
  },
  mealModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  mealModalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  mealModalX: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  mealModalXText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  mealModalSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.75)",
  },
  mealModalDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 12,
  },
  mealModalScroll: {
    maxHeight: 260,
  },
  mealModalIngredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  mealModalIngredientName: {
    color: "white",
    width: "65%",
  },
  mealModalIngredientAmount: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  mealModalNoIngredients: {
    color: "rgba(255,255,255,0.75)",
    paddingVertical: 10,
  },
  mealModalCloseButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  mealModalCloseText: {
    color: "white",
    fontWeight: "700",
  }
});

export default TuDiaScreen;
