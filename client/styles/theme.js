// UI Kit - Senda Theme Configuration
export const colors = {
  // Colores base
  fondoBaseOscuro: '#1F2E24',
  textoPrincipal: '#FFFFFF',
  textoSecundario: '#D9D9D9',
  verdeBosque: '#355E3B',
  marronTierra: '#4B3621',
  naranjaCTA: '#D98C5F',
  beigeNatural: '#EAE6DA',
  azulNaturaleza: '#3B5E5C', // Nuevo azul verdoso que combina con la paleta natural
  azulProfundo: '#2C4A48', // Versión más oscura del azul
  azulClaro: '#5A8A87', // Versión más clara del azul
  
  // Aliases para facilitar el uso
  background: '#1F2E24',
  primary: '#355E3B',
  secondary: '#4B3621', 
  accent: '#fdbf9bff',
  surface: '#EAE6DA',
  blue: '#3B5E5C', // Alias para el azul principal
  blueLight: '#5A8A87',
  blueDark: '#2C4A48',
  textPrimary: '#FFFFFF',
  textSecondary: '#D9D9D9',
  textOnLight: '#1F2E24',
};

export const typography = {
  // Fuentes principales
  primaryFont: 'Montserrat', // Para títulos
  secondaryFont: 'Open Sans', // Para texto largo
  
  // Tamaños de fuente
  sizes: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
  },
  
  // Pesos de fuente
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

// Estilos de componentes predefinidos
export const components = {
  buttonPrimary: {
    backgroundColor: colors.naranjaCTA,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.verdeBosque,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.beigeNatural,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  header: {
    backgroundColor: colors.fondoBaseOscuro,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
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
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
};
