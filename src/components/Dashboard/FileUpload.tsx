import { SOLICITUD_CREATE } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FileUploadProps {
  userId: number;
  onFilesUploaded: (files: any[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // MB
}

interface PreviewFile {
  file: any;
  preview: string;
  type: 'image' | 'pdf' | 'other';
  name: string;
}

const FileUpload = ({
  userId,
  onFilesUploaded,
  acceptedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  maxFileSize = 10,
}: FileUploadProps) => {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const normalizedAccepted = Array.from(
    new Set([...(acceptedTypes || []), '.jpeg', 'image/jpeg', 'application/pdf'])
  ).map((t) => t.toLowerCase());

  const handleFileValidation = (file: any): boolean => {
    const fileName = file.fileName || file.name || 'sin_nombre';
    const ext = '.' + (fileName.split('.').pop()?.toLowerCase() || '');
    const mime = file.mimeType?.toLowerCase() || file.type?.toLowerCase() || '';

    const isValidType =
      normalizedAccepted.includes(ext) || 
      normalizedAccepted.includes(mime) ||
      (mime.includes('pdf') && normalizedAccepted.includes('.pdf'));

    if (!isValidType) {
      Alert.alert('Error', `Tipo de archivo no permitido: ${fileName}`);
      return false;
    }

    const fileSize = file.fileSize || file.size;
    if (fileSize && fileSize / 1024 / 1024 > maxFileSize) {
      Alert.alert('Error', `Archivo demasiado grande: ${fileName}`);
      return false;
    }

    return true;
  };

  const createPreviewFile = (file: any): PreviewFile => {
    const fileName = file.fileName || file.name || 'sin_nombre';
    const uri = file.uri;
    const mime = file.mimeType || file.type || '';

    let type: 'image' | 'pdf' | 'other' = 'other';
    let preview = uri;

    if (mime.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      type = 'pdf';
      preview = 'pdf-icon';
    } else if (mime.startsWith('image/')) {
      type = 'image';
    }

    return { file, preview, type, name: fileName };
  };

  const prepareFormData = (file: any): FormData => {
    const formData = new FormData();
    formData.append('usuario_id', String(userId));

    const fileExtension = file.name?.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = file.mimeType || file.type || 
      (fileExtension === 'pdf' ? 'application/pdf' : 'image/jpeg');

    const fileName = file.fileName || file.name || 
      (fileExtension === 'pdf' ? `document_${Date.now()}.pdf` : `photo_${Date.now()}.jpg`);

    const fileData = {
      uri: file.uri,
      type: mimeType,
      name: fileName,
    };

    formData.append('imagen', fileData as any);
    return formData;
  };

  const handleFiles = useCallback(
    async (files: any[]) => {
      const validFiles: any[] = [];
      const newPreviews: PreviewFile[] = [];

      for (const file of files) {
        if (handleFileValidation(file)) {
          validFiles.push(file);
          newPreviews.push(createPreviewFile(file));
        }
      }

      if (validFiles.length === 0) return;

      setPreviews((prev) => [...prev, ...newPreviews]);

      try {
        setLoading(true);

        const uploadPromises = validFiles.map(async (file) => {
          const formData = prepareFormData(file);
          if (__DEV__) {
            console.log('Subiendo archivo:', {
              usuario_id: userId,
              imagen: file.name,
              tipo: file.mimeType,
              uri: file.uri,
            });
          }

          return await requests.post({
            command: SOLICITUD_CREATE,
            data: formData,
          });
        });

        await Promise.all(uploadPromises);
        onFilesUploaded(validFiles);
        Alert.alert('Éxito', 'Archivos subidos correctamente');
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          'Error al subir archivos';
        setErrorMessage(errorMsg);
        Alert.alert('Error', errorMsg);
        console.error('Error en handleFiles:', error);
      } finally {
        setLoading(false);
      }
    },
    [userId, normalizedAccepted, maxFileSize, onFilesUploaded]
  );

  // Tomar foto con cámara
  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para usar la cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        let photo = result.assets[0];

        const compressed = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 800 } }], 
          {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );

        const compressedPhoto = {
          ...photo,
          uri: compressed.uri,
          fileName: `photo_${Date.now()}.jpg`,
          mimeType: 'image/jpeg',
        };

        handleFiles([compressedPhoto]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  }, [handleFiles]);

  // Seleccionar desde galería
  const selectFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        handleFiles(result.assets);
      }
    } catch (error) {
      console.log('Error al seleccionar desde galería:', error);
      Alert.alert('Error', 'No se pudieron seleccionar los archivos');
    }
  }, [handleFiles]);

  // Seleccionar documento PDF
  const selectDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets.length > 0) {
        // Mapear los resultados de DocumentPicker al formato esperado
        const files = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType,
          size: asset.size,
          type: 'application/pdf',
        }));

        handleFiles(files);
      }
    } catch (error) {
      console.log('Error al seleccionar documento:', error);
      Alert.alert('Error', 'No se pudo seleccionar el documento');
    }
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAllFiles = () => setPreviews([]);

  const showFileOptions = () => {
    Alert.alert('Seleccionar archivo', 'Elige una opción', [
      { text: 'Tomar foto', onPress: takePhoto },
      { text: 'Galería', onPress: selectFromGallery },
      { text: 'Seleccionar PDF', onPress: selectDocument },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Subiendo archivos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Área principal */}
      <TouchableOpacity style={styles.uploadArea} onPress={showFileOptions} activeOpacity={0.7}>
        <View style={styles.uploadIcon}>
          <Ionicons name="cloud-upload" size={32} color="#007AFF" />
        </View>
        <Text style={styles.uploadTitle}>Toca para subir archivos</Text>
        <Text style={styles.uploadSubtitle}>
          Toma una foto, selecciona desde la galería o sube un PDF
        </Text>
        <Text style={styles.uploadInfo}>
          Tipos aceptados: {acceptedTypes.join(', ')} • Máx {maxFileSize}MB
        </Text>
      </TouchableOpacity>

      {/* Previews */}
      {previews.length > 0 && (
        <View style={styles.previewsSection}>
          <View style={styles.previewsHeader}>
            <Text style={styles.previewsTitle}>
              Archivos seleccionados ({previews.length})
            </Text>
            <TouchableOpacity onPress={removeAllFiles}>
              <Text style={styles.clearAllText}>Limpiar todo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.previewsContainer}>
            {previews.map((preview, index) => (
              <View key={index} style={styles.previewItem}>
                {preview.type === 'image' ? (
                  <Image source={{ uri: preview.preview }} style={styles.previewImage} />
                ) : (
                  <View style={styles.pdfIcon}>
                    <MaterialIcons name="picture-as-pdf" size={24} color="#FF3B30" />
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <Text style={styles.previewName} numberOfLines={1}>
                    {preview.name}
                  </Text>
                  <Text style={styles.previewType}>
                    {preview.type === 'pdf' ? 'PDF' : 'Imagen'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={() => removeFile(index)}>
                  <Ionicons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    margin: 16,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#E3F2FD',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadTitle: { fontSize: 16, fontWeight: '600', color: '#007AFF', marginBottom: 8 },
  uploadSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 8 },
  uploadInfo: { fontSize: 12, color: '#999', textAlign: 'center' },
  previewsSection: { marginHorizontal: 16, marginTop: 8 },
  previewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  previewsTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  clearAllText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  previewsContainer: { maxHeight: 200 },
  previewItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginBottom: 8 },
  previewImage: { width: 40, height: 40, borderRadius: 4 },
  pdfIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewInfo: { flex: 1, marginLeft: 12 },
  previewName: { fontSize: 14, fontWeight: '500', color: '#333' },
  previewType: { fontSize: 12, color: '#666', marginTop: 2 },
  removeButton: { padding: 4 },
});

export default FileUpload;