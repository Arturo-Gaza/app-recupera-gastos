import { CARGAR_CSF } from "@/app/services/apiConstans";
import requests from "@/app/services/requests";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router"; // ✅ Importar useRouter
import { FileText, Upload, X } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface FileUploadProps {
  onFilesUploaded: (data: any) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  uploadType: "cfdi" | "constancia";
  redirectTo?: string; // ✅ Nueva prop para la ruta de redirección
}

interface PreviewFile {
  file: any;
  name: string;
  size: number;
  uploading?: boolean;
  uri?: string;
}

const FileUpload = ({
  onFilesUploaded,
  acceptedTypes = [".pdf", ".xml", ".zip"],
  maxFileSize = 10,
  uploadType,
  redirectTo = "/form-datos-fiscales", // ✅ Ruta por defecto
}: FileUploadProps) => {
  const router = useRouter(); // ✅ Usar el hook de router
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const getUploadTitle = () =>
    uploadType === "cfdi"
      ? "Subir Cédula de Identificación Fiscal (CIF)"
      : "Subir Constancia de Situación Fiscal (CSF)";

  const getAcceptedTypesText = () =>
    uploadType === "cfdi"
      ? "Tipos aceptados: XML, PDF • Máximo"
      : "Tipos aceptados: PDF • Máximo";

  // ✅ Detecta el tipo MIME
  const getMimeType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "xml":
        return "application/xml";
      case "zip":
        return "application/zip";
      default:
        return "application/octet-stream";
    }
  };

  // ✅ Convierte URI blob:// a File en web o deja tal cual en móvil
  async function getFileObject(preview: PreviewFile, mimeType: string) {
    if (Platform.OS === "web" && preview.uri?.startsWith("blob:")) {
      const response = await fetch(preview.uri);
      const blob = await response.blob();
      return new File([blob], preview.name, { type: mimeType });
    }

    return {
      uri: preview.uri,
      name: preview.name,
      type: mimeType,
    } as any;
  }

  // ✅ Manejo de archivos seleccionados
  const handleFiles = useCallback(
    async (files: any[]) => {
      const newPreviews: PreviewFile[] = [];

      // Validar tipos y tamaños
      for (const file of files) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        const isValidType = acceptedTypes.includes(ext);

        if (!isValidType) {
          Alert.alert("Error", `Tipo de archivo no permitido: ${file.name}`);
          continue;
        }

        if (file.size / 1024 / 1024 > maxFileSize) {
          Alert.alert("Error", `Archivo demasiado grande: ${file.name}`);
          continue;
        }

        newPreviews.push({
          file,
          name: file.name,
          size: file.size,
          uploading: true,
          uri: file.uri,
        });
      }

      if (newPreviews.length === 0) return;

      setPreviews((prev) => [...prev, ...newPreviews]);
      setIsUploading(true);

      try {
        const allResults: any[] = [];

        for (const preview of newPreviews) {
          try {
            const formData = new FormData();
            const mimeType = getMimeType(preview.name);
            const fileObj = await getFileObject(preview, mimeType);

            formData.append("archivo", fileObj);

            console.log("📤 Subiendo:", preview.name);
            console.log("🧾 Tipo MIME:", mimeType);

            // Depuración opcional
            for (const [key, value] of formData.entries()) {
              console.log("FormData:", key, value);
            }

            const response = await requests.post({
              command: CARGAR_CSF,
              data: formData,
            });

            console.log("✅ Respuesta API:", response.data);

            if (response.data?.success) {
              allResults.push(response.data);
            } else {
              throw new Error(
                response.data?.message || "Error en la respuesta del servidor"
              );
            }
          } catch (error: any) {
            console.error("❌ Error en la carga:", error);

            let errorMessage = `Error al subir ${preview.name}`;
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            Alert.alert("Error", errorMessage);
            setPreviews((prev) =>
              prev.filter((p) => p.name !== preview.name)
            );
          }
        }

        // Actualiza vista
        setPreviews((prev) =>
          prev.map((p) => ({
            ...p,
            uploading: false,
          }))
        );

        if (allResults.length > 0) {
          onFilesUploaded(allResults);
          
          // ✅ Redirección automática con router.push
          Alert.alert(
            "Éxito",
            `${allResults.length} archivo(s) subido(s) correctamente. Redirigiendo al formulario...`
          );

          // ✅ Navegar automáticamente después de 1.5 segundos
          setTimeout(() => {
            router.push('/FormDatosFiscalesScreen');
          }, 1500);
        }
      } catch (error) {
        console.error("❌ Error general:", error);
        Alert.alert("Error", "Error al procesar los archivos");
      } finally {
        setIsUploading(false);
      }
    },
    [acceptedTypes, maxFileSize, onFilesUploaded, router, redirectTo] // ✅ Agregar router y redirectTo a las dependencias
  );

  // ✅ Selección de archivo
  const handleFilePick = async () => {
    if (isUploading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/xml",
          "application/zip",
          "text/xml",
        ],
        multiple: true,
      });

      if (result.canceled) return;

      const files = result.assets.map((asset) => ({
        name: asset.name || "archivo",
        size: asset.size || 0,
        uri: asset.uri,
        mimeType: asset.mimeType || getMimeType(asset.name || ""),
      }));

      await handleFiles(files);
    } catch (error) {
      console.error("❌ Error al seleccionar archivo:", error);
      Alert.alert("Error", "No se pudo seleccionar el archivo");
    }
  };

  const removeFile = (fileToRemove: PreviewFile) => {
    setPreviews((prev) => prev.filter((p) => p.name !== fileToRemove.name));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getUploadTitle()}</Text>

      <TouchableOpacity
        style={[styles.uploadArea, isUploading && styles.uploadAreaDisabled]}
        onPress={handleFilePick}
        disabled={isUploading}
      >
        <View style={styles.uploadIcon}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#1A2A6C" />
          ) : (
            <Upload size={24} color="#1A2A6C" />
          )}
        </View>

        <Text style={styles.uploadTitle}>
          {isUploading ? "Subiendo archivos..." : "Toca para seleccionar archivos"}
        </Text>
        <Text style={styles.uploadSubtitle}>
          {isUploading ? "Por favor espera..." : "Selecciona archivos desde tu dispositivo"}
        </Text>
        <Text style={styles.uploadInfo}>
          {getAcceptedTypesText()} {maxFileSize}MB por archivo
        </Text>
      </TouchableOpacity>

      {previews.length > 0 && (
        <View style={styles.previewsContainer}>
          <Text style={styles.previewsTitle}>Archivos seleccionados:</Text>
          <ScrollView style={styles.previewsList}>
            {previews.map((preview, index) => (
              <View key={index} style={styles.previewItem}>
                <View style={styles.previewInfo}>
                  <View style={styles.fileIcon}>
                    {preview.uploading ? (
                      <ActivityIndicator size="small" color="#1A2A6C" />
                    ) : (
                      <FileText size={16} color="#1A2A6C" />
                    )}
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{preview.name}</Text>
                    <Text style={styles.fileSize}>
                      {(preview.size / 1024 / 1024).toFixed(2)} MB
                      {preview.uploading && " - Subiendo..."}
                    </Text>
                  </View>
                </View>
                {!preview.uploading && (
                  <TouchableOpacity
                    onPress={() => removeFile(preview)}
                    style={styles.removeButton}
                  >
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 16 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A2A6C",
    marginBottom: 8,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  uploadAreaDisabled: { opacity: 0.6 },
  uploadIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6FF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
    textAlign: "center",
  },
  uploadSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    textAlign: "center",
  },
  uploadInfo: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  previewsContainer: { gap: 8 },
  previewsTitle: { fontSize: 14, fontWeight: "500", color: "#111827" },
  previewsList: { maxHeight: 200 },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  previewInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  fileIcon: {
    width: 32,
    height: 32,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fileDetails: { flex: 1 },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  fileSize: { fontSize: 12, color: "#6B7280" },
  removeButton: { padding: 4 },
});

export default FileUpload;