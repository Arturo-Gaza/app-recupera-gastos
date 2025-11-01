import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import PersonalForm from "@/components/usuario/DatosUsuario";

export default function PlanesScreen() {
  const router = useRouter();


  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Datos",
          headerShown: false 
        }} 
      />
      < PersonalForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});