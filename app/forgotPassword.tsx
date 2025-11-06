import { ForgotPasswordForm } from "@/components/ForgotPassword";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
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
      <ForgotPasswordForm/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});