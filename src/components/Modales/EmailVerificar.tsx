// EmailVerificationModal.tsx
import { CONFIRMAR_CODE_RECEPTOR } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerificationSuccess: () => void;
  onSuccess: () => void;
}

export default function EmailVerificationModal({
  visible,
  email,
  onClose,
  onVerificationSuccess,
  onSuccess,
}: EmailVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput>>([]);

  // Función para manejar el cambio en los inputs OTP
  const handleOTPChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;

    const newOTP = [...otp];
    newOTP[index] = numericValue;
    setOtp(newOTP);

    // Navegación automática al siguiente campo
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejar tecla backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Función para verificar el código
  const handleVerifyCode = async () => {
    const code = otp.join('');

    if (code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código completo de 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      // Aquí va tu lógica de verificación del código
      console.log('Verificando código:', code, 'para email:', email);
      const response = await requests.post({
        command: CONFIRMAR_CODE_RECEPTOR,
        data: {
          codigo: code,
          email: email
        }
      })

      const result = response.data;

      if (result.success) {
         Alert.alert("Mensaje", result.message);
          onSuccess();
      }

      handleClose();

    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error al verificar el código');
      setLoading(false);
    }
  };

  // Función para reenviar el código
  const handleResendCode = async () => {
    try {
      // Aquí va tu lógica para reenviar el código
      console.log('Reenviando código a:', email);

      Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu correo');
      resetModal();
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', 'Error al reenviar el código');
    }
  };

  // Resetear el modal
  const resetModal = () => {
    setOtp(['', '', '', '', '', '']);
    setLoading(false);
  };

  // Cerrar modal y resetear
  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verificar Correo Electrónico</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <View style={styles.modalContent}>
            <Text style={styles.description}>
              Se ha enviado un código de verificación al correo:
            </Text>
            <Text style={styles.emailHighlight}>{email}</Text>

            {/* Inputs OTP */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Botón reenviar código */}
            <TouchableOpacity
              onPress={handleResendCode}
              style={styles.resendButton}
              disabled={loading}
            >
              <Text style={styles.resendText}>Reenviar código</Text>
            </TouchableOpacity>

            {/* Botones de acción */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (loading || otp.join('').length !== 6) && styles.verifyButtonDisabled
                ]}
                onPress={handleVerifyCode}
                disabled={loading || otp.join('').length !== 6}
              >
                <Text style={styles.verifyButtonText}>
                  {loading ? 'Verificando...' : 'Verificar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailHighlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  otpInputFilled: {
    borderColor: '#3b82f6',
    backgroundColor: 'white',
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  resendText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  verifyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});