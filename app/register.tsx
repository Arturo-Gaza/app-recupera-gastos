import { View, StyleSheet } from "react-native";
import { Register } from "@/components/RegisterForm";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Register />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
