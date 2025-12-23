// screens/BreatheSetupScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
import { api } from '../api/api';

const moods = [
    { id: 'estresado', label: 'Estresado', description: 'Quiero bajar la ansiedad' },
    { id: 'cansado', label: 'Cansado', description: 'Necesito recargar energía' },
    { id: 'disperso', label: 'Disperso', description: 'Me cuesta concentrarme' },
    { id: 'tenso', label: 'Tenso', description: 'Siento mucha presión' },
];

const durations = [5, 7, 10, 15];

const goals = [
    { id: 'estres', label: 'Reducir estrés' },
    { id: 'foco', label: 'Mejorar foco' },
    { id: 'sueño', label: 'Preparar para dormir' },
];

const BreatheSetupScreen = ({ navigation }) => {
    const [selectedMood, setSelectedMood] = useState('estresado');
    const [selectedMinutes, setSelectedMinutes] = useState(7);
    const [selectedGoal, setSelectedGoal] = useState('foco');
    const [loading, setLoading] = useState(false);

    const loadingAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let animation;
        if (loading) {
            animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(loadingAnim, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                    Animated.timing(loadingAnim, {
                        toValue: 0,
                        duration: 700,
                        useNativeDriver: true,
                    }),
                ])
            );
            animation.start();
        } else {
            loadingAnim.setValue(0);
        }

        return () => {
            if (animation) animation.stop();
        };
    }, [loading, loadingAnim]);

    const handleGenerateRoutine = async () => {
        try {
            setLoading(true);

            const { data: routine } = await api.post(
                '/meditation/generate-breathing',
                {
                    type: 'breathing',
                    mood: selectedMood,
                    minutes: selectedMinutes,
                    goal: selectedGoal,
                }
            );

            // Navegamos a BoxBreathing con la rutina generada
            navigation.replace('BoxBreathing', { routine });
        } catch (error) {
            console.error('Error generando rutina:', error?.response?.data || error.message);
            Alert.alert(
                'Ups',
                'No pudimos generar la rutina en este momento. Probá de nuevo en unos minutos.'
            );
        } finally {
            setLoading(false);
        }
    };


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
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color="rgba(255,255,255,0.96)"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tu sesión de Breathe</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>¿Cómo te sentís hoy?</Text>
                    <View style={styles.cardGroup}>
                        {moods.map((mood) => (
                            <TouchableOpacity
                                key={mood.id}
                                style={[
                                    styles.moodCard,
                                    selectedMood === mood.id && styles.moodCardSelected,
                                ]}
                                onPress={() => setSelectedMood(mood.id)}
                            >
                                <Text
                                    style={[
                                        styles.moodLabel,
                                        selectedMood === mood.id && styles.moodLabelSelected,
                                    ]}
                                >
                                    {mood.label}
                                </Text>
                                <Text style={styles.moodDescription}>{mood.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>¿Cuánto tiempo tenés?</Text>
                    <View style={styles.chipRow}>
                        {durations.map((min) => (
                            <TouchableOpacity
                                key={min}
                                style={[
                                    styles.chip,
                                    selectedMinutes === min && styles.chipSelected,
                                ]}
                                onPress={() => setSelectedMinutes(min)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedMinutes === min && styles.chipTextSelected,
                                    ]}
                                >
                                    {min} min
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>¿Qué buscás hoy?</Text>
                    <View style={styles.chipRow}>
                        {goals.map((g) => (
                            <TouchableOpacity
                                key={g.id}
                                style={[
                                    styles.chip,
                                    selectedGoal === g.id && styles.chipSelected,
                                ]}
                                onPress={() => setSelectedGoal(g.id)}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        selectedGoal === g.id && styles.chipTextSelected,
                                    ]}
                                >
                                    {g.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.generateButton,
                            loading && { opacity: 0.7 },
                        ]}
                        onPress={handleGenerateRoutine}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.generateButtonContent}>
                                <ActivityIndicator color="#fff" />
                                <Text style={styles.generateButtonText}>
                                    Generando tu rutina...
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.generateButtonContent}>
                                <Ionicons name="sparkles-outline" size={20} color="#fff" />
                                <Text style={styles.generateButtonText}>
                                    Generar rutina personalizada
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <Animated.View
                            style={[
                                styles.loadingCircleWrapper,
                                {
                                    transform: [
                                        {
                                            scale: loadingAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.95, 1.1],
                                            }),
                                        },
                                        {
                                            rotate: loadingAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '30deg'],
                                            }),
                                        },
                                    ],
                                    opacity: loadingAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.4, 0.9],
                                    }),
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={[
                                    colors.azulProfundo,
                                    colors.verdeBosque,
                                    colors.marronTierra,
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.loadingCircle}
                            />
                        </Animated.View>

                        <Text style={styles.loadingText}>
                            Diseñando tu respiración de hoy
                        </Text>
                        <Text style={styles.loadingSubtext}>
                            Ajustando tiempos y fases según tu estado y objetivo
                        </Text>
                    </View>
                )}

            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
        marginTop: 12,
        marginBottom: 8,
    },
    cardGroup: {
        gap: 8,
        marginBottom: 12,
    },
    moodCard: {
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    moodCardSelected: {
        borderColor: colors.naranjaCTA,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    moodLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 2,
    },
    moodLabelSelected: {
        color: 'white',
    },
    moodDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    chipSelected: {
        borderColor: colors.naranjaCTA,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    chipText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    chipTextSelected: {
        color: 'white',
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    mainButton: {
        borderRadius: 999,
        overflow: 'hidden',
    },
    mainButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    mainButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    generateButton: {
        marginTop: 24,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: colors.naranjaCTA,
    },
    generateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.65)', 
        paddingHorizontal: 32,
    },
    loadingCircleWrapper: {
        width: 130,
        height: 130,
        borderRadius: 65,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 65,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    loadingText: {
        color: 'rgba(255,255,255,0.96)',
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 0.4,
        marginBottom: 6,
    },
    loadingSubtext: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
        textAlign: 'center',
    },

});

export default BreatheSetupScreen;
