import RecargasPersonales from "@/src/components/Auth/PricingRecargas";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PlanesScreen() {

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Recargas",
          headerShown: false 
        }} 
      />
      <RecargasPersonales />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});