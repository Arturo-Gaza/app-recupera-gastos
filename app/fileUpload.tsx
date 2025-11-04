import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import FileUpload from "@/components/usuario/FileUpload"; 

export default function SubirArchivosScreen() {
  const router = useRouter();

  /**
   * Función para manejar los archivos subidos
   */
  const handleFilesUploaded = (data: any) => {
    console.log("Archivos procesados:", data);
    
    // Aquí puedes hacer algo con los datos de los archivos subidos
    // Por ejemplo, guardarlos en un estado, enviarlos a otra API, etc.
    
    // Opcional: Mostrar un mensaje de éxito
    Alert.alert(
      "Éxito",
      `${data.length} archivo(s) procesado(s) correctamente`
    );
  };

  /**
   * Función para manejar el botón "Volver"
   */
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Subir Archivos Fiscales",
          headerShown: true // Puedes cambiarlo a false si no quieres header
        }} 
      />
      
      <FileUpload
        uploadType="cfdi" // o "constancia" según lo que necesites
        onFilesUploaded={handleFilesUploaded}
        acceptedTypes={['.pdf', '.xml', '.zip']}
        maxFileSize={10}
      />
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