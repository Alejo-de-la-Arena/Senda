import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const { height } = Dimensions.get('window');

const SupplementsModal = ({ visible, onClose, supplements, onUpdateSupplements }) => {
  const [editMode, setEditMode] = useState(false);
  const [newSupplement, setNewSupplement] = useState({
    name: '',
    dose: '',
    time: ''
  });
  const [localSupplements, setLocalSupplements] = useState(supplements);
  
  // Animación para el slide
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  
  React.useEffect(() => {
    if (visible) {
      setLocalSupplements(supplements);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);

  const handleAddSupplement = () => {
    if (newSupplement.name && newSupplement.dose && newSupplement.time) {
      const supplement = {
        id: Date.now(),
        name: newSupplement.name,
        dose: newSupplement.dose,
        time: newSupplement.time,
        taken: false
      };
      setLocalSupplements([...localSupplements, supplement]);
      setNewSupplement({ name: '', dose: '', time: '' });
    }
  };

  const handleDeleteSupplement = (id) => {
    setLocalSupplements(localSupplements.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onUpdateSupplements(localSupplements);
    onClose();
  };

  const timeOptions = ['Ayunas', 'Mañana', 'Desayuno', 'Comida', 'Tarde', 'Cena', 'Noche'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {/* Handle bar */}
            <View style={styles.handleBar} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Gestionar Suplementos</Text>
              <TouchableOpacity onPress={() => setEditMode(!editMode)}>
                <Ionicons 
                  name={editMode ? "checkmark-circle" : "create-outline"} 
                  size={24} 
                  color={editMode ? "#4CAF50" : "rgba(255,255,255,0.7)"} 
                />
              </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.content}
            >
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {/* Lista de suplementos actuales */}
                <View style={styles.supplementsList}>
                  <Text style={styles.sectionTitle}>Tus Suplementos</Text>
                  {localSupplements.map((supplement) => (
                    <View key={supplement.id} style={styles.supplementItem}>
                      <View style={styles.supplementInfo}>
                        <Text style={styles.supplementName}>{supplement.name}</Text>
                        <View style={styles.supplementDetails}>
                          <Text style={styles.supplementDose}>{supplement.dose}</Text>
                          <Text style={styles.supplementTime}>• {supplement.time}</Text>
                        </View>
                      </View>
                      {editMode && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteSupplement(supplement.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>

                {/* Agregar nuevo suplemento */}
                <View style={styles.addSection}>
                  <Text style={styles.sectionTitle}>Agregar Nuevo</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre del suplemento"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={newSupplement.name}
                    onChangeText={(text) => setNewSupplement({...newSupplement, name: text})}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="Dosis (ej: 500mg, 2 cápsulas)"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={newSupplement.dose}
                    onChangeText={(text) => setNewSupplement({...newSupplement, dose: text})}
                  />
                  
                  {/* Selector de horario */}
                  <Text style={styles.labelText}>Momento del día</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.timeSelector}
                  >
                    {timeOptions.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.timeChip,
                          newSupplement.time === time && styles.timeChipSelected
                        ]}
                        onPress={() => setNewSupplement({...newSupplement, time})}
                      >
                        <Text style={[
                          styles.timeChipText,
                          newSupplement.time === time && styles.timeChipTextSelected
                        ]}>
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity 
                    style={[
                      styles.addButton,
                      (!newSupplement.name || !newSupplement.dose || !newSupplement.time) && styles.addButtonDisabled
                    ]}
                    onPress={handleAddSupplement}
                    disabled={!newSupplement.name || !newSupplement.dose || !newSupplement.time}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="white" />
                    <Text style={styles.addButtonText}>Agregar Suplemento</Text>
                  </TouchableOpacity>
                </View>

                {/* Sugerencias rápidas */}
                <View style={styles.suggestions}>
                  <Text style={styles.sectionTitle}>Sugerencias Populares</Text>
                  <View style={styles.suggestionsList}>
                    {[
                      { name: 'Vitamina B12', dose: '1000mcg', time: 'Mañana' },
                      { name: 'Zinc', dose: '15mg', time: 'Cena' },
                      { name: 'Creatina', dose: '5g', time: 'Post-entreno' },
                      { name: 'Ashwagandha', dose: '600mg', time: 'Noche' }
                    ].map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => setNewSupplement(suggestion)}
                      >
                        <Ionicons name="add-circle" size={20} color="#4A90E2" />
                        <Text style={styles.suggestionText}>{suggestion.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer con botones */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.fondoBaseOscuro,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: height * 0.85,
    borderWidth: 1,
    borderColor: colors.azulNaturaleza + '33',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  supplementsList: {
    marginBottom: 24,
  },
  supplementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.96)',
    marginBottom: 4,
  },
  supplementDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supplementDose: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  supplementTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  deleteButton: {
    padding: 8,
  },
  addSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.azulNaturaleza + '1A',
    borderWidth: 1,
    borderColor: colors.azulNaturaleza + '33',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.body,
    color: colors.textoPrincipal,
    marginBottom: spacing.sm,
  },
  labelText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  timeSelector: {
    marginBottom: 16,
  },
  timeChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeChipSelected: {
    backgroundColor: 'rgba(74,144,226,0.2)',
    borderColor: '#4A90E2',
  },
  timeChipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  timeChipTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.naranjaCTA,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    gap: spacing.sm,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(74,144,226,0.3)',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  suggestions: {
    marginBottom: 20,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,144,226,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 100,
    gap: 6,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.azulNaturaleza,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
});

export default SupplementsModal;