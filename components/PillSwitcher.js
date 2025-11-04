import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../styles/theme';

const PillSwitcher = ({ selected, onSelect }) => {
  const options = [
    { id: 'breathe', label: 'Breathe', icon: 'leaf-outline' },
    { id: 'train', label: 'Train', icon: 'barbell-outline' },
    { id: 'eat', label: 'Eat', icon: 'nutrition-outline' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.pillContainer}>
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.pill,
                isSelected && styles.selectedPill
              ]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={option.icon} 
                size={20} 
                color={isSelected ? colors.textoPrincipal : colors.textoSecundario}
              />
              <Text style={[
                styles.pillText,
                isSelected && styles.selectedPillText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.lg,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: colors.azulNaturaleza + '1A', // 10% opacity
    borderRadius: borderRadius.round,
    padding: 4,
    justifyContent: 'space-between',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    gap: 6,
  },
  selectedPill: {
    backgroundColor: colors.azulNaturaleza,
  },

  pillText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoSecundario,
  },
  selectedPillText: {
    color: colors.textoPrincipal,
  },
});

export default PillSwitcher;