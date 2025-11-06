import InfoForm from "@/components/usuario/modalDatos";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function DatosAlertScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Completar",
          headerShown: false 
        }} 
      />
      <InfoForm />
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
