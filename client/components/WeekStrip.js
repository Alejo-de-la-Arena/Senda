import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../styles/theme';

const WeekStrip = () => {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Obtener el día actual (0 = domingo, ajustar para nuestro formato)
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Convertir domingo de 0 a 6
  
  return (
    <View style={styles.container}>
      {days.map((day, index) => {
        const isToday = index === adjustedToday;
        return (
          <View key={index} style={styles.dayContainer}>
            <Text style={[styles.dayText, isToday && styles.todayText]}>
              {day}
            </Text>
            {isToday && <View style={styles.todayIndicator} />}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  dayContainer: {
    alignItems: 'center',
    width: 40,
  },
  dayText: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.medium,
    color: colors.textoSecundario,
    marginBottom: spacing.sm,
  },
  todayText: {
    color: colors.textoPrincipal,
    fontWeight: typography.weights.bold,
  },
  todayIndicator: {
    width: 24,
    height: 2,
    backgroundColor: colors.naranjaCTA,
    borderRadius: 1,
  },
});

export default WeekStrip;