//COMPONENTE ENTRENADORES Y PROFESIONALES

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "../../styles/theme";
import { getAllTrainers, connectWithTrainer } from "../../api/profesionales";

function getRandomColor() {
  const palette = ["#FF6B6B", "#4ECDC4", "#4A90E2", "#FFB347", "#98D8C8"];
  return palette[Math.floor(Math.random() * palette.length)];
}

function TrainerCard({ trainer }) {
  const [connecting, setConnecting] = useState(false);
  const [linked, setLinked] = useState(!!trainer.is_linked); // 👈 viene del backend si existe

  const name = trainer.name || trainer.email || "Entrenador sin nombre";
  const surname = trainer.surname || "";
  const fullName = `${name} ${surname}`.trim();

  const bio =
    trainer.bio ||
    "Este profesional todavía no agregó una descripción detallada.";

  const specialties = Array.isArray(trainer.specialties)
    ? trainer.specialties
    : [];

  const social = trainer.social_links || {};

  const handlePress = async () => {
    // Si ya está conectado, por ahora solo mostramos un mensaje
    if (linked) {
      Alert.alert(
        "Ya están conectados ✅",
        "Muy pronto vas a poder enviarle mensajes directamente desde acá."
      );
      return;
    }

    try {
      setConnecting(true);
      const resp = await connectWithTrainer(trainer.id);

      if (resp.alreadyLinked) {
        setLinked(true);
        Alert.alert(
          "Ya estabas conectado",
          "Este profesional ya está vinculado a tu cuenta."
        );
      } else {
        setLinked(true);
        Alert.alert(
          "Conexión exitosa ✅",
          "Te conectamos con este profesional."
        );
      }
    } catch (e) {
      console.log("Error conectando con trainer", e?.response?.data || e);
      Alert.alert(
        "Ups...",
        e?.response?.data?.error ||
          "No pudimos conectar con este profesional. Probá de nuevo."
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {trainer?.avatar_url ? (
            <Image
              source={{ uri: trainer.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={50} color="rgba(255,255,255,0.6)" />
          )}
        </View>

        <View>
          <Text style={styles.name}>{fullName}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={styles.roleText}>Entrenador / Coach</Text>

            {linked && (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.connectedText}>Conectado</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.contactButton,
            (connecting || linked) && { opacity: 0.8 },
          ]}
          onPress={handlePress}
          disabled={connecting}
        >
          <Ionicons
            name={linked ? "send-outline" : "chatbubble-ellipses-outline"}
            size={18}
            color="#111"
          />
          <Text style={styles.contactButtonText}>
            {linked
              ? "Enviar mensaje"
              : connecting
              ? "Conectando..."
              : "Conectar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <Text style={styles.bio} numberOfLines={3}>
        {bio}
      </Text>

      {/* Especialidades */}
      {specialties.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Especialidades</Text>
          <View style={styles.chipContainer}>
            {specialties.map((sp) => (
              <View key={sp} style={styles.chip}>
                <Text style={styles.chipText}>{sp}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Redes */}
      {(social.instagram || social.youtube || social.tiktok) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes</Text>
          <View style={styles.socialRow}>
            {social.instagram ? (
              <TouchableOpacity style={styles.socialItem}>
                <Ionicons name="logo-instagram" size={18} color="#fff" />
                <Text style={styles.socialText}>
                  {social.instagram.startsWith("@")
                    ? social.instagram
                    : "@" + social.instagram}
                </Text>
              </TouchableOpacity>
            ) : null}

            {social.youtube ? (
              <TouchableOpacity style={styles.socialItem}>
                <Ionicons name="logo-youtube" size={18} color="#fff" />
                <Text style={styles.socialText}>YouTube</Text>
              </TouchableOpacity>
            ) : null}

            {social.tiktok ? (
              <TouchableOpacity style={styles.socialItem}>
                <Ionicons name="logo-tiktok" size={18} color="#fff" />
                <Text style={styles.socialText}>TikTok</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
}

export default function ProfesionalesScreen() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrainers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllTrainers();
      setTrainers(data);
    } catch (e) {
      console.error("Error cargando trainers", e);
      setError("No pudimos cargar los profesionales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
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
        {/* Header simple */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Profesionales</Text>
          <TouchableOpacity onPress={loadTrainers} style={styles.refreshBtn}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          Conectá con entrenadores verificados para potenciar tus resultados.
        </Text>

        {/* Contenido */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Cargando profesionales...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadTrainers} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : trainers.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              Todavía no hay profesionales cargados.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {trainers.map((t) => (
              <TrainerCard key={t.id} trainer={t} />
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
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 999,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 16,
  },

  // estados
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.7)",
  },
  errorText: {
    color: "#FFB3B3",
    textAlign: "center",
    marginHorizontal: 16,
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
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  name: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  roleText: {
    fontSize: 12,
    color: colors.textoSecundario,
    marginTop: 2,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.naranjaCTA,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 4,
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111",
  },
  bio: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 10,
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chipText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.86)",
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  socialText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(76,175,80,0.15)",
  },
  connectedText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
