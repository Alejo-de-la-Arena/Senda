// screens/BreatheSetupScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../styles/theme';
// Ajustá esta import según tu proyecto
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
                        style={styles.mainButton}
                        onPress={handleGenerateRoutine}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[colors.naranjaCTA, colors.marronTierra]}
                            style={styles.mainButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={20} color="#fff" />
                                    <Text style={styles.mainButtonText}>
                                        Generar rutina personalizada
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
});

export default BreatheSetupScreen;
