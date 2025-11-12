import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EmailRegisteredModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
}

export const EmailRegisteredModal: React.FC<EmailRegisteredModalProps> = ({
  visible,
  email,
  onClose,
}) => {
  const handleLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleForgotPassword = () => {
    onClose();
    //router.push('/forgot-password');
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          ¡Tu Correo Electrónico Ya Está Registrado!
        </Text>
        
        <Text style={styles.modalMessage}>
          Parece que la dirección <Text style={styles.emailText}>{email}</Text> ya está vinculada a una cuenta existente en nuestro sistema.
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
          >
            <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={handleForgotPassword}
          >
            <Text style={styles.secondaryButtonText}>¿Olvidaste tu Contraseña?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.tertiaryButton]}
            onPress={onClose}
          >
            <Text style={styles.tertiaryButtonText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: SCREEN_WIDTH * 0.9,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#6b7280',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#1A2A6C',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  tertiaryButtonText: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 14,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#1f2937', 
  },
});

export default EmailRegisteredModal;