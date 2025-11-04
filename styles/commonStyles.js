// Common styles for Senda App
import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from './theme';

export const commonStyles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: colors.fondoBaseOscuro,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  contentPadding: {
    paddingHorizontal: spacing.md,
  },

  // Cards
  card: {
    backgroundColor: colors.beigeNatural,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardDark: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Typography
  h1: {
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  h2: {
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  h3: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  h4: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  body: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
    color: colors.textoPrincipal,
  },
  bodySmall: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.regular,
    color: colors.textoSecundario,
  },
  caption: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.regular,
    color: colors.textoSecundario,
  },
  textOnLight: {
    color: colors.textOnLight,
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: colors.naranjaCTA,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  buttonSecondary: {
    backgroundColor: colors.verdeBosque,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondaryText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.textoSecundario,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutlineText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textoSecundario,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: colors.textoSecundario,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.body,
    color: colors.textoPrincipal,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.medium,
    color: colors.textoSecundario,
    marginBottom: spacing.xs,
  },

  // Headers
  header: {
    backgroundColor: colors.fondoBaseOscuro,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },

  // Lists
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  listSeparator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: spacing.md,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.fondoBaseOscuro,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...shadows.lg,
  },

  // Status & Badges
  badge: {
    backgroundColor: colors.naranjaCTA,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  badgeText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },

  // Utility classes
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  marginTop: {
    marginTop: spacing.md,
  },
  marginBottom: {
    marginBottom: spacing.md,
  },
  marginHorizontal: {
    marginHorizontal: spacing.md,
  },
  marginVertical: {
    marginVertical: spacing.md,
  },
  padding: {
    padding: spacing.md,
  },
  paddingHorizontal: {
    paddingHorizontal: spacing.md,
  },
  paddingVertical: {
    paddingVertical: spacing.md,
  },
});

export default commonStyles;
