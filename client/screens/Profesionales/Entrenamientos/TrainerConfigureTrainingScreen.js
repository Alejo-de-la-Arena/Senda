// ./screens/Profesionales/Entrenamientos/ConfigurarEntrenamiento.js

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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  colors,
  spacing,
  borderRadius,
  typography,
} from "../../../styles/theme";
import {
  getMyPrograms,
  assignProgramToUser,
  createProgramFromCsv,
} from "../../../api/profesionales";

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

export default function TrainerConfigureTrainingScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { userId, userName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState("");
  const [assigningId, setAssigningId] = useState(null);
  const [creatingProgram, setCreatingProgram] = useState(false);

  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  const [durationWeeks, setDurationWeeks] = useState(null);

  const GOAL_OPTIONS = [
    "hipertrofia",
    "fuerza",
    "pérdida de grasa",
    "rendimiento",
  ];
  const LEVEL_OPTIONS = ["principiante", "intermedio", "avanzado"];
  const DURATION_OPTIONS = [1, 2, 3, 4]; // semanas

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await getMyPrograms();
      setPrograms(list);
    } catch (e) {
      console.log("Error cargando programas del trainer", e);
      setError(
        e?.response?.data?.error ||
          "No pudimos cargar tus programas de entrenamiento."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleSelectProgram = (program) => {
    Alert.alert(
      "Asignar programa",
      `¿Querés asignar "${program.title || "Programa sin título"}" a ${
        userName || "este usuario"
      }?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Asignar",
          style: "default",
          onPress: () => confirmAssign(program),
        },
      ]
    );
  };

  const confirmAssign = async (program) => {
    try {
      setAssigningId(program.id);

      await assignProgramToUser(userId, program.id);

      Alert.alert(
        "Programa asignado ✅",
        `Le asignaste "${program.title || "Programa"}" a ${
          userName || "el usuario"
        }.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Volvemos a la screen anterior (VerEntrenamientos)
              navigation.goBack();
            },
          },
        ]
      );
    } catch (e) {
      console.log("Error asignando programa", e);
      Alert.alert(
        "Ups...",
        e?.response?.data?.error || "No pudimos asignar este programa."
      );
    } finally {
      setAssigningId(null);
    }
  };

  const handleUploadCsvPress = async () => {
    try {
      if (creatingProgram) return;

      // 1) Elegir archivo
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "text/plain",
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return; // usuario canceló
      }

      const asset = result.assets ? result.assets[0] : result;
      if (!asset || !asset.uri) {
        Alert.alert("Ups...", "No pudimos leer el archivo seleccionado.");
        return;
      }

      // 2) Leer archivo como texto
      setCreatingProgram(true);

      const csvText = await FileSystem.readAsStringAsync(asset.uri);

      if (!csvText || !csvText.trim()) {
        Alert.alert("Ups...", "El archivo CSV está vacío.");
        setCreatingProgram(false);
        return;
      }

      // 3) Definir un título por defecto para el programa
      const fileName = asset.name || "Programa desde CSV";
      const defaultTitle = fileName.replace(/\.[^.]+$/, ""); // sin extensión

      const resp = await createProgramFromCsv({
        title: defaultTitle || "Programa desde CSV",
        goal, // lo que eligió el trainer
        level,
        duration_weeks: durationWeeks ? Number(durationWeeks) : null,
        csvText,
      });

      Alert.alert(
        "Programa creado ✅",
        `Se creó el programa "${defaultTitle}" con ${resp.workouts_created} días y ${resp.exercises_created} ejercicios.`,
        [
          {
            text: "OK",
            onPress: () => {
              loadPrograms();
            },
          },
        ]
      );
    } catch (e) {
      console.log("Error creando programa desde CSV", e);
      Alert.alert(
        "Ups...",
        e?.response?.data?.error ||
          "No pudimos crear el programa desde el CSV. Revisá el archivo."
      );
    } finally {
      setCreatingProgram(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        colors.azulProfundo,
        colors.fondoBaseOscuro,
        colors.marronTierra,
      ]}
      locations={[0, 0.5, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color="rgba(255,255,255,0.9)"
              />
            </TouchableOpacity>
            <View>
              <Text style={styles.screenTitle}>Configurar entrenamiento</Text>
              {userName ? (
                <Text style={styles.subtitle}>
                  Alumno: <Text style={styles.highlight}>{userName}</Text>
                </Text>
              ) : null}
            </View>
          </View>

          <TouchableOpacity onPress={loadPrograms} style={styles.refreshBtn}>
            <Ionicons
              name="refresh-outline"
              size={20}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Cargando tus programas...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadPrograms} style={styles.retryButton}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* BLOQUE: CREAR NUEVO PROGRAMA */}
            <Text style={styles.sectionTitle}>Crear nuevo programa</Text>
            <View style={styles.sectionCard}>
              {/* Meta del programa */}
              <View style={styles.metaSection}>
                <Text style={styles.metaLabel}>Objetivo del programa</Text>
                <View style={styles.chipsRow}>
                  {GOAL_OPTIONS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGoal(g)}
                      style={[styles.chip, goal === g && styles.chipSelected]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          goal === g && styles.chipTextSelected,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.metaLabel, { marginTop: 10 }]}>Nivel</Text>
                <View style={styles.chipsRow}>
                  {LEVEL_OPTIONS.map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setLevel(lvl)}
                      style={[
                        styles.chip,
                        level === lvl && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          level === lvl && styles.chipTextSelected,
                        ]}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.metaLabel, { marginTop: 10 }]}>
                  Duración (semanas)
                </Text>
                <View style={styles.chipsRow}>
                  {DURATION_OPTIONS.map((w) => (
                    <TouchableOpacity
                      key={w}
                      onPress={() => setDurationWeeks(w)}
                      style={[
                        styles.chip,
                        durationWeeks === w && styles.chipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          durationWeeks === w && styles.chipTextSelected,
                        ]}
                      >
                        {w}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Botón CSV dentro de la card */}
              <View style={styles.csvButtonContainer}>
                <TouchableOpacity
                  onPress={handleUploadCsvPress}
                  style={[
                    styles.csvButton,
                    (creatingProgram || assigningId) && { opacity: 0.7 },
                  ]}
                  disabled={creatingProgram || !!assigningId}
                >
                  {creatingProgram ? (
                    <ActivityIndicator size="small" color="#111" />
                  ) : (
                    <Ionicons
                      name="cloud-upload-outline"
                      size={18}
                      color="#111"
                    />
                  )}
                  <Text style={styles.csvButtonText}>
                    {creatingProgram
                      ? "Creando programa..."
                      : "Crear programa desde CSV"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DIVISOR / TÍTULO PARA PROGRAMAS EXISTENTES */}
            <View style={styles.sectionDivider}>
              <View style={styles.sectionDividerLine} />
              <Text style={styles.sectionDividerText}>
                O elegí un programa existente
              </Text>
              <View style={styles.sectionDividerLine} />
            </View>

            {programs.length === 0 ? (
              <View style={styles.center}>
                <Ionicons
                  name="clipboard-outline"
                  size={40}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.emptyText}>
                  Todavía no tenés programas de entrenamiento cargados.
                </Text>
                <Text style={styles.helperText}>
                  Creá tu primer programa subiendo un archivo CSV.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {programs.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.programCard,
                      assigningId === p.id && { opacity: 0.6 },
                    ]}
                    onPress={() => handleSelectProgram(p)}
                    disabled={!!assigningId || creatingProgram}
                  >
                    <View style={styles.programHeader}>
                      <Text style={styles.programTitle}>
                        {p.title || "Programa sin título"}
                      </Text>
                      {assigningId === p.id && (
                        <ActivityIndicator size="small" color="#fff" />
                      )}
                    </View>

                    {p.goal ? (
                      <Text style={styles.programMeta}>Objetivo: {p.goal}</Text>
                    ) : null}

                    {p.level ? (
                      <Text style={styles.programMeta}>Nivel: {p.level}</Text>
                    ) : null}

                    {p.duration_weeks ? (
                      <Text style={styles.programMeta}>
                        Duración: {p.duration_weeks} semanas
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
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
    marginBottom: 12,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.96)",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  highlight: {
    color: "#fff",
    fontWeight: "600",
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 999,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 8,
    color: "rgba(255,255,255,0.7)",
  },
  errorText: {
    color: "#FFB3B3",
    textAlign: "center",
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
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  helperText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },

  // Crear nuevo programa
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 6,
  },
  sectionCard: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  csvButtonContainer: {
    marginTop: 12,
  },
  csvButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.naranjaCTA,
    paddingVertical: 8,
    borderRadius: 999,
  },
  csvButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  // Lista de programas
  programCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  programTitle: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  programMeta: {
    fontSize: 12,
    color: colors.textoSecundario,
    marginTop: 2,
  },

  // Meta program
  metaSection: {
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: colors.naranjaCTA,
    borderColor: colors.naranjaCTA,
  },
  chipText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
  },
  chipTextSelected: {
    color: "#111",
    fontWeight: "700",
  },

  // Divisor entre secciones
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  sectionDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  sectionDividerText: {
    marginHorizontal: 8,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
