import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import AlertaFiscales from "@/components/usuario/AlertaFiscales";

export default function PlanesScreen() {
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
     router.push('/login');
    };


  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "AlertFiscal",
          headerShown: false 
        }} 
      />
      <AlertaFiscales
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
  },
});