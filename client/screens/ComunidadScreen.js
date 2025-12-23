import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from "../styles/theme";
import ProfesionalesScreen from "./Profesionales/Profesionales";
import EntrenadosScreen from "./verEntrenados/EntrenadosScreen";
import { useEffect } from "react";
import { getMe } from "../api/user";

const { width } = Dimensions.get("window");

const ComunidadScreen = () => {
  const [activeTab, setActiveTab] = useState("actividad");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();        
        setProfile(me);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Datos de actividades completadas
  const actividadPosts = [
    {
      id: 1,
      user: "María González",
      avatarColor: "#FF6B9D",
      time: "Hace 2 horas",
      type: "run",
      activity: "Carrera matutina",
      stats: {
        distance: "5.2 km",
        duration: "28:45",
        pace: "5:32 /km",
        calories: "312 kcal",
      },
      mapImage: true,
      likes: 24,
      comments: 5,
      liked: false,
    },
    {
      id: 2,
      user: "Carlos Mendoza",
      avatarColor: "#4A90E2",
      time: "Hace 5 horas",
      type: "workout",
      activity: "SNORECORE",
      stats: {
        duration: "20:00",
        exercises: "8",
        intensity: "Alta",
        calories: "180 kcal",
      },
      likes: 45,
      comments: 12,
      liked: true,
    },
    {
      id: 3,
      user: "Ana Rodríguez",
      avatarColor: "#4ECDC4",
      time: "Hace 1 día",
      type: "meal",
      activity: "Post Workout Bowl",
      stats: {
        calories: "420 kcal",
        protein: "35g",
        carbs: "45g",
        fats: "12g",
      },
      hasImage: true,
      likes: 67,
      comments: 8,
      liked: false,
    },
  ];

  // Datos de eventos próximos para unirse
  const uneteEvents = [
    {
      id: 1,
      title: "Yoga en el Parque",
      host: "Laura Martínez",
      hostColor: "#98D8C8",
      date: "Mañana",
      time: "7:00 AM",
      location: "Parque Central",
      participants: 8,
      maxParticipants: 15,
      level: "Todos los niveles",
      type: "yoga",
      joined: false,
    },
    {
      id: 2,
      title: "Running Group 10K",
      host: "Diego Silva",
      hostColor: "#FFB347",
      date: "Sábado",
      time: "6:30 AM",
      location: "Costanera Sur",
      participants: 12,
      maxParticipants: 20,
      level: "Intermedio",
      type: "run",
      joined: true,
    },
    {
      id: 3,
      title: "HIIT en Casa (Virtual)",
      host: "Coach Sarah",
      hostColor: "#FF6B9D",
      date: "Hoy",
      time: "7:00 PM",
      location: "Zoom",
      participants: 23,
      maxParticipants: 30,
      level: "Principiante",
      type: "workout",
      joined: false,
      isVirtual: true,
    },
    {
      id: 4,
      title: "Meal Prep Sunday",
      host: "Nutricionista Pedro",
      hostColor: "#4A90E2",
      date: "Domingo",
      time: "4:00 PM",
      location: "Cocina Comunitaria",
      participants: 6,
      maxParticipants: 10,
      level: "Todos",
      type: "nutrition",
      joined: false,
    },
  ];

  // Datos de rutinas para explorar
  const exploraRoutines = [
    {
      id: 1,
      title: "Rutina Full Body Principiante",
      author: "Coach Miguel",
      authorColor: "#FF6B6B",
      type: "workout",
      duration: "45 min",
      difficulty: "Principiante",
      saves: 234,
      rating: 4.8,
      tags: ["fuerza", "full body", "gym"],
    },
    {
      id: 2,
      title: "Meal Prep Semanal Vegano",
      author: "Chef Ana",
      authorColor: "#4ECDC4",
      type: "nutrition",
      duration: "2 horas prep",
      difficulty: "Fácil",
      saves: 567,
      rating: 4.9,
      tags: ["vegano", "meal prep", "económico"],
    },
    {
      id: 3,
      title: "Programa C25K - Semana 1",
      author: "Runner Pro",
      authorColor: "#FFB347",
      type: "run",
      duration: "8 semanas",
      difficulty: "Principiante",
      saves: 892,
      rating: 4.7,
      tags: ["running", "principiante", "5k"],
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case "run":
        return "walk-outline";
      case "workout":
        return "barbell-outline";
      case "meal":
        return "nutrition-outline";
      case "yoga":
        return "body-outline";
      case "nutrition":
        return "restaurant-outline";
      default:
        return "fitness-outline";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "run":
        return "#FFB347";
      case "workout":
        return "#FF6B6B";
      case "meal":
        return "#4ECDC4";
      case "yoga":
        return "#98D8C8";
      case "nutrition":
        return "#4ECDC4";
      default:
        return "#4A90E2";
    }
  };

  const renderActividad = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {actividadPosts.map((post) => (
        <View key={post.id} style={styles.activityCard}>
          <View style={styles.activityHeader}>
            <View style={styles.userInfo}>
              <Ionicons
                name="person-circle"
                size={40}
                color={post.avatarColor}
              />
              <View>
                <Text style={styles.userName}>{post.user}</Text>
                <Text style={styles.postTime}>{post.time}</Text>
              </View>
            </View>
            <Ionicons
              name={getActivityIcon(post.type)}
              size={24}
              color={getActivityColor(post.type)}
            />
          </View>

          <Text style={styles.activityTitle}>{post.activity}</Text>

          {post.mapImage && (
            <View style={styles.mapContainer}>
              <LinearGradient
                colors={["#4A90E2", "#357ABD"]}
                style={styles.mapPlaceholder}
              >
                <Ionicons
                  name="map-outline"
                  size={40}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.mapText}>Mapa de ruta</Text>
              </LinearGradient>
            </View>
          )}

          {post.hasImage && (
            <View style={styles.imageContainer}>
              <LinearGradient
                colors={["#4ECDC4", "#3BA99C"]}
                style={styles.imagePlaceholder}
              >
                <Ionicons
                  name="image-outline"
                  size={40}
                  color="rgba(255,255,255,0.5)"
                />
              </LinearGradient>
            </View>
          )}

          <View style={styles.statsGrid}>
            {Object.entries(post.stats).map(([key, value]) => (
              <View key={key} style={styles.statItem}>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{key}</Text>
              </View>
            ))}
          </View>

          <View style={styles.activityFooter}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name={post.liked ? "heart" : "heart-outline"}
                size={22}
                color={post.liked ? "#FF6B6B" : "rgba(255,255,255,0.6)"}
              />
              <Text style={[styles.actionText, post.liked && styles.likedText]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="share-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderUnete = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <TouchableOpacity style={styles.createEventButton}>
        <LinearGradient
          colors={["#4A90E2", "#357ABD"]}
          style={styles.createEventGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.createEventText}>Crear Evento</Text>
        </LinearGradient>
      </TouchableOpacity>

      {uneteEvents.map((event) => (
        <View key={event.id} style={styles.eventCard}>
          <View style={styles.eventHeader}>
            <View
              style={[
                styles.eventTypeIcon,
                { backgroundColor: getActivityColor(event.type) + "20" },
              ]}
            >
              <Ionicons
                name={getActivityIcon(event.type)}
                size={24}
                color={getActivityColor(event.type)}
              />
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={styles.eventHost}>
                <Text style={styles.hostText}>por {event.host}</Text>
                {event.isVirtual && (
                  <View style={styles.virtualBadge}>
                    <Ionicons name="videocam" size={12} color="#4A90E2" />
                    <Text style={styles.virtualText}>Virtual</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.eventDetailText}>
                {event.date} - {event.time}
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons
                name="location-outline"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.eventDetailText}>{event.location}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons
                name="fitness-outline"
                size={16}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.eventDetailText}>{event.level}</Text>
            </View>
          </View>

          <View style={styles.eventFooter}>
            <View style={styles.participantsInfo}>
              <View style={styles.participantsAvatars}>
                {[...Array(Math.min(3, event.participants))].map((_, i) => (
                  <View
                    key={i}
                    style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0 }]}
                  >
                    <Ionicons name="person-circle" size={24} color="#4A90E2" />
                  </View>
                ))}
              </View>
              <Text style={styles.participantsText}>
                {event.participants}/{event.maxParticipants} participantes
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.joinButton, event.joined && styles.joinedButton]}
            >
              <Text
                style={[
                  styles.joinButtonText,
                  event.joined && styles.joinedButtonText,
                ]}
              >
                {event.joined ? "Inscrito" : "Unirse"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderExplora = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={styles.exploreFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["Todo", "Workout", "Nutrición", "Running", "Yoga"].map((filter) => (
            <TouchableOpacity key={filter} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {exploraRoutines.map((routine) => (
        <View key={routine.id} style={styles.routineCard}>
          <View style={styles.routineHeader}>
            <View
              style={[
                styles.routineTypeIcon,
                { backgroundColor: getActivityColor(routine.type) + "20" },
              ]}
            >
              <Ionicons
                name={getActivityIcon(routine.type)}
                size={20}
                color={getActivityColor(routine.type)}
              />
            </View>
            <View style={styles.routineInfo}>
              <Text style={styles.routineTitle}>{routine.title}</Text>
              <Text style={styles.routineAuthor}>por {routine.author}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons
                name="bookmark-outline"
                size={24}
                color="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.routineStats}>
            <View style={styles.routineStat}>
              <Ionicons
                name="time-outline"
                size={14}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.routineStatText}>{routine.duration}</Text>
            </View>
            <View style={styles.routineStat}>
              <Ionicons
                name="cellular-outline"
                size={14}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.routineStatText}>{routine.difficulty}</Text>
            </View>
            <View style={styles.routineStat}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.routineStatText}>{routine.rating}</Text>
            </View>
            <View style={styles.routineStat}>
              <Ionicons
                name="bookmark"
                size={14}
                color="rgba(255,255,255,0.5)"
              />
              <Text style={styles.routineStatText}>{routine.saves}</Text>
            </View>
          </View>

          <View style={styles.routineTags}>
            {routine.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

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
        {/* Header con tabs y notificaciones */}
        <View style={styles.header}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "actividad" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("actividad")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "actividad" && styles.activeTabText,
                ]}
              >
                Actividad
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "unete" && styles.activeTab]}
              onPress={() => setActiveTab("unete")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "unete" && styles.activeTabText,
                ]}
              >
                Únete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "explora" && styles.activeTab]}
              onPress={() => setActiveTab("explora")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "explora" && styles.activeTabText,
                ]}
              >
                Explora
              </Text>
            </TouchableOpacity>
            {profile?.role === "trainer" ? (
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "Entrenados" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("Entrenados")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Entrenados" && styles.activeTabText,
                  ]}
                >
                  Entrenados
                </Text>
              </TouchableOpacity>
            ) : profile?.role === "user" ? (
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "Profesionales" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("Profesionales")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "Profesionales" && styles.activeTabText,
                  ]}
                >
                  Profesionales
                </Text>
              </TouchableOpacity>
            ) : (
              ""
            )}
          </View>
          {/*           <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color="rgba(255,255,255,0.96)"
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity> */}
        </View>

        {/* Contenido dinámico según tab activa */}
        <View style={styles.content}>
          {activeTab === "actividad" && renderActividad()}
          {activeTab === "unete" && renderUnete()}
          {activeTab === "explora" && renderExplora()}
          {activeTab === "Profesionales" && <ProfesionalesScreen />}
          {activeTab === "Entrenados" && <EntrenadosScreen />}
        </View>
      </SafeAreaView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    flex: 1,
    gap: 24,
  },
  tab: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "rgba(255,255,255,0.96)",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
  },
  activeTabText: {
    color: "rgba(255,255,255,0.96)",
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Estilos para Actividad
  activityCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  postTime: {
    fontSize: 12,
    color: colors.textoSecundario,
    marginTop: 2,
  },
  activityTitle: {
    fontSize: typography.sizes.h5,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
    marginBottom: spacing.sm,
  },
  mapContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  mapPlaceholder: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    color: "rgba(255,255,255,0.5)",
    marginTop: 8,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textoSecundario,
    textTransform: "capitalize",
  },
  activityFooter: {
    flexDirection: "row",
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  likedText: {
    color: "#FF6B6B",
  },

  // Estilos para Únete
  createEventButton: {
    marginBottom: 20,
  },
  createEventGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  createEventText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  eventCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  eventHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  eventTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: typography.sizes.h5,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
    marginBottom: 4,
  },
  eventHost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hostText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  virtualBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74,144,226,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  virtualText: {
    fontSize: 11,
    color: "#4A90E2",
    fontWeight: "600",
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventDetailText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantsAvatars: {
    flexDirection: "row",
  },
  miniAvatar: {
    backgroundColor: "#0C0A0A",
    borderRadius: 100,
  },
  participantsText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  joinButton: {
    backgroundColor: colors.naranjaCTA,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.round,
  },
  joinedButton: {
    backgroundColor: "rgba(76,175,80,0.2)",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  joinButtonText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  joinedButtonText: {
    color: "#4CAF50",
  },

  // Estilos para Explora
  exploreFilters: {
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  routineCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  routineHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  routineTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  routineInfo: {
    flex: 1,
  },
  routineTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
    marginBottom: 2,
  },
  routineAuthor: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  routineStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  routineStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  routineStatText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  routineTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  tagText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
});

export default ComunidadScreen;
