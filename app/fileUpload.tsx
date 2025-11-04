import FileUpload from "@/components/usuario/FileUpload";
import { Stack, useRouter } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";

export default function SubirArchivosScreen() {
  const router = useRouter();

  /**
   * Función para manejar los archivos subidos
   */
  const handleFilesUploaded = (data: any) => {
    
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
          headerShown: false
        }} 
      />
      
      <FileUpload
        uploadType="cfdi"
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