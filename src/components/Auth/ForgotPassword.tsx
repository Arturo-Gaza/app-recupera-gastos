import { CAMBIO_PASSWORD, RECUPERAPASS_CORREO, VALIDA_CODIGO } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';


interface ForgotPasswordFormProps {
  onBack?: () => void;
}

type Step = 'method' | 'email' | 'otp' | 'password';
type VerificationMethod = 'email' | 'sms';

// Iconos simples
const MailIcon = () => <Text>📧</Text>;
const PhoneIcon = () => <Text>📞</Text>;
const ArrowLeftIcon = () => <Text>←</Text>;

// Componente Card
const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>{children}</View>
);

// Componente Button
const Button = ({ children, onPress, disabled, style, variant = 'default' }: any) => (
  <TouchableOpacity
    style={[
      styles.button,
      variant === 'ghost' && styles.buttonGhost,
      disabled && styles.buttonDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[
      styles.buttonText,
      variant === 'ghost' && styles.buttonGhostText,
      disabled && styles.buttonDisabledText,
    ]}>
      {children}
    </Text>
  </TouchableOpacity>
);

// Componente PasswordInput MEJORADO
const PasswordInput = ({ value, onChange, placeholder, showValidation = false }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Validación de contraseña (igual que en el componente anterior)
  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    return {
      hasMinLength,
      hasUpperCase,
      hasDigit,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasDigit && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(value);

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <View style={styles.requirementItem}>
      <View style={[
        styles.checkbox,
        met ? styles.checkboxValid : styles.checkboxInvalid
      ]}>
        <Text style={styles.checkmark}>{met ? '✓' : ''}</Text>
      </View>
      <Text style={[
        styles.requirementText,
        met && styles.requirementTextValid
      ]}>
        {text}
      </Text>
    </View>
  );

    const handleBack = () => {
    router.back();
  };

  return (
    <View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.passwordInput,
            value.length > 0 && !passwordValidation.isValid && styles.inputWarning,
            passwordValidation.isValid && styles.inputValid
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color="#666" />
          ) : (
            <Eye size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      {/* Validación de requisitos de contraseña (solo se muestra cuando showValidation es true) */}
      {showValidation && value.length > 0 && !passwordValidation.isValid && (
        <View style={styles.requirementsContainer}>
          <RequirementItem
            met={passwordValidation.hasMinLength}
            text="Mínimo 8 caracteres"
          />
          <RequirementItem
            met={passwordValidation.hasUpperCase}
            text="Al menos una mayúscula"
          />
          <RequirementItem
            met={passwordValidation.hasDigit}
            text="Al menos un dígito"
          />
          <RequirementItem
            met={passwordValidation.hasSpecialChar}
            text="Al menos un carácter especial"
          />
        </View>
      )}
    </View>
  );
};

// Componente InputOTP CORREGIDO
const InputOTP = ({ length = 6, value, onChange }: any) => {
  const inputRefs = useRef<Array<TextInput>>([]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    // Solo permitir números
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText) {
      const newValue = value.split('');
      newValue[index] = numericText;
      const combinedValue = newValue.join('');
      onChange(combinedValue);

      // Auto-focus siguiente input
      if (index < length - 1) {
        focusInput(index + 1);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Si está vacío y presiona backspace, ir al anterior
        focusInput(index - 1);
      }
    }
  };

  // Inicializar el array de referencias
  React.useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  return (
    <View style={styles.otpContainer}>
      {Array.from({ length }, (_, index) => (
        <TextInput
          key={index}
          ref={ref => {
            if (ref) inputRefs.current[index] = ref;
          }}
          style={[
            styles.otpInputIndividual,
            value[index] && styles.otpInputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

// Componente PasswordStrengthIndicator (mantenido para compatibilidad)
const PasswordStrengthIndicator = ({ password }: any) => {
  const getStrength = (pass: string) => {
    if (!pass) return 0;
    
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    
    return strength;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'];
  const strengthColors = ['#ff4444', '#ff8800', '#ffbb33', '#00C851', '#007E33'];

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            {
              width: `${(strength / 4) * 100}%`,
              backgroundColor: strengthColors[strength],
            },
          ]}
        />
      </View>
      <Text style={styles.strengthText}>
        {strengthLabels[strength]}
      </Text>
    </View>
  );
};

// Componente SuccessModal
const SuccessModal = ({ isOpen, onClose, title, message, buttonText }: any) => (
  <Modal visible={isOpen} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <Button onPress={onClose} style={styles.modalButton}>
          {buttonText}
        </Button>
      </View>
    </View>
  </Modal>
);

// Componente ErrorModal
const ErrorModal = ({ isOpen, onClose, message, actions }: any) => (
  <Modal visible={isOpen} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Error</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <View style={styles.modalActions}>
          {actions || (
            <Button onPress={onClose} style={styles.modalButton}>
              Ok
            </Button>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

// Componente LoadingModal
const LoadingModal = ({ isOpen, title, message }: any) => (
  <Modal visible={isOpen} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <ActivityIndicator size="large" color="#1A2A6C" />
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
      </View>
    </View>
  </Modal>
);

// Función toast simplificada
const toast = ({ title, description }: any) => {
  Alert.alert(title, description);
};

export function ForgotPasswordForm({ onBack = () => {} }: ForgotPasswordFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('method');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('email');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modal states
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorActions, setErrorActions] = useState<React.ReactNode>(null);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Función de validación de contraseña (igual que en el componente anterior)
  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    return {
      hasMinLength,
      hasUpperCase,
      hasDigit,
      hasSpecialChar,
      isValid: hasMinLength && hasUpperCase && hasDigit && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // flujo: method -> email -> otp -> password
  const handleMethodSubmit = async () => {
    setLoading(true);
    try {
      setCurrentStep('email');
    } finally {
      setLoading(false);
    }
  };

  // Lógica para validar correo
  const handleEmailSubmit = async () => {
    setCurrentAction("password");
    setLoading(true);

    try {
      const response = await requests.post({
        command: RECUPERAPASS_CORREO,
        data: { email },
      });

      const result = response.data;

      toast({
        title: "Correo enviado",
        description: result?.message || "Revisa tu bandeja de entrada para el código de recuperación",
      });

      setCurrentStep("otp");
    } catch (error: any) {
      console.error("Error al enviar correo:", error);

      setErrorMessage(
        error?.response?.data?.message ||
        error.message ||
        "No se pudo enviar el correo, intenta de nuevo."
      );
      setErrorActions(
        <Button onPress={() => setShowErrorModal(false)} style={styles.modalButton}>
          Ok
        </Button>
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Lógica para validar código
  const handleOtpSubmit = async () => {
    if (!otp) return;

    setCurrentAction("validarCodigo");
    setLoading(true);
    try {
      const response = await requests.post({
        command: VALIDA_CODIGO,
        data: { email, codigo: otp },
      });

      const result = response.data;
      toast({
        title: "Código verificado",
        description: "Ahora puedes establecer tu nueva contraseña",
      });

      setCurrentStep("password");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
        error.message ||
        "Error al verificar el código"
      );
      setErrorActions(
        <Button onPress={() => setShowErrorModal(false)} style={styles.modalButton}>
          Ok
        </Button>
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar la contraseña
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      setShowErrorModal(true);
      return;
    }

    if (!passwordValidation.isValid) {
      setErrorMessage('La contraseña debe cumplir con todos los requisitos de seguridad');
      setShowErrorModal(true);
      return;
    }

    setCurrentAction("cambiarPass");
    setLoading(true);

    try {
      const response = await requests.post({
        command: CAMBIO_PASSWORD,
        data: {
          email: email,
          codigo: otp,
          nuevaPass: newPassword,
        },
      });

      const result = response.data;
      setSuccessMessage(result?.message);
      setShowSuccessModal(true);

      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message ||
        error.message ||
        "No se pudo actualizar la contraseña"
      );
      setErrorActions(
        <Button onPress={() => setShowErrorModal(false)} style={styles.modalButton}>
          Ok
        </Button>
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    toast({
      title: "Código reenviado",
      description: "El código de verificación es: 123456"
    });
  };

  // botón volver (retrocede un paso)
  const handleBack = () => {
    switch (currentStep) {
      case 'email':
        setCurrentStep('method');
        break;
      case 'otp':
        setCurrentStep('email');
        break;
      case 'password':
        setCurrentStep('otp');
        break;
      default:
        router.back();
    }
  };

  const handleLogout = () => {
   router.back();
  };

  // ----- Renders -----
  const renderMethodStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.description}>
        ¿Por qué medio deseas recibir el código de verificación?
      </Text>

      <View style={styles.methodsGrid}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            verificationMethod === 'email' && styles.methodButtonSelected
          ]}
          onPress={() => setVerificationMethod('email')}
        >
          <MailIcon />
          <Text style={styles.methodText}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            verificationMethod === 'sms' && styles.methodButtonSelected
          ]}
          onPress={() => setVerificationMethod('sms')}
        >
          <PhoneIcon />
          <Text style={styles.methodText}>SMS</Text>
        </TouchableOpacity>

      </View>

      <Button 
        onPress={handleMethodSubmit} 
        style={styles.fullWidthButton} 
        disabled={loading}
      >
        {loading ? "Cargando..." : "Continuar"}
      </Button>
    </View>
  );

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
      </View>

      <Button
        onPress={handleEmailSubmit}
        style={[
          styles.fullWidthButton,
          (loading || !email || !validateEmail(email)) && styles.buttonDisabled
        ]}
        disabled={loading || !email || !validateEmail(email)}
      >
        {loading ? "Validando..." : "Enviar código"}
      </Button>
    </View>
  );

  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.otpStepContainer}>
        <Text style={styles.description}>
          Ingresa el código de 6 dígitos enviado a tu {verificationMethod}
        </Text>

        <InputOTP
          length={6}
          value={otp}
          onChange={setOtp}
        />

        <TouchableOpacity onPress={handleResendCode} disabled={loading}>
          <Text style={styles.resendText}>Reenviar código</Text>
        </TouchableOpacity>
      </View>

      <Button
        onPress={handleOtpSubmit}
        style={[
          styles.fullWidthButton,
          (loading || otp.length !== 6) && styles.buttonDisabled
        ]}
        disabled={loading || otp.length !== 6}
      >
        {loading ? "Verificando..." : "Verificar código"}
      </Button>
    </View>
  );

  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nueva contraseña</Text>
        <PasswordInput
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Ingresa tu nueva contraseña"
          showValidation={true}
        />
        {confirmPassword && newPassword !== confirmPassword && (
          <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar nueva contraseña</Text>
        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirma tu nueva contraseña"
          showValidation={false}
        />
      </View>

      <Button
        onPress={handlePasswordChange}
        style={[
          styles.fullWidthButton,
          (loading || !newPassword || !confirmPassword || !passwordValidation.isValid || newPassword !== confirmPassword) && styles.buttonDisabled
        ]}
        disabled={loading || !newPassword || !confirmPassword || !passwordValidation.isValid || newPassword !== confirmPassword}
      >
        {loading ? "Actualizando..." : "Cambiar contraseña"}
      </Button>
    </View>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'method': return 'Método de verificación';
      case 'email': return 'Correo electrónico';
      case 'otp': return 'Código de verificación';
      case 'password': return 'Nueva contraseña';
      default: return 'Recuperar contraseña';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method': return renderMethodStep();
      case 'email': return renderEmailStep();
      case 'otp': return renderOtpStep();
      case 'password': return renderPasswordStep();
      default: return renderMethodStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <View style={[styles.card, styles.transparentCard]}>
                  <Image
                    source={require('@/assets/images/rg-logo.png')}
                    style={[styles.logo, styles.largeLogo]}
                    resizeMode="contain"
                  />
                </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Button variant="ghost" onPress={handleLogout} style={styles.backButton}>
              <ArrowLeftIcon />
            </Button>
            <Text style={styles.title}>{getStepTitle()}</Text>
          </View>
          
          <View style={styles.content}>
            {renderStepContent()}
          </View>
        </Card>
      </ScrollView>

      {/* Modales */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleLogout}
        title="¡Éxito!"
        message={successMessage}
        buttonText="Continuar"
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
        actions={errorActions}
      />

      <LoadingModal
        isOpen={loading}
        title={
          currentAction === "password"
            ? "Enviando correo"
            : currentAction === "validarCodigo"
              ? "Validando Código"
              : currentAction === "cambiarPass"
                ? "Actualizando Contraseña"
                : "Procesando..."
        }
        message={
          currentAction === "password"
            ? "Estamos enviando el correo de verificación..."
            : currentAction === "validarCodigo"
              ? "Validando Código"
              : currentAction === "cambiarPass"
                ? "Cambiando Contraseña"
                : "Procesando..."
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
   
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
     marginTop: -200
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A2A6C',
  },
  content: {
    padding: 16,
  },
  stepContainer: {
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  methodsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    gap: 8,
  },
  methodButtonSelected: {
    borderColor: '#1A2A6C',
    backgroundColor: '#f0f8ff',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  inputWarning: {
    borderColor: '#ef4444',
  },
  inputValid: {
    borderColor: '#22c55e',
  },
  requirementsContainer: {
    marginTop: 8,
    gap: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxValid: {
    borderColor: '#22c55e',
    backgroundColor: '#22c55e',
  },
  checkboxInvalid: {
    borderColor: '#d1d5db',
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 12,
    color: '#6b7280',
  },
  requirementTextValid: {
    color: '#22c55e',
  },
  otpStepContainer: {
    alignItems: 'center',
    gap: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  otpInputIndividual: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  otpInputFilled: {
    borderColor: '#1A2A6C',
    backgroundColor: '#f0f8ff',
  },
  resendText: {
    fontSize: 14,
    color: '#1A2A6C',
    textDecorationLine: 'underline',
  },
  fullWidthButton: {
    width: '100%',
    backgroundColor: '#1A2A6C',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGhostText: {
    color: '#1A2A6C',
  },
  buttonDisabledText: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
  strengthContainer: {
    marginTop: 16,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    minWidth: 80,
    padding: 12,
    backgroundColor: '#1A2A6C',
    borderRadius: 8,
    alignItems: 'center',
  },
   //Estilo para el logo
  transparentCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    marginTop: 120,
    marginLeft: 70
  },

  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
    marginTop: -55
  },

  largeLogo: {
    width: 300 * 0.8, // Más ancho
    height: 150 * 0.8, // Más alto
    marginBottom: 30,
  },
});