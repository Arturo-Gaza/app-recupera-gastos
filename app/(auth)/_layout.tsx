import { useColorScheme } from "@/src/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Obtén la clave de Stripe desde app.json / app.config.js
  const stripeKey = Constants?.expoConfig?.extra?.stripePublishableKey ?? "";

  return (
    <StripeProvider
      publishableKey={stripeKey}
      merchantIdentifier="merchant.com.recupergastos" // requerido para Apple Pay
      urlScheme="recupergastos" // deep linking para 3D Secure
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(dashboard)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="Planes" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </StripeProvider>
  );
}
