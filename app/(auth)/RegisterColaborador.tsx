
import { Register } from "@/src/components/Usuario Colaborador/RegisterFormColaborador";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function RegisterColaborador() {
      const router = useRouter();
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Colaborador", 
          headerShown: false
        }}
      />

      <Register />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
});