import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const ChatScreen = ({ navigation }) => {
  const [activeCategory, setActiveCategory] = useState('profesionales');
  const [showSendaAI, setShowSendaAI] = useState(false);

  // Datos de profesionales (coaches y nutricionistas juntos)
  const profesionalesConversations = [
    {
      id: 1,
      name: 'Coach Sarah',
      avatarIcon: 'person-circle',
      avatarColor: '#FF6B9D',
      lastMessage: '¡Excelente progreso esta semana! Sigue así',
      time: '10:30',
      unread: 2,
      verified: true,
      role: 'Coach Fitness',
      nextCall: 'Llamada disponible: Viernes 6PM',
      hasScheduledCall: false
    },
    {
      id: 2,
      name: 'Dra. Ana Martínez',
      avatarIcon: 'person-circle',
      avatarColor: '#4ECDC4',
      lastMessage: 'Tu plan nutricional está listo',
      time: 'Lun',
      unread: 1,
      verified: true,
      role: 'Nutricionista',
      nextCall: 'Llamada disponible: Jueves 4PM',
      hasScheduledCall: false
    },
    {
      id: 3,
      name: 'Coach Miguel',
      avatarIcon: 'person-circle',
      avatarColor: '#4A90E2',
      lastMessage: 'Revisé tu rutina, hagamos unos ajustes',
      time: 'Ayer',
      unread: 0,
      verified: true,
      role: 'Coach Strength',
      nextCall: 'Próxima llamada: Mañana 5PM',
      hasScheduledCall: true
    },
    {
      id: 4,
      name: 'Dr. Pedro López',
      avatarIcon: 'person-circle',
      avatarColor: '#98D8C8',
      lastMessage: 'Recuerda tomar 2L de agua al día',
      time: 'Mar',
      unread: 0,
      verified: true,
      role: 'Nutricionista Deportivo',
      nextCall: 'Próxima llamada: Lunes 3PM',
      hasScheduledCall: true
    }
  ];

  const groupConversations = [
    {
      id: 1,
      name: 'Morning Warriors',
      avatarIcon: 'people-circle',
      avatarColor: '#FFB347',
      lastMessage: 'Carlos: Listos para mañana?',
      time: 'Ayer',
      unread: 5,
      isGroup: true,
      members: 12
    },
    {
      id: 2,
      name: 'Meal Prep Domingos',
      avatarIcon: 'people-circle',
      avatarColor: '#4ECDC4',
      lastMessage: 'Ana: Compartí mi receta nueva',
      time: 'Dom',
      unread: 8,
      isGroup: true,
      members: 24
    },
    {
      id: 3,
      name: 'Runners 5K',
      avatarIcon: 'people-circle',
      avatarColor: '#4A90E2',
      lastMessage: 'Diego: Nuevo record personal!',
      time: 'Sáb',
      unread: 0,
      isGroup: true,
      members: 18
    }
  ];

  // Función para manejar el click en Senda AI
  const handleSendaAIClick = () => {
    setShowSendaAI(true);
  };

  // Si mostramos Senda AI, renderizar la pantalla de chat
  if (showSendaAI) {
    const SendaAIChatScreen = require('./SendaAIChatScreen').default;
    return <SendaAIChatScreen navigation={{ goBack: () => setShowSendaAI(false) }} />;
  }

  const getConversations = () => {
    switch(activeCategory) {
      case 'profesionales': return profesionalesConversations;
      case 'grupos': return groupConversations;
      default: return profesionalesConversations;
    }
  };

  const getRoleIcon = (role) => {
    if (role?.includes('Coach') || role?.includes('Fitness') || role?.includes('Strength')) {
      return 'barbell-outline';
    }
    if (role?.includes('Nutricionista') || role?.includes('Nutrición')) {
      return 'nutrition-outline';
    }
    return 'person-outline';
  };

  const getRoleColor = (role) => {
    if (role?.includes('Coach') || role?.includes('Fitness') || role?.includes('Strength')) {
      return '#FF6B6B';
    }
    if (role?.includes('Nutricionista') || role?.includes('Nutrición')) {
      return '#4ECDC4';
    }
    return '#4A90E2';
  };

  const renderScheduleButton = (chat) => {
    if (chat.role) { // Si tiene rol, es un profesional
      return (
        <TouchableOpacity 
          style={[
            styles.scheduleButton,
            chat.hasScheduledCall && styles.scheduledButton
          ]}
        >
          <Ionicons 
            name={chat.hasScheduledCall ? "checkmark-circle" : "videocam-outline"} 
            size={16} 
            color={chat.hasScheduledCall ? "#4CAF50" : "#4A90E2"} 
          />
          <Text style={[
            styles.scheduleButtonText,
            chat.hasScheduledCall && styles.scheduledButtonText
          ]}>
            {chat.hasScheduledCall ? 'Agendada' : 'Agendar'}
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const conversations = getConversations();

  return (
    <LinearGradient
      colors={[colors.azulProfundo, colors.fondoBaseOscuro, colors.marronTierra]}
      style={styles.container}
      locations={[0, 0.5, 1]}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar conversaciones..."
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>
          <TouchableOpacity style={styles.newChatButton}>
            <Ionicons name="create-outline" size={24} color="rgba(255,255,255,0.96)" />
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <View style={styles.categoriesWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <TouchableOpacity 
              style={[styles.categoryPill, activeCategory === 'profesionales' && styles.activeCategoryPill]}
              onPress={() => setActiveCategory('profesionales')}
            >
              <Ionicons name="school-outline" size={16} color={activeCategory === 'profesionales' ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.5)"} />
              <Text style={[styles.categoryText, activeCategory === 'profesionales' && styles.activeCategoryText]}>
                Profesionales
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.categoryPill}
              onPress={() => {
                // Abrir directamente el chat de Senda AI
                handleSendaAIClick();
              }}
            >
              <Ionicons name="sparkles-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.categoryText}>
                Senda AI
              </Text>
              <Ionicons name="arrow-forward" size={12} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.categoryPill, activeCategory === 'grupos' && styles.activeCategoryPill]}
              onPress={() => setActiveCategory('grupos')}
            >
              <Ionicons name="people-outline" size={16} color={activeCategory === 'grupos' ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.5)"} />
              <Text style={[styles.categoryText, activeCategory === 'grupos' && styles.activeCategoryText]}>
                Grupos
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Lista de conversaciones */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner informativo para Profesionales */}
          {activeCategory === 'profesionales' && (
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textoPrincipal} />
              <Text style={styles.infoBannerText}>
                Tienes 1 llamada semanal incluida con cada profesional
              </Text>
            </View>
          )}

          {/* Lista de conversaciones */}
          {conversations.map((chat) => (
            <TouchableOpacity key={`${chat.id}-${chat.name}`} style={styles.chatItem}>
              <View style={styles.avatarContainer}>
                <Ionicons 
                  name={chat.avatarIcon} 
                  size={48} 
                  color={chat.avatarColor}
                />
                {chat.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
                  </View>
                )}
                {/* Indicador de tipo de profesional */}
                {chat.role && (
                  <View style={[styles.roleIndicator, { backgroundColor: getRoleColor(chat.role) }]}>
                    <Ionicons name={getRoleIcon(chat.role)} size={12} color="white" />
                  </View>
                )}
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    {chat.role && (
                      <View style={[styles.roleBadge, { backgroundColor: getRoleColor(chat.role) + '20' }]}>
                        <Text style={[styles.roleText, { color: getRoleColor(chat.role) }]}>
                          {chat.role}
                        </Text>
                      </View>
                    )}
                    {chat.isAI && (
                      <View style={[styles.roleBadge, styles.aiBadge]}>
                        <Text style={styles.aiText}>AI</Text>
                      </View>
                    )}
                    {chat.isGroup && (
                      <Text style={styles.groupMembers}>{chat.members} miembros</Text>
                    )}
                  </View>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                
                <View style={styles.messageRow}>
                  <Text 
                    style={[styles.lastMessage, chat.unread > 0 && styles.unreadMessage]}
                    numberOfLines={1}
                  >
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{chat.unread}</Text>
                    </View>
                  )}
                </View>

                {/* Información de llamada para profesionales */}
                {chat.nextCall && (
                  <View style={styles.callInfo}>
                    <Ionicons 
                      name="calendar-outline" 
                      size={12} 
                      color={chat.hasScheduledCall ? "#4CAF50" : "rgba(255,255,255,0.5)"} 
                    />
                    <Text style={[
                      styles.callInfoText,
                      chat.hasScheduledCall && styles.scheduledCallText
                    ]}>
                      {chat.nextCall}
                    </Text>
                    {renderScheduleButton(chat)}
                  </View>
                )}

                {/* Badge 24/7 para Senda AI */}
                {chat.always24 && (
                  <View style={styles.always24Badge}>
                    <Ionicons name="time-outline" size={12} color="#FFB347" />
                    <Text style={styles.always24Text}>Disponible 24/7</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.azulNaturaleza + '1A',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.textoPrincipal,
  },
  newChatButton: {
    padding: 8,
  },
  categoriesWrapper: {
    paddingBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    maxHeight: 40,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.azulNaturaleza + '1A',
    borderRadius: borderRadius.round,
    marginRight: spacing.sm,
  },
  activeCategoryPill: {
    backgroundColor: colors.azulNaturaleza,
  },
  categoryText: {
    fontSize: typography.sizes.bodySmall,
    fontWeight: typography.weights.semiBold,
    color: colors.textoSecundario,
  },
  activeCategoryText: {
    color: colors.textoPrincipal,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.naranjaCTA + '26', // Mayor opacidad para mejor contraste
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.naranjaCTA + '40',
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.sizes.bodySmall,
    color: colors.textoPrincipal,
    fontWeight: typography.weights.medium,
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0C0A0A',
    borderRadius: 100,
  },
  roleIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  chatName: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.semiBold,
    color: colors.textoPrincipal,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  aiBadge: {
    backgroundColor: 'rgba(255,179,71,0.2)',
  },
  aiText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFB347',
  },
  groupMembers: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  chatTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  unreadMessage: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.naranjaCTA,
    borderRadius: borderRadius.round,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  callInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  callInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
  },
  scheduledCallText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(74,144,226,0.1)',
    borderRadius: 100,
  },
  scheduledButton: {
    backgroundColor: 'rgba(76,175,80,0.1)',
  },
  scheduleButtonText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '600',
  },
  scheduledButtonText: {
    color: '#4CAF50',
  },
  always24Badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  always24Text: {
    fontSize: 11,
    color: '#FFB347',
    fontWeight: '500',
  },
});

export default ChatScreen;