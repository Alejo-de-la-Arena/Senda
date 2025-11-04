import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import WeekStrip from '../components/WeekStrip';
import PillSwitcher from '../components/PillSwitcher';
import RitualCard from '../components/RitualCard';
import SupplementsModal from '../components/SupplementsModal';

const { height } = Dimensions.get('window');

const TuDiaScreen = ({ navigation }) => {
  const [selectedRitual, setSelectedRitual] = useState('breathe');
  const [viewMode, setViewMode] = useState('today'); // 'today' o 'week'
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  
  // Estado para suplementos
  const [supplements, setSupplements] = useState([
    { id: 1, name: 'espirulina', taken: false, time: 'Mañana', dose: '2 pastillas' },
    { id: 2, name: 'Omega 3', taken: false, time: 'Post entreno', dose: '2 pastillas' },
    { id: 3, name: 'Magnesio', taken: false, time: 'Noche', dose: '1 pastilla' },
    { id: 4, name: 'Mejunge', taken: false, time: 'Tarde', dose: '1' },
  ]);
  
  const toggleSupplement = (id) => {
    // Vibración deshabilitada para Expo Snack
    // Uncomment if using on physical device:
    // if (Platform.OS !== 'web') {
    //   const Haptics = require('expo-haptics');
    //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // }
    
    setSupplements(supplements.map(supp => 
      supp.id === id ? { ...supp, taken: !supp.taken } : supp
    ));
  };

  // Plan semanal completo (esto vendría de una base de datos/storage)
  const weekPlan = {
    monday: {
      dayType: 'intense',
      dayTypeLabel: 'Día Intenso',
      dayTypeIcon: 'flame-outline',
      dayTypeColor: '#FF6B6B',
      meals: {
        breakfast: { name: 'Avena Proteica', time: '7:00 AM', calories: 350, prepared: true },
        lunch: { name: 'Pollo con Quinoa', time: '1:00 PM', calories: 450, prepared: true },
        snack: { name: 'Batido Verde', time: '4:00 PM', calories: 150, prepared: false },
        dinner: { name: 'Salmón con Vegetales', time: '7:30 PM', calories: 400, prepared: true }
      },
      workout: {
        name: 'HIIT + Core',
        duration: '45 min',
        time: '6:00 AM',
        intensity: 'Alta',
        completed: false
      },
      breathing: {
        name: 'Morning Energy',
        duration: '5 min',
        time: '5:45 AM',
        completed: true
      },
      totalCalories: 1350,
      waterGoal: 8,
      waterCurrent: 5
    },
    tuesday: {
      dayType: 'strength',
      dayTypeLabel: 'Día de Fuerza',
      dayTypeIcon: 'barbell-outline',
      dayTypeColor: '#4A90E2',
      meals: {
        breakfast: { name: 'Huevos con Tostadas', time: '7:30 AM', calories: 380, prepared: false },
        lunch: { name: 'Bowl de Atún', time: '1:00 PM', calories: 420, prepared: true },
        snack: { name: 'Frutos Secos', time: '4:00 PM', calories: 180, prepared: false },
        dinner: { name: 'Pasta Integral con Pollo', time: '7:30 PM', calories: 480, prepared: false }
      },
      workout: {
        name: 'Upper Body',
        duration: '60 min',
        time: '6:30 AM',
        intensity: 'Media',
        completed: false
      },
      breathing: {
        name: 'Focus Flow',
        duration: '7 min',
        time: '12:30 PM',
        completed: false
      },
      isMealPrepDay: true,
      totalCalories: 1460,
      waterGoal: 8,
      waterCurrent: 2
    },
    wednesday: {
      dayType: 'recovery',
      dayTypeLabel: 'Recuperación Activa',
      dayTypeIcon: 'leaf-outline',
      dayTypeColor: '#4ECDC4',
      meals: {
        breakfast: { name: 'Smoothie Bowl', time: '8:00 AM', calories: 320, prepared: true },
        lunch: { name: 'Ensalada Mediterránea', time: '1:00 PM', calories: 380, prepared: true },
        snack: { name: 'Yogurt con Granola', time: '4:00 PM', calories: 160, prepared: false },
        dinner: { name: 'Sopa de Verduras', time: '7:00 PM', calories: 280, prepared: true }
      },
      workout: {
        name: 'Yoga Flow',
        duration: '30 min',
        time: '7:00 AM',
        intensity: 'Baja',
        completed: false
      },
      breathing: {
        name: 'Box Breathing',
        duration: '4 min',
        time: '12:30 PM',
        completed: false
      },
      totalCalories: 1140,
      waterGoal: 10,
      waterCurrent: 0
    },
    sunday: {
      dayType: 'planning',
      dayTypeLabel: 'Día de Planificación',
      dayTypeIcon: 'calendar-outline',
      dayTypeColor: '#FFB347',
      isShoppingDay: true,
      shoppingList: [
        { item: 'Pollo (1.5 kg)', category: 'Proteínas', bought: false },
        { item: 'Salmón (4 filetes)', category: 'Proteínas', bought: false },
        { item: 'Quinoa (500g)', category: 'Carbohidratos', bought: false },
        { item: 'Avena (1kg)', category: 'Carbohidratos', bought: false },
        { item: 'Espinacas', category: 'Vegetales', bought: false },
        { item: 'Brócoli', category: 'Vegetales', bought: false },
        { item: 'Aguacates (6)', category: 'Grasas', bought: false },
        { item: 'Frutos secos (500g)', category: 'Snacks', bought: false },
        { item: 'Yogurt griego (1L)', category: 'Lácteos', bought: false },
        { item: 'Huevos (18)', category: 'Proteínas', bought: false }
      ],
      estimatedBudget: '$85',
      meals: {
        breakfast: { name: 'Brunch Especial', time: '10:00 AM', calories: 450, prepared: false },
        lunch: { name: 'Comida Libre', time: '2:00 PM', calories: 600, prepared: false },
        dinner: { name: 'Cena Ligera', time: '7:00 PM', calories: 350, prepared: false }
      },
      workout: {
        name: 'Caminata Suave',
        duration: '30 min',
        time: '5:00 PM',
        intensity: 'Baja',
        completed: false
      },
      breathing: {
        name: 'Weekly Reset',
        duration: '15 min',
        time: '8:00 PM',
        completed: false
      }
    }
  };

  // Obtener el día actual
  const getDayKey = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const todayKey = getDayKey();
  const todayPlan = weekPlan[todayKey] || weekPlan.monday; // Fallback a monday para testing

  useEffect(() => {
    // Animación de entrada
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

  const renderTodayView = () => (
    <>
      {/* Tipo de día */}
      <View style={styles.dayTypeCard}>
        <View style={[styles.dayTypeIcon, { backgroundColor: todayPlan.dayTypeColor + '20' }]}>
          <Ionicons 
            name={todayPlan.dayTypeIcon} 
            size={24} 
            color={todayPlan.dayTypeColor}
          />
        </View>
        <View style={styles.dayTypeInfo}>
          <Text style={styles.dayTypeLabel}>{todayPlan.dayTypeLabel}</Text>
          <Text style={styles.dayTypeSubtext}>
            {todayPlan.isMealPrepDay && 'Día de Meal Prep • '}
            {todayPlan.isShoppingDay && 'Día de Compras • '}
            {todayPlan.totalCalories && `${todayPlan.totalCalories} kcal objetivo`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setViewMode('week')}>
          <Ionicons name="calendar-outline" size={24} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Shopping List Alert (if it's shopping day) */}
      {todayPlan.isShoppingDay && (
        <TouchableOpacity style={styles.shoppingAlert}>
          <LinearGradient
            colors={['#FFB347', '#FF8C42']}
            style={styles.shoppingAlertGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="cart-outline" size={24} color="white" />
            <View style={styles.shoppingAlertContent}>
              <Text style={styles.shoppingAlertTitle}>Lista de Compras Lista</Text>
              <Text style={styles.shoppingAlertSubtext}>
                {todayPlan.shoppingList.filter(i => !i.bought).length} items • {todayPlan.estimatedBudget}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Ritual Switcher con contenido del día */}
      <PillSwitcher 
        selected={selectedRitual}
        onSelect={setSelectedRitual}
      />

      {/* Contenido según ritual seleccionado */}
      {selectedRitual === 'breathe' && todayPlan.breathing && (
        <View style={styles.plannedCard}>
          <View style={styles.plannedHeader}>
            <Text style={styles.plannedTitle}>Respiración Programada</Text>
            <View style={[styles.statusBadge, todayPlan.breathing.completed && styles.completedBadge]}>
              <Text style={styles.statusText}>
                {todayPlan.breathing.completed ? 'Completado' : todayPlan.breathing.time}
              </Text>
            </View>
          </View>
          <View style={styles.plannedContent}>
            <Text style={styles.plannedName}>{todayPlan.breathing.name}</Text>
            <Text style={styles.plannedDuration}>{todayPlan.breathing.duration}</Text>
          </View>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => navigation.navigate('BoxBreathing')}
          >
            <Text style={styles.startButtonText}>
              {todayPlan.breathing.completed ? 'Repetir' : 'Iniciar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedRitual === 'train' && todayPlan.workout && (
        <View style={styles.plannedCard}>
          <View style={styles.plannedHeader}>
            <Text style={styles.plannedTitle}>Entrenamiento del Día</Text>
            <View style={[styles.statusBadge, todayPlan.workout.completed && styles.completedBadge]}>
              <Text style={styles.statusText}>
                {todayPlan.workout.completed ? 'Completado' : todayPlan.workout.time}
              </Text>
            </View>
          </View>
          <View style={styles.plannedContent}>
            <Text style={styles.plannedName}>{todayPlan.workout.name}</Text>
            <View style={styles.workoutDetails}>
              <View style={styles.workoutDetail}>
                <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.5)" />
                <Text style={styles.workoutDetailText}>{todayPlan.workout.duration}</Text>
              </View>
              <View style={styles.workoutDetail}>
                <Ionicons name="flash-outline" size={16} color="rgba(255,255,255,0.5)" />
                <Text style={styles.workoutDetailText}>Intensidad {todayPlan.workout.intensity}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>
              {todayPlan.workout.completed ? 'Ver Resumen' : 'Comenzar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedRitual === 'eat' && todayPlan.meals && (
        <View style={styles.mealsContainer}>
          <View style={styles.mealsHeader}>
            <Text style={styles.mealsTitle}>Plan de Comidas de Hoy</Text>
            <Text style={styles.mealsCalories}>{todayPlan.totalCalories} kcal</Text>
          </View>
          {Object.entries(todayPlan.meals).map(([mealType, meal]) => (
            <View key={mealType} style={styles.mealCard}>
              <View style={styles.mealTime}>
                <Text style={styles.mealTimeText}>{meal.time}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
              <View style={styles.mealStatus}>
                {meal.prepared ? (
                  <View style={styles.preparedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.preparedText}>Listo</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.prepareButton}>
                    <Text style={styles.prepareButtonText}>Preparar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {todayPlan.isMealPrepDay && (
            <TouchableOpacity style={styles.mealPrepReminder}>
              <Ionicons name="restaurant-outline" size={20} color="#FFB347" />
              <Text style={styles.mealPrepText}>Hoy es día de Meal Prep</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFB347" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Supplements Tracker */}
      <View style={styles.supplementsTracker}>
        <View style={styles.supplementsHeader}>
          <Ionicons name="medical-outline" size={20} color="rgba(255,255,255,0.7)" />
          <Text style={styles.supplementsTitle}>Suplementos del Día</Text>
          <Text style={styles.supplementsCount}>
            {supplements.filter(s => s.taken).length}/{supplements.length}
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
                  <Ionicons name="ellipse-outline" size={24} color="rgba(255,255,255,0.3)" />
                )}
              </View>
              <View style={styles.supplementInfo}>
                <Text style={[
                  styles.supplementName,
                  supplement.taken && styles.supplementTaken
                ]}>
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
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.addSupplementText}>Agregar suplemento</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Stats */}
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

  const renderWeekView = () => (
    <View style={styles.weekViewContainer}>
      <TouchableOpacity 
        style={styles.backToTodayButton}
        onPress={() => setViewMode('today')}
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
              day === todayKey && styles.todayWeekCard
            ]}
          >
            <View style={styles.weekDayHeader}>
              <View>
                <Text style={styles.weekDayName}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
                <Text style={styles.weekDayType}>{plan.dayTypeLabel}</Text>
              </View>
              <View style={[styles.weekDayIcon, { backgroundColor: plan.dayTypeColor + '20' }]}>
                <Ionicons name={plan.dayTypeIcon} size={20} color={plan.dayTypeColor} />
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
                <Ionicons name="barbell-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.weekDayActivityText}>
                  {plan.workout.name} • {plan.workout.duration}
                </Text>
              </View>
            )}

            {plan.totalCalories && (
              <View style={styles.weekDayActivity}>
                <Ionicons name="nutrition-outline" size={14} color="rgba(255,255,255,0.5)" />
                <Text style={styles.weekDayActivityText}>{plan.totalCalories} kcal</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.azulProfundo, colors.fondoBaseOscuro, colors.marronTierra]}
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
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Week Strip */}
            <WeekStrip />

            {viewMode === 'today' ? renderTodayView() : renderWeekView()}
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
  dayTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dayTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dayTypeInfo: {
    flex: 1,
  },
  dayTypeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 2,
  },
  dayTypeSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  shoppingAlert: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  shoppingAlertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  shoppingAlertContent: {
    flex: 1,
  },
  shoppingAlertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  shoppingAlertSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  plannedCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  plannedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  plannedTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  completedBadge: {
    backgroundColor: 'rgba(76,175,80,0.2)',
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  plannedContent: {
    marginBottom: 16,
  },
  plannedName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 4,
  },
  plannedDuration: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  workoutDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  workoutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDetailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0C0A0A',
  },
  mealsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  mealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
  },
  mealsCalories: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  mealTime: {
    marginRight: 16,
  },
  mealTimeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  mealInfo: {
    flex: 1,
  },
  mealType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 2,
  },
  mealCalories: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  mealStatus: {
    alignItems: 'center',
  },
  preparedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preparedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  prepareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
  },
  prepareButtonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  mealPrepReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,183,71,0.1)',
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  mealPrepText: {
    flex: 1,
    fontSize: 14,
    color: '#FFB347',
    fontWeight: '600',
  },
  supplementsTracker: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  supplementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  supplementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
    marginLeft: 8,
  },
  supplementsCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  supplementsList: {
    gap: 12,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '600',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 2,
  },
  supplementTaken: {
    textDecorationLine: 'line-through',
    color: 'rgba(255,255,255,0.5)',
  },
  supplementDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supplementDose: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  supplementTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  addSupplementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(74,144,226,0.1)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(74,144,226,0.2)',
  },
  addSupplementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  weekViewContainer: {
    paddingHorizontal: 20,
  },
  backToTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backToTodayText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  weekViewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 20,
  },
  weekDayCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  todayWeekCard: {
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  weekDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekDayName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    textTransform: 'capitalize',
  },
  weekDayType: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  weekDayIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDaySpecial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  weekDaySpecialText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  weekDayActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  weekDayActivityText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default TuDiaScreen;