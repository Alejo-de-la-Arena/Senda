import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const ExploreScreen = () => {
  return (
    <LinearGradient
      colors={[colors.azulProfundo, colors.fondoBaseOscuro, colors.marronTierra]}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Ionicons name="compass-outline" size={64} color="rgba(255,255,255,0.2)" />
          <Text style={styles.title}>Explorar</Text>
          <Text style={styles.subtitle}>Descubre nuevos rituales</Text>
          <Text style={styles.comingSoon}>Próximamente</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    color: colors.textoSecundario,
    marginBottom: spacing.lg,
  },
  comingSoon: {
    fontSize: typography.sizes.bodySmall,
    color: colors.naranjaCTA,
    fontStyle: 'italic',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.naranjaCTA + '33',
    borderRadius: borderRadius.round,
  },
});

export default ExploreScreen;