
import { Register } from "@/src/components/Auth/RegisterForm";
import { StyleSheet, View } from "react-native";

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
