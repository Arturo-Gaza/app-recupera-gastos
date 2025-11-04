import { ForgotPasswordForm } from "@/components/ForgotPassword";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    // Navegar hacia atrás - podría ser al login
    router.back();
    // o específicamente a:
    // router.push("/login");
  };

  const handleSubmitSuccess = () => {
    // Cuando se completa exitosamente el cambio de contraseña
    // Podrías redirigir al login o mostrar un mensaje
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Recuperar Contraseña",
          headerShown: false 
        }} 
      />
      <ForgotPasswordForm
        onBack={handleBack}
        //loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});