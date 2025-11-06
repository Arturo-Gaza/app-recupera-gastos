import Pricing from "@/components/Pricing";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PlanesScreen() {

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Planes",
          headerShown: false 
        }} 
      />
      <Pricing />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});