import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Login será la pantalla inicial */}
        <Stack.Screen 
          name="login" 
          options={{ headerShown: false }} 
        />

        {/* Register también sin header */}
        <Stack.Screen 
          name="register" 
          options={{ headerShown: false }} 
        />
         <Stack.Screen 
          name="Planes" 
          options={{ headerShown: false }} 
        />

        {/* Modal opcional */}
        <Stack.Screen 
          name="modal" 
          options={{ presentation: 'modal', title: 'Modal' }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
