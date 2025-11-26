import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../auth/AuthProvider";
import { getMe, updateMe } from "../api/user";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabaseClient";

const ProfileScreen = () => {
  const [showSettings, setShowSettings] = useState(false);
  const navigation = useNavigation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { logout } = useAuth();

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

  const userData = {
    name: "Felipe Ledesma",
    username: "@Ledesma47",
    country: "Argentina",
    followers: 47,
    following: 23,
    joinDate: "Enero 2024",
    completedRituals: 156,
    currentStreak: 12,
    totalHours: 48,
  };

  const handlePress = async (option) => {
    if (option.id === 8) {
      logout();
    } else {
      // cualquier otra acción
      console.log("Opción seleccionada:", option);
    }
  };

  const settingsOptions = [
    { id: 1, title: "Ajustes", icon: "settings-outline" },
    { id: 2, title: "Info de la cuenta", icon: "information-circle-outline" },
    { id: 3, title: "Membresía", icon: "card-outline" },
    { id: 4, title: "Preferencias", icon: "options-outline" },
    { id: 5, title: "Conexiones", icon: "link-outline" },
    { id: 6, title: "Notificaciones", icon: "notifications-outline" },
    { id: 7, title: "Permisos", icon: "shield-checkmark-outline" },
    { id: 8, title: "Cerrar sesión", icon: "log-out-outline", isLogout: true },
  ];

  const handleChangeAvatar = async () => {
    try {
      setUploadingAvatar(true);

      // 1) Elegir imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      if (!uri) return;

      // 2) Traer los bytes de la imagen
      const resp = await fetch(uri);
      const arrayBuffer = await resp.arrayBuffer();
      const fileBytes = new Uint8Array(arrayBuffer); // <- esto va a Supabase

      // 3) Nombre de archivo
      const extFromUri = uri.split(".").pop()?.toLowerCase().split("?")[0];
      const fileExt = extFromUri || "jpg";
      const fileName = `user-${profile.id}-${Date.now()}.${fileExt}`;

      // 4) Subir a bucket "avatars" usando bytes
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, fileBytes, {
          upsert: true,
          contentType: asset.mimeType || "image/jpeg",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.log("[avatar] upload error", uploadError);
        throw new Error("No pudimos subir tu foto. Probá de nuevo.");
      }

      // 5) Obtener URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      // 6) Guardar en tu backend
      await updateMe({ avatar_url: publicUrl });

      // 7) Refrescar estado local
      setProfile((prev) => ({
        ...prev,
        avatar_url: publicUrl,
      }));
    } catch (err) {
      console.log("[avatar] ERROR:", err);
      Alert.alert(
        "Ups...",
        err?.message || "No pudimos actualizar tu foto de perfil."
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!profile) return <Text>Sin sesión</Text>;

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={24}
              color="rgba(255,255,255,0.96)"
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Info Section */}
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={50}
                    color="rgba(255,255,255,0.6)"
                  />
                )}

                {uploadingAvatar && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.editAvatarButton}
                onPress={handleChangeAvatar}
                disabled={uploadingAvatar}
              >
                <Ionicons name="camera" size={16} color="#0C0A0A" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <Text style={styles.name}>{profile?.name}</Text>
            <Text style={styles.username}>{profile?.email}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="body" size={14} color="rgba(255,255,255,0.5)" />
              <Text style={styles.location}>{profile?.primary_goal}</Text>
            </View>

            {/* Follow Stats */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(userData.followers)}
                </Text>
                <Text style={styles.statLabel}>Seguidores</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatNumber(userData.following)}
                </Text>
                <Text style={styles.statLabel}>Siguiendo</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editProfileButton}>
                <Text style={styles.editProfileText}>Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons
                  name="share-outline"
                  size={20}
                  color="rgba(255,255,255,0.96)"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Activity Stats */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Tu actividad</Text>
            <View style={styles.activityGrid}>
              <View style={styles.activityCard}>
                <Ionicons name="flame-outline" size={24} color="#FF6B6B" />
                <Text style={styles.activityValue}>
                  {userData.currentStreak}
                </Text>
                <Text style={styles.activityLabel}>Días seguidos</Text>
              </View>
              <View style={styles.activityCard}>
                <Ionicons name="trophy-outline" size={24} color="#FFB347" />
                <Text style={styles.activityValue}>
                  {userData.completedRituals}
                </Text>
                <Text style={styles.activityLabel}>Rituales</Text>
              </View>
              <View style={styles.activityCard}>
                <Ionicons name="time-outline" size={24} color="#4ECDC4" />
                <Text style={styles.activityValue}>{userData.totalHours}h</Text>
                <Text style={styles.activityLabel}>Tiempo total</Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Actividad reciente</Text>
            <View style={styles.recentList}>
              <View style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentText}>
                    Completaste MORNING FLOW
                  </Text>
                  <Text style={styles.recentTime}>Hace 2 horas</Text>
                </View>
              </View>
              <View style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Ionicons name="restaurant" size={20} color="#4ECDC4" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentText}>Registraste tu desayuno</Text>
                  <Text style={styles.recentTime}>Hace 4 horas</Text>
                </View>
              </View>
              <View style={styles.recentItem}>
                <View style={styles.recentIcon}>
                  <Ionicons name="people" size={20} color="#FFB347" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentText}>
                    Te uniste a "Morning Warriors"
                  </Text>
                  <Text style={styles.recentTime}>Ayer</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSettings(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSettings(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Configuración</Text>
                <TouchableOpacity onPress={() => setShowSettings(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color="rgba(255,255,255,0.96)"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {settingsOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.settingOption,
                      option.isLogout && styles.logoutOption,
                    ]}
                    onPress={() => handlePress(option)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={22}
                      color={
                        option.isLogout ? "#FF6B6B" : "rgba(255,255,255,0.7)"
                      }
                    />
                    <Text
                      style={[
                        styles.settingText,
                        option.isLogout && styles.logoutText,
                      ]}
                    >
                      {option.title}
                    </Text>
                    {!option.isLogout && (
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="rgba(255,255,255,0.3)"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
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
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  menuButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.1)",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  location: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    paddingHorizontal: 20,
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: colors.azulNaturaleza,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    alignItems: "center",
  },
  editProfileText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  shareButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  activitySection: {
    marginTop: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
    marginBottom: 16,
  },
  activityGrid: {
    flexDirection: "row",
    gap: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: colors.beigeNatural,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
    ...shadows.sm,
  },
  activityValue: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.fondoBaseOscuro,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: typography.sizes.caption,
    color: colors.fondoBaseOscuro,
    opacity: 0.7,
    textAlign: "center",
  },
  recentSection: {
    marginBottom: 32,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  recentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  recentInfo: {
    flex: 1,
  },
  recentText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.fondoBaseOscuro,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    maxHeight: "80%",
    borderTopWidth: 1,
    borderTopColor: colors.azulNaturaleza + "33",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 16,
  },
  logoutOption: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  logoutText: {
    color: "#FF6B6B",
  },
});

export default ProfileScreen;
