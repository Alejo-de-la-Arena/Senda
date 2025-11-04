import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './styles/theme';

export default function App() {
  return (
    <NavigationContainer
      theme={{
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.fondoBaseOscuro,
          text: colors.textoPrincipal,
          border: colors.textoSecundario,
          notification: colors.accent,
        },
      }}
    >
      <StatusBar style="light" backgroundColor={colors.fondoBaseOscuro} />
      <AppNavigator />
    </NavigationContainer>
  );
}