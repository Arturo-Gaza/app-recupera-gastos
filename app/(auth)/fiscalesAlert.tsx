import AlertaFiscales from "@/src/components/usuario/AlertaFiscales";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

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
      //router.push("/Completar");
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