
import { ForgotPasswordForm } from "@/src/components/Auth/ForgotPassword";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function ForgotPasswordScreen() {


  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Recuperar Contraseña",
          headerShown: false 
        }} 
      />
      <ForgotPasswordForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});