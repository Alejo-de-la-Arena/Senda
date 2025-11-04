import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const RitualCard = ({ ritual, type }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getTypeColor = () => {
    switch(type) {
      case 'breathe': return colors.azulNaturaleza;
      case 'train': return colors.naranjaCTA;
      case 'eat': return colors.marronTierra;
      default: return colors.textoPrincipal;
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.card}>
        <View style={styles.cardBackground}>
          <View style={[styles.gradientOverlay, { backgroundColor: getTypeColor() + '10' }]} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: ritual.iconColor + '20' }]}>
              <Ionicons 
                name={ritual.icon} 
                size={28} 
                color={ritual.iconColor || 'rgba(255,255,255,0.8)'} 
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{ritual.title}</Text>
              <Text style={styles.author}>by {ritual.author}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{ritual.description}</Text>
          
          <View style={styles.footer}>
            <View style={styles.duration}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.durationText}>{ritual.duration}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.playButton}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.9}
            >
              <Ionicons name="play" size={20} color="#0C0A0A" />
              <Text style={styles.playText}>Play</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.beigeNatural,
    ...shadows.md,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    flex: 1,
    opacity: 0.3,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingTop: 4,
  },
  title: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.fondoBaseOscuro,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  author: {
    fontSize: typography.sizes.bodySmall,
    color: colors.marronTierra,
    opacity: 0.7,
  },
  description: {
    fontSize: typography.sizes.body,
    lineHeight: 22,
    color: colors.fondoBaseOscuro,
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: typography.sizes.bodySmall,
    color: colors.marronTierra,
    opacity: 0.6,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.naranjaCTA,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    gap: 8,
  },
  playText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
});

export default RitualCard;