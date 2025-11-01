import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import Pricing from "@/components/Pricing";
import RecargasPersonales from "@/components/PricingRecargas";

export default function PlanesScreen() {
  const router = useRouter();

  /**
   * Función para manejar el botón "Volver a Login"
   * Navega a la pantalla de login
   */
  const handleBackToLogin = () => {
    // Navegar a la pantalla de login
    // Ajusta la ruta según tu configuración de navegación
    router.push("/login");
    // O si usas navegación por stack:
    // router.back(); // Para volver atrás
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Recargas",
          headerShown: false 
        }} 
      />
      <RecargasPersonales />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});