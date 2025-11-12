import PersonalForm from "@/src/components/usuario/DatosUsuario";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

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