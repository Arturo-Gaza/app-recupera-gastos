import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import InfoForm from "@/components/usuario/modalDatos";

export default function DatosAlertScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      //router.push("/DatosPersonales");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => {
    //router.push("/Completar");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Completar",
          headerShown: false 
        }} 
      />
      <InfoForm 
        onSubmit={handleSubmit}
        //onLater={handleLater}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});