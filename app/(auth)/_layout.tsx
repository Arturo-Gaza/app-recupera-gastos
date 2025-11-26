import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Rutas principales */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* Tu pestañas */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Tus dashboards */}
        <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />

        {/* Tus rutas auth */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* Stripe u otros screens */}
        <Stack.Screen name="Planes" options={{ headerShown: false }} />

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
