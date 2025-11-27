// screens/BoxBreathingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const { width } = Dimensions.get('window');

const BoxBreathingScreen = ({ navigation, route }) => {
  const routine = route?.params?.routine;

  const phaseConfig = {
    inhale: {
      text: routine?.phases?.inhale?.label ?? 'Inhala',
      duration: routine?.phases?.inhale?.duration ?? 4,
      color: colors.verdeBosque,
      icon: 'arrow-up',
      instruction:
        routine?.phases?.inhale?.instruction ?? 'Respira profundamente por la nariz',
    },
    hold1: {
      text: routine?.phases?.hold1?.label ?? 'Mantén',
      duration: routine?.phases?.hold1?.duration ?? 4,
      color: colors.naranjaCTA,
      icon: 'pause',
      instruction: routine?.phases?.hold1?.instruction ?? 'Retén el aire en tus pulmones',
    },
    exhale: {
      text: routine?.phases?.exhale?.label ?? 'Exhala',
      duration: routine?.phases?.exhale?.duration ?? 4,
      color: colors.marronTierra,
      icon: 'arrow-down',
      instruction:
        routine?.phases?.exhale?.instruction ?? 'Suelta el aire lentamente por la boca',
    },
    hold2: {
      text: routine?.phases?.hold2?.label ?? 'Mantén',
      duration: routine?.phases?.hold2?.duration ?? 4,
      color: colors.verdeBosque,
      icon: 'pause',
      instruction: routine?.phases?.hold2?.instruction ?? 'Mantén los pulmones vacíos',
    },
  };

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold1, exhale, hold2
  const [secondsRemaining, setSecondsRemaining] = useState(
    phaseConfig.inhale.duration
  );
  const [totalCycles, setTotalCycles] = useState(routine?.cycles ?? 6);
  const [currentCycle, setCurrentCycle] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const goBackWithStatus = (status) => {
    navigation.navigate('MainTabs', {
      screen: 'Tu Día',
      params: { breathingStatus: status },
    });
  };


  useEffect(() => {
    let interval;

    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      // Vibración suave al cambiar de fase
      Vibration.vibrate(50);

      const phases = ['inhale', 'hold1', 'exhale', 'hold2'];
      const currentIndex = phases.indexOf(phase);
      const nextIndex = (currentIndex + 1) % 4;
      const nextPhase = phases[nextIndex];

      if (nextPhase === 'inhale') {
        // nuevo ciclo
        setCurrentCycle((prev) => {
          const nextCycle = prev + 1;
          if (nextCycle >= totalCycles) {
            // Ejercicio completado
            handleComplete();
            return prev;
          }
          return nextCycle;
        });
      }

      setPhase(nextPhase);
      setSecondsRemaining(phaseConfig[nextPhase].duration);
    }

    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, phase, totalCycles, phaseConfig]);

  useEffect(() => {
    if (!isActive) return;

    if (phase === 'inhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: phaseConfig.inhale.duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: phaseConfig.inhale.duration * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (phase === 'exhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: phaseConfig.exhale.duration * 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: phaseConfig.exhale.duration * 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Rotación continua del indicador exterior (solo arrancamos una vez)
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration:
          (phaseConfig.inhale.duration +
            phaseConfig.hold1.duration +
            phaseConfig.exhale.duration +
            phaseConfig.hold2.duration) *
          1000,
        useNativeDriver: true,
      })
    ).start();
  }, [phase, isActive, phaseConfig, scaleAnim, opacityAnim, rotateAnim]);

  const handleStart = () => {
    setTotalCycles(routine?.cycles ?? 6);
    setIsActive(true);
    setPhase('inhale');
    setSecondsRemaining(phaseConfig.inhale.duration);
    setCurrentCycle(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleResume = () => {
    setIsActive(true);
  };

  const handleStop = (status = 'incomplete') => {
    setIsActive(false);
    setPhase('inhale');
    setSecondsRemaining(phaseConfig.inhale.duration);
    setCurrentCycle(0);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    goBackWithStatus(status);
  };

  const handleComplete = () => {
    setIsActive(false);
    Vibration.vibrate([0, 200, 100, 200]);
    setTimeout(() => {
      handleStop('completed');
    }, 1500);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[colors.azulProfundo, colors.fondoBaseOscuro, colors.marronTierra]}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => handleStop('incomplete')}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="rgba(255,255,255,0.96)"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {routine?.title ?? 'Box Breathing'}
          </Text>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="rgba(255,255,255,0.96)"
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Progress */}
          {isActive && (
            <View style={styles.progressContainer}>
              <Text style={styles.cycleText}>
                Ciclo {currentCycle + 1} de {totalCycles}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${((currentCycle * 4 +
                        ['inhale', 'hold1', 'exhale', 'hold2'].indexOf(
                          phase
                        )) /
                        (totalCycles * 4)) *
                        100
                        }%`,
                      backgroundColor: phaseConfig[phase].color,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Breathing Circle */}
          <View style={styles.breathingContainer}>
            {/* Rotating outer ring */}
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              <View
                style={[
                  styles.phaseIndicator,
                  { backgroundColor: phaseConfig[phase].color },
                ]}
              />
            </Animated.View>

            {/* Breathing circle */}
            <Animated.View
              style={[
                styles.breathingCircle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                  backgroundColor: phaseConfig[phase].color,
                },
              ]}
            />

            {/* Center content */}
            <View style={styles.centerContent}>
              <Ionicons
                name={phaseConfig[phase].icon}
                size={40}
                color="rgba(255,255,255,0.96)"
              />
              <Text style={styles.phaseText}>{phaseConfig[phase].text}</Text>
              <Text style={styles.secondsText}>{secondsRemaining}</Text>
            </View>
          </View>

          {/* Instructions */}
          <Text style={styles.instruction}>
            {phaseConfig[phase].instruction}
          </Text>

          {/* Phase indicators */}
          <View style={styles.phaseIndicators}>
            {['inhale', 'hold1', 'exhale', 'hold2'].map((p) => (
              <View key={p} style={styles.phaseItem}>
                <View
                  style={[
                    styles.phaseDot,
                    {
                      backgroundColor:
                        p === phase
                          ? phaseConfig[p].color
                          : 'rgba(255,255,255,0.2)',
                      transform: [{ scale: p === phase ? 1.2 : 1 }],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.phaseLabel,
                    p === phase && styles.activePhaseLabel,
                  ]}
                >
                  {phaseConfig[p].text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isActive && currentCycle === 0 ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <LinearGradient
                colors={[colors.naranjaCTA, colors.marronTierra]}
                style={styles.startButtonGradient}
              >
                <Ionicons name="play" size={24} color="white" />
                <Text style={styles.startButtonText}>Comenzar Ejercicio</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.controlButtons}>
              {isActive ? (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handlePause}
                >
                  <Ionicons
                    name="pause"
                    size={24}
                    color="rgba(255,255,255,0.96)"
                  />
                  <Text style={styles.controlButtonText}>Pausar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleResume}
                >
                  <Ionicons
                    name="play"
                    size={24}
                    color="rgba(255,255,255,0.96)"
                  />
                  <Text style={styles.controlButtonText}>Continuar</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={() => handleStop('incomplete')}
              >
                <Ionicons name="stop" size={24} color="#FF6B6B" />
                <Text
                  style={[
                    styles.controlButtonText,
                    { color: '#FF6B6B' },
                  ]}
                >
                  Detener
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <View style={styles.tip}>
            <Ionicons
              name="bulb-outline"
              size={16}
              color="rgba(255,255,255,0.5)"
            />
            <Text style={styles.tipText}>
              {routine?.tip ??
                'Box Breathing ayuda a reducir el estrés y mejorar el enfoque'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // mismos estilos que ya tenías, solo agrego activePhaseLabel si no estaba:
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: typography.sizes.h5,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  infoButton: { padding: 8 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  cycleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  breathingContainer: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseIndicator: {
    position: 'absolute',
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  breathingCircle: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: width * 0.35,
  },
  centerContent: { alignItems: 'center' },
  phaseText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.96)',
    marginTop: 8,
    marginBottom: 4,
  },
  secondsText: {
    fontSize: 48,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.96)',
  },
  instruction: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  phaseIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 40,
  },
  phaseItem: { alignItems: 'center' },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  phaseLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  activePhaseLabel: {
    color: 'rgba(255,255,255,0.8)',
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 14,
    borderRadius: 100,
    gap: 8,
  },
  controlButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.96)',
  },
  stopButton: {
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  tipsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.verdeBosque + '1A',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default BoxBreathingScreen;
