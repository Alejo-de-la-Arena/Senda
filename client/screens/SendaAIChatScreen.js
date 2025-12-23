import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';

const SendaAIChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy Senda AI, tu asistente personal de bienestar. ¿En qué puedo ayudarte hoy?',
      sender: 'ai',
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const scrollViewRef = useRef();

  const quickOptions = [
    { id: 1, text: '💪 Plan de ejercicio', query: 'Quiero un plan de ejercicio personalizado' },
    { id: 2, text: '🥗 Consejos nutrición', query: 'Dame consejos de nutrición saludable' },
    { id: 3, text: '🧘 Técnicas relajación', query: 'Enséñame técnicas de relajación' },
    { id: 4, text: '📊 Mi progreso', query: 'Muéstrame mi progreso semanal' },
  ];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...messages, newMessage]);
      setMessage('');

      // Simular respuesta de AI después de 1 segundo
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          text: getAIResponse(message),
          sender: 'ai',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrenar')) {
      return 'Basándome en tu perfil, te recomiendo empezar con 3 días de entrenamiento a la semana:\n\n• Lunes: HIIT (20 min)\n• Miércoles: Fuerza (30 min)\n• Viernes: Yoga recuperativo (25 min)\n\n¿Te gustaría que detalle alguna rutina específica?';
    } else if (lowerMessage.includes('nutrición') || lowerMessage.includes('comida') || lowerMessage.includes('dieta')) {
      return 'Para optimizar tu nutrición, te sugiero:\n\n• Desayuno: Avena con proteína y frutas\n• Almuerzo: Proteína magra + carbohidratos complejos\n• Cena: Ensalada abundante con proteína\n\nRecuerda mantener una hidratación de 2-3L de agua al día. ¿Necesitas un plan más detallado?';
    } else if (lowerMessage.includes('progreso') || lowerMessage.includes('estadística')) {
      return 'Tu progreso esta semana:\n\n📈 Rituales completados: 85%\n🔥 Racha actual: 5 días\n💪 Entrenamientos: 3/3 completados\n🥗 Adherencia nutricional: 90%\n\n¡Excelente trabajo! Estás en camino de cumplir todos tus objetivos.';
    } else if (lowerMessage.includes('dormir') || lowerMessage.includes('sueño') || lowerMessage.includes('descanso')) {
      return 'El descanso es fundamental. Te recomiendo:\n\n• Dormir 7-9 horas diarias\n• Evitar pantallas 1h antes de dormir\n• Mantener horarios regulares\n• Hacer la respiración 4-7-8 antes de acostarte\n\n¿Tienes problemas específicos con el sueño?';
    } else {
      return 'Entiendo tu consulta. Puedo ayudarte con planes de ejercicio, nutrición, técnicas de respiración, seguimiento de progreso y mucho más. ¿Qué área te gustaría explorar primero?';
    }
  };

  const handleQuickOption = (option) => {
    setMessage(option.query);
    sendMessage();
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    const keyboardDidShowListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true))
      : Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    
    const keyboardDidHideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.96)" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>Senda AI</Text>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Siempre activo</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="rgba(255,255,255,0.96)" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.contentArea}>
            {/* Messages */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  style={[
                    styles.messageWrapper,
                    msg.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper
                  ]}
                >
                  {msg.sender === 'ai' && (
                    <View style={styles.aiAvatar}>
                      <Ionicons name="sparkles" size={20} color="#FFB347" />
                    </View>
                  )}
                  <View style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.userMessage : styles.aiMessage
                  ]}>
                    <Text style={[
                      styles.messageText,
                      msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText
                    ]}>
                      {msg.text}
                    </Text>
                    <Text style={styles.messageTime}>{msg.time}</Text>
                  </View>
                </View>
              ))}

              {/* Quick Options */}
              {messages.length === 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickOptionsContent}
                >
                  {quickOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.quickOption}
                      onPress={() => {
                        setMessage(option.query);
                        setTimeout(() => sendMessage(), 100);
                      }}
                    >
                      <Text style={styles.quickOptionText}>{option.text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </ScrollView>

            {/* Input */}
            <View style={[
              styles.inputContainer, 
              { 
                paddingBottom: keyboardVisible ? 8 : 80,
                marginBottom: keyboardVisible ? 0 : insets.bottom
              }
            ]}>
              <View style={styles.inputWrapper}>
                <TouchableOpacity style={styles.attachButton}>
                  <Ionicons name="add-circle-outline" size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  multiline
                  maxHeight={100}
                  returnKeyType="send"
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, message.trim() && styles.sendButtonActive]}
                  onPress={sendMessage}
                  disabled={!message.trim()}
                >
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={message.trim() ? "#FFB347" : "rgba(255,255,255,0.4)"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.h5,
    fontWeight: typography.weights.bold,
    color: colors.textoPrincipal,
    marginBottom: 2,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  menuButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 12,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,179,71,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  userMessage: {
    backgroundColor: colors.naranjaCTA,
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: colors.azulNaturaleza + '33',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: colors.textoPrincipal,
  },
  aiMessageText: {
    color: 'rgba(255,255,255,0.9)',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  quickOptionsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickOption: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    marginRight: 8,
  },
  quickOptionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.azulNaturaleza + '1A',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.body,
    color: colors.textoPrincipal,
    maxHeight: 100,
    minHeight: 20,
    lineHeight: 20,
  },
  attachButton: {
    padding: 2,
  },
  sendButton: {
    padding: 4,
  },
  sendButtonActive: {
    transform: [{ scale: 1.1 }],
  },
});

export default SendaAIChatScreen;