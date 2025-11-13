import { SOLICITUD_GET_FACTURA_PDF, SOLICITUD_GET_FACTURA_XML } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ViewInvoiceDocumentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketid: string | null;
}

export default function ViewInvoiceDocumentsModal({
  open,
  onOpenChange,
  ticketid,
}: ViewInvoiceDocumentsModalProps) {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingXml, setLoadingXml] = useState(false);

  // 🔹 Obtener PDF
  const fetchPdfDocument = async (ticketId: string): Promise<string | null> => {
    if (!ticketId) return null;
    setLoadingPdf(true);
    try {
      const response = await requests.get({
        command: SOLICITUD_GET_FACTURA_PDF + ticketId,
      });
      const result = response.data;

      if (result.success && result.data) {
        return result.data;
      } else {
        Alert.alert('Error', 'No se pudo obtener el PDF');
        return null;
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Error al cargar el comprobante fiscal');
      return null;
    } finally {
      setLoadingPdf(false);
    }
  };

  // 🔹 Obtener XML
  const fetchXmlDocument = async (ticketid: string): Promise<string | null> => {
    if (!ticketid) return null;
    setLoadingXml(true);
    try {
      const response = await requests.get({
        command: SOLICITUD_GET_FACTURA_XML + ticketid,
      });
      const result = response.data;

      if (result.success && result.data) {
        return result.data;
      } else {
        Alert.alert('Error', 'No se encontró el XML');
        return null;
      }
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoadingXml(false);
    }
  };

  // 🔹 Descargar y ofrecer opción de guardar
  const downloadAndSaveFile = async (base64Data: string, extension: 'pdf' | 'xml') => {
    try {
      const fileName = `Factura_${ticketid}_${Date.now()}.${extension}`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      // Guardar archivo temporalmente
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('✅ Archivo temporal guardado en:', fileUri);

      // Usar expo-sharing para dar opción de guardar
      await Sharing.shareAsync(fileUri, {
        mimeType: extension === 'pdf' ? 'application/pdf' : 'text/xml',
        dialogTitle: `Guardar ${extension.toUpperCase()}`,
        UTI: extension === 'pdf' ? 'com.adobe.pdf' : 'public.xml'
      });

    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo');
    }
  };

  // 🔹 Descargar PDF
  const handleDownloadPdf = async () => {
    if (!ticketid) {
      Alert.alert('Error', 'No hay ticket seleccionado');
      return;
    }

    setLoadingPdf(true);
    try {
      const data = await fetchPdfDocument(ticketid);
      if (data) {
        await downloadAndSaveFile(data, 'pdf');
      }
    } catch (error) {
      console.error('Error descargando PDF:', error);
      Alert.alert('Error', 'No se pudo descargar el PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  // 🔹 Descargar XML
  const handleDownloadXml = async () => {
    if (!ticketid) {
      Alert.alert('Error', 'No hay ticket seleccionado');
      return;
    }

    setLoadingXml(true);
    try {
      const data = await fetchXmlDocument(ticketid);
      if (data) {
        await downloadAndSaveFile(data, 'xml');
      }
    } catch (error) {
      console.error('Error descargando XML:', error);
      Alert.alert('Error', 'No se pudo descargar el XML');
    } finally {
      setLoadingXml(false);
    }
  };

  if (!open) return null;

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>Factura</Text>
      <Text style={styles.subtitle}>Descarga tus documentos</Text>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.downloadButton, loadingPdf && styles.buttonDisabled]}
          onPress={handleDownloadPdf}
          disabled={loadingPdf}
        >
          {loadingPdf ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="file-download" size={24} color="#fff" />
          )}
          <Text style={styles.downloadText}>
            {loadingPdf ? 'Descargando PDF...' : 'Descargar PDF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.downloadButton, styles.xmlButton, loadingXml && styles.buttonDisabled]}
          onPress={handleDownloadXml}
          disabled={loadingXml}
        >
          {loadingXml ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="file-download" size={24} color="#fff" />
          )}
          <Text style={styles.downloadText}>
            {loadingXml ? 'Descargando XML...' : 'Descargar XML'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Se abrirá un diálogo para guardar el archivo en tu dispositivo
      </Text>

      <TouchableOpacity style={styles.closeButton} onPress={() => onOpenChange(false)}>
        <Text style={styles.closeText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
  },
  xmlButton: {
    backgroundColor: '#3498db',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  downloadText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  note: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: '#95a5a6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 40,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});