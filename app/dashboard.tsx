import Dashboard from "@/components/Dashboard/Dashboard";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Dashboard",
          headerShown: false 
        }} 
      />
      <Dashboard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});