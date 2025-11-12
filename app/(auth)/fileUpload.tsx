import FileUpload from "@/src/components/usuario/FileUpload";
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function SubirArchivosScreen() {

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Subir Archivos Fiscales",
          headerShown: false
        }} 
      />
      
      <FileUpload/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
});