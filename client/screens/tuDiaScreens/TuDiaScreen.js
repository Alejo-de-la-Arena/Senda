// ./screens/TuDiaScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import WeekStrip from "../../components/WeekStrip";
import SupplementsModal from "../../components/SupplementsModal";
import { colors } from "../../styles/theme";
import TuDiaTodayView from "./tuDiaTodayView";
import TuDiaWeekView from "./tuDiaWeekView";
import { getMyTraining } from "../../api/user"; // 👈 agrega esta función en tu api
import { useAuth } from "../../auth/AuthProvider";

const TuDiaScreen = ({ navigation, route }) => {
  const { auth } = useAuth();
  const [selectedRitual, setSelectedRitual] = useState("breathe");
  const [viewMode, setViewMode] = useState("today"); // 'today' o 'week'
  const [breathingStatus, setBreathingStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  // Plan semanal mockeado (por ahora para comidas / breathe / stats)
  const weekPlan = {
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

  const todayKey = getDayKey();
  const todayPlan = weekPlan[todayKey] || weekPlan.monday;

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
            <WeekStrip />

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
              />
            ) : (
              <TuDiaWeekView
                weekPlan={weekPlan}
                todayKey={todayKey}
                onBackToToday={() => setViewMode("today")}
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
});

export default TuDiaScreen;
