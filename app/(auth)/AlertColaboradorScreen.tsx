import StepInfoModal from "@/src/components/Usuario Colaborador/AlertaColaborador";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function DatosAlertScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Información",
          presentation: "modal",  
          headerShown: false
        }}
      />

      <StepInfoModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.55)", 
    justifyContent: "center",
    alignItems: "center",
  },
});
