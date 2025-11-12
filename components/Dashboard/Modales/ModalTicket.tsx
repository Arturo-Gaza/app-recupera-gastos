import { CALCULAR_PRECIO } from '@/app/services/apiConstans';
import requests from '@/app/services/requests';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  procesarTicket: (ticketId: string) => void;
}

interface CalcularPrecio {
  error: string | number | null;
  factura_numero: string | number | null;
  insuficiente_saldo: boolean;
  monto_a_cobrar: string | number | null;
  saldo_actual: string | number | null;
  saldo_despues: string | number | null;
  tier: string | number | null;
  tipo: string | number | null;
  facturaTotalGratis: string | number | null;
  factura_restante: string | number | null;
}

// Simula la función de la API - reemplaza con tu implementación real
const GetCalcularPrecios = async (ticketId: number) => {
  // Tu implementación real de la API aquí
    try {
        const response = await requests.get({ 
            command: CALCULAR_PRECIO + ticketId
        });
        return response.data;
    } catch (err) {
        return { 
            success: false, 
            data: [], 
            data2: null, 
            message: 'Error al obtener los movimientos' 
        };
    }
};

export function TicketModal({ isOpen, onClose, ticketId, procesarTicket }: TicketModalProps) {
  const [loadData, setLoadData] = useState(false);
  const [calcularprecios, setCalcularPrecio] = useState<CalcularPrecio | null>(null);

  const getMisMovimientos = async () => {
    try {
      setLoadData(true);
      const response = await GetCalcularPrecios(Number(ticketId));
      console.log("calcular precios:", response);

      if (response?.success) {
        setCalcularPrecio(response.data);
      } else {
        Alert.alert("Error", "No se pudo obtener los datos de precios");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al obtener los precios");
    } finally {
      setLoadData(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      getMisMovimientos();
    }
  }, [isOpen, ticketId]);

  // 🔹 Diccionario visual de niveles
  const tierMap = {
    Gratis: { progress: 25, color: "#9ca3af", precio: 0.0 },
    Bronce: { progress: 50, color: "#f59e0b", precio: 199.99 },
    Plata: { progress: 75, color: "#94a3b8", precio: 149.99 },
    Oro: { progress: 100, color: "#facc15", precio: 99.99 },
  };

  const tierInfo =
    calcularprecios?.tier && tierMap[calcularprecios.tier as keyof typeof tierMap]
      ? tierMap[calcularprecios.tier as keyof typeof tierMap]
      : null;

  const handleProcesar = () => {
    if (ticketId) {
      procesarTicket(ticketId);
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Procesar Ticket</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {loadData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando información...</Text>
              </View>
            ) : (
              <View style={styles.content}>
                {calcularprecios && (
                  <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Saldo actual:</Text>{' '}
                      ${Number(calcularprecios.saldo_actual ?? 0).toFixed(2)}
                    </Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Monto a cobrar:</Text>{' '}
                      ${Number(calcularprecios.monto_a_cobrar ?? 0).toFixed(2)}
                    </Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Saldo después:</Text>{' '}
                      ${Number(calcularprecios.saldo_despues ?? 0).toFixed(2)}
                    </Text>
                    <Text style={styles.infoText}>
                      <Text style={styles.bold}>Factura número:</Text>{' '}
                      {calcularprecios.factura_numero || "N/A"}
                    </Text>

                    {calcularprecios.insuficiente_saldo ? (
                      <Text style={styles.errorText}>
                        ⚠️ No tienes saldo suficiente para procesar este ticket.
                      </Text>
                    ) : (
                      <Text style={styles.successText}>
                        ✅ Tienes saldo suficiente para procesar este ticket.
                      </Text>
                    )}

                    {calcularprecios?.tier === "Gratis" && (
                      <View style={styles.freeTierContainer}>
                        <Text style={styles.freeTierText}>
                          💎 Te quedarán{' '}
                          <Text style={styles.freeTierBold}>
                            {calcularprecios?.factura_restante}
                          </Text>{' '}
                          de{' '}
                          <Text style={styles.freeTierBold}>
                            {calcularprecios?.facturaTotalGratis}
                          </Text>{' '}
                          tickets gratuitos disponibles.
                        </Text>

                        {/* Barra de progreso */}
                        <View style={styles.progressBarContainer}>
                          <View 
                            style={[
                              styles.progressBar, 
                              { 
                                width: `${(Number(calcularprecios?.factura_restante) /
                                  Number(calcularprecios?.facturaTotalGratis)) * 100}%`,
                                backgroundColor: '#10b981'
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    )}

                    {/* 🔹 Indicador visual del TIER */}
                    {tierInfo && (
                      <View style={styles.tierContainer}>
                        <Text style={styles.infoText}>
                          <Text style={styles.bold}>Plan actual:</Text> {calcularprecios.tier} —{' '}
                          <Text style={styles.mutedText}>
                            ${tierInfo.precio.toFixed(2)}
                          </Text>
                        </Text>
                        <View style={styles.tierProgressContainer}>
                          <View 
                            style={[
                              styles.tierProgressBar,
                              { 
                                width: `${tierInfo.progress}%`,
                                backgroundColor: tierInfo.color
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    )}

                    {calcularprecios.error && (
                      <Text style={styles.errorText}>
                        <Text style={styles.bold}>Error:</Text> {calcularprecios.error}
                      </Text>
                    )}
                  </View>
                )}

                <Text style={styles.descriptionText}>
                  Revisa los detalles y confirma si deseas enviar este ticket para procesar.
                </Text>

                <View style={styles.buttonsContainer}>
                  <TouchableOpacity 
                    onPress={onClose} 
                    style={[styles.button, styles.cancelButton]}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    disabled={calcularprecios?.insuficiente_saldo}
                    onPress={handleProcesar}
                    style={[
                      styles.button, 
                      styles.confirmButton,
                      calcularprecios?.insuficiente_saldo && styles.disabledButton
                    ]}
                  >
                    <Text style={[styles.buttonText, styles.confirmButtonText]}>
                      Enviar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalContent: {
    maxHeight: 400,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  infoContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  mutedText: {
    color: '#6b7280',
  },
  errorText: {
    color: '#dc2626',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 14,
  },
  successText: {
    color: '#059669',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 14,
  },
  freeTierContainer: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  freeTierText: {
    color: '#065f46',
    fontSize: 14,
    lineHeight: 20,
  },
  freeTierBold: {
    fontWeight: 'bold',
    color: '#065f46',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#d1fae5',
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  tierContainer: {
    marginTop: 16,
  },
  tierProgressContainer: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    height: 12,
    borderRadius: 6,
    marginTop: 8,
    overflow: 'hidden',
  },
  tierProgressBar: {
    height: 12,
    borderRadius: 6,
  },
  descriptionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#3b82f6',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TicketModal;