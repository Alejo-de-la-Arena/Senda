import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, borderRadius } from "../../styles/theme";
import { getMyUsers } from "../../api/profesionales";
import { useRoute, useNavigation } from "@react-navigation/native";

// Card de cada usuario entrenado
function EntrenadoCard({ user }) {
  const navigation = useNavigation();
  const fullName =
    `${user.name || ""} ${user.surname || ""}`.trim() || "Usuario sin nombre";

  const readableGoal =
    {
      muscle_gain: "Ganar masa muscular",
      weight_loss: "Perder peso",
      maintain: "Mantener estado físico",
      hipertrofia: "Hipertrofia",
    }[user.primary_goal] || "Sin objetivo definido";

  const extraStats = [];
  if (user.weight_kg) extraStats.push(`${user.weight_kg} kg`);
  if (user.height_cm) extraStats.push(`${user.height_cm} cm`);

  return (
    <View style={styles.card}>
      {/* -------- TOP ROW -------- */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrapper}>
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={30} color="#fff" />
          )}
        </View>

        <View style={styles.nameEmailWrapper}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {/* -------- ACTION ROW -------- */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#111" />
          <Text style={styles.actionButtonText}>Mensaje</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButtonSecondary}>
          <Ionicons name="person-circle-outline" size={18} color="#444" />
          <Text style={styles.actionButtonSecondaryText}>Ver perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={() => {
            navigation.navigate("TrainerUserTraining", {
              userId: user.user_id,
              userName: `${user.name} ${user.surname}`,
            });
          }}
        >
          <Ionicons name="barbell" size={18} color="#444" />
          <Text style={styles.actionButtonSecondaryText}>Entrenamiento</Text>
        </TouchableOpacity>
      </View>

      {/* -------- INFO ROW -------- */}
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>🎯 {readableGoal}</Text>

        {extraStats.length > 0 && (
          <Text style={styles.infoText}>{extraStats.join(" • ")}</Text>
        )}

        {user.started_at && (
          <Text style={styles.infoText}>Desde: {user.started_at}</Text>
        )}
      </View>
    </View>
  );
}

export default function EntrenadosScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyUsers();
      setUsers(data || []);
    } catch (e) {
      console.log(
        "[Entrenados] error cargando entrenados",
        e?.response?.data || e
      );
      setError("No pudimos cargar tus entrenados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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
          <Text style={styles.screenTitle}>Tus entrenados</Text>
          <TouchableOpacity onPress={loadUsers} style={styles.refreshBtn}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Acá ves a los usuarios que están conectados con vos como entrenador.
        </Text>

        {/* Contenido */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Cargando entrenados...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadUsers} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              Todavía no tenés usuarios conectados.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {users.map((u) => (
              <EntrenadoCard key={u.id} user={u} />
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

  /* ============================
   *     CARD MODERNA NUEVA
   * ============================ */
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  /* TOP ROW */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },

  nameEmailWrapper: {
    flexShrink: 1,
  },
  name: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  email: {
    fontSize: 12,
    color: colors.textoSecundario,
    marginTop: 2,
  },

  /* ACTIONS */
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
    gap: 10,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.naranjaCTA,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  actionButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(101, 101, 101, 1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    gap: 6,
  },
  actionButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },

  /* INFO FINAL */
  infoRow: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
    gap: 6,
  },
  infoText: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.85)",
  },
});
