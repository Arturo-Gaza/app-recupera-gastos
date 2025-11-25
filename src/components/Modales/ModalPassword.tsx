import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ErrorModal = ({ visible, onClose, onForgotPassword }: 
  { visible: boolean; onClose: () => void; onForgotPassword: () => void }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Verifica tus Datos</Text>
          <Text style={styles.message}>
            ¡Algo no coincide! Revisa que tu correo electrónico y contraseña sean correctos. 
            Recuerda que la contraseña distingue entre mayúsculas y minúsculas.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.forgotButton} onPress={onForgotPassword}>
              <Text style={styles.forgotText}>Olvidaste tu Contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.okButton} onPress={onClose}>
              <Text style={styles.okText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  okButton: {
    marginBottom: 12,
  },
  okText: {
    color: '#1A2A6C',
    fontSize: 16,
  },
  forgotButton: {
    backgroundColor: '#1A2A6C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  forgotText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorModal;
