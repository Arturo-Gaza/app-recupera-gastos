import { useSession } from '@/src/hooks/useSession';
import { COMPLETAR_HIJO, VALIDAR_CODIGO_SMS, VERIFICAR_TELEFONO } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';

import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import EmailRegisteredModal from '../Modales/AlertModal';


export function Register() {
  const [currentStep, setCurrentStep] = useState<'registrar' | 'email' | 'sms' | 'success'>('registrar');
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState(['', '', '', '', '', '']);
  const [otpSMS, setOtpSMS] = useState(['', '', '', '', '', '']);
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailRegisteredModal, setShowEmailRegisteredModal] = useState(false);
  const { session, loading: sessionLoading, refreshSession } = useSession();
  

  // Refs para los inputs OTP
  const emailInputRefs = useRef<Array<TextInput>>([]);
  const smsInputRefs = useRef<Array<TextInput>>([]);

  const userEmail = session?.CorreoSST;

  console.log("correo del ususario");

  // Función de validación de contraseña
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

  useEffect(() => {
  if (userEmail) {
    setCorreo(userEmail);
  }
}, [userEmail]);

  const countryCodes = [
    { code: '+52', country: 'México', flag: '🇲🇽' },
    { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
    { code: '+34', country: 'España', flag: '🇪🇸' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  ];

  const passwordValidation = validatePassword(password);

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
     router.push('/login');
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };


  const handleSMSSubmit = async () => {
    const code = otpSMS.join('');

    try {
      const response = await requests.post({
        command: VALIDAR_CODIGO_SMS,
        data: {
          phone: telefono,
          codigo: code
        }
      });

      const { data } = response;

      if (data?.success) {
        Alert.alert("Éxito", data.message);
        if (code.length === 6) setCurrentStep('success');
      } else {
        Alert.alert("Error", data?.message);
        return null;
      }

    }
    catch (error: any) {
      console.error("Error:", error);
      Alert.alert("Error", error?.response?.data?.message || "Error inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };



  // FUNCIÓN OTP MEJORADA CON NAVEGACIÓN AUTOMÁTICA
  const handleOTPChange = (value: string, index: number, isEmail: boolean) => {
    // Solo permitir números
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length > 1) return;

    const newOTP = isEmail ? [...otpEmail] : [...otpSMS];
    newOTP[index] = numericValue;

    isEmail ? setOtpEmail(newOTP) : setOtpSMS(newOTP);

    // Navegación automática al siguiente campo
    if (numericValue && index < 5) {
      const refs = isEmail ? emailInputRefs.current : smsInputRefs.current;
      refs[index + 1]?.focus();
    }
  };

  // Manejar tecla backspace para navegación automática hacia atrás
  const handleKeyPress = (e: any, index: number, isEmail: boolean) => {
    if (e.nativeEvent.key === 'Backspace') {
      const currentOTP = isEmail ? otpEmail : otpSMS;

      if (!currentOTP[index] && index > 0) {
        // Si el campo actual está vacío y se presiona backspace, ir al anterior
        const refs = isEmail ? emailInputRefs.current : smsInputRefs.current;
        refs[index - 1]?.focus();
      }
    }
  };

  // Render OTP mejorado con navegación automática
  const renderOTPInput = (otp: string[], isEmail: boolean) => {
    const refs = isEmail ? emailInputRefs : smsInputRefs;

    return (
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              if (ref) refs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(value) => handleOTPChange(value, index, isEmail)}
            onKeyPress={(e) => handleKeyPress(e, index, isEmail)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectTextOnFocus
          />
        ))}
      </View>
    );
  };

  //Funcion de registrar y enviar el correo 
  // ----------------------
  // VALIDACIÓN
  // ----------------------
  const validateForm = () => {
    if (!telefono.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return false;
    }
    if (telefono.length < 10) {
      Alert.alert("Error", "El teléfono debe tener 10 dígitos");
      return false;
    }
    if (!correo.trim()) {
      Alert.alert("Error", "El correo electrónico es obligatorio");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "La contraseña es obligatoria");
      return false;
    }
    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Confirmar contraseña es obligatorio");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }
    if (!passwordValidation.isValid) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe cumplir con todos los requisitos"
      );
      return false;
    }
    return true;
  };

  // ----------------------
  // FUNCIÓN: Enviar Teléfono (SMS)
  // ----------------------
  const sendPhoneVerification = async (telefono: string) => {
    setLoading(true)
    try {
      const phoneResponse = await requests.post({
        command: VERIFICAR_TELEFONO,
        data: { phone: telefono },
      });

      const phoneData = phoneResponse.data;

      if (phoneData?.success) {
        console.log("SMS enviado exitosamente");
        return true;
      } else {
        console.warn("Respuesta inesperada del servidor SMS:", phoneData);
        return false;
      }
    } catch (error: any) {
      console.warn(
        "Error al enviar SMS (continuando flujo):",
        error?.response?.data
      );
      return false; // No detiene flujo
    } finally{
      setLoading(false)
    }
  };

  // ----------------------
  // FUNCIÓN PRINCIPAL
  // ----------------------
  const handleRegisterSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = {
        email: userEmail,
        lada: "52",
        tel: telefono,
        password,
      };

      const userRegister = await requests.post({
        command: COMPLETAR_HIJO,
        data: formData,
      });

      const { data } = userRegister;

      if (data?.success) {

        // ------ TELÉFONO ------
        await sendPhoneVerification(telefono);

        // ------ AVANZAR ------
        Alert.alert(
          "¡Registro Exitoso!",
          "Se ha enviado un código de verificación a tu correo electrónico."
        );

        setCurrentStep("sms");
      } else {
        Alert.alert("Error", data?.message || "Error en el registro");
      }
    } catch (error: any) {
      console.error("Error en el registro:", error);

      const errorMessage = error?.response?.data?.message;

      if (errorMessage?.includes("Correo existente")) {
        setShowEmailRegisteredModal(true);
      } else {
        Alert.alert("Error", errorMessage || "Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleResendSMS = async () => {
    Alert.alert("Código enviado")
    await sendPhoneVerification(telefono);
  };


  //Formulario General
  const renderRegisterForm = () => (

    <ScrollView contentContainerStyle={styles.formContainer}>
      <Text style={styles.label}>
        Teléfono <Text style={styles.required}>*</Text>
      </Text>

      <View style={styles.phoneContainer}>
        <View style={styles.countryCodeContainer}>
          <Picker
            selectedValue={selectedCountryCode}
            onValueChange={setSelectedCountryCode}
            style={styles.picker}
            dropdownIconColor="#666"
          >
            {countryCodes.map((country) => (
              <Picker.Item
                key={country.code}
                label={`${country.flag} ${country.code}`}
                value={country.code}
              />
            ))}
          </Picker>
        </View>

        <TextInput
          style={[styles.phoneInput]}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="5512345678"
          maxLength={10}
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.label}>
        Correo electrónico <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, { color: '#000' }]} // Asegurar color legible
        value={userEmail}
        onChangeText={setCorreo}
        placeholder="correo@ejemplo.com"
        placeholderTextColor="rgba(0, 0, 0, 0.3)"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={false} // Esto desactiva la edición
        selectTextOnFocus={false} // Opcional: evita que se seleccione texto al tocar
      />

      <Text style={styles.label}>
        Contraseña <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.passwordInput,
            password.length > 0 && !passwordValidation.isValid && styles.inputWarning,
            passwordValidation.isValid && styles.inputValid
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="Ingresa tu contraseña"
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          secureTextEntry={!showPassword}
          textContentType="password"  // ← Agregar esto
          autoComplete="password"      // ← Agregar esto
          importantForAutofill="yes"
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

      {/* Validación de requisitos de contraseña */}
      {password.length > 0 && !passwordValidation.isValid && (
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

      <Text style={styles.label}>
        Confirmar contraseña <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.passwordInput,
            confirmPassword.length > 0 && password !== confirmPassword && styles.inputWarning,
            confirmPassword.length > 0 && password === confirmPassword && styles.inputValid
          ]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirma tu contraseña"
          placeholderTextColor="rgba(0, 0, 0, 0.3)"
          secureTextEntry={!showConfirmPassword}
          textContentType="password"  // ← Agregar esto
          autoComplete="password"      // ← Agregar esto
          importantForAutofill="yes"
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color="#666" />
          ) : (
            <Eye size={20} color="#666" />
          )}
        </TouchableOpacity>
      </View>

      {confirmPassword.length > 0 && password !== confirmPassword && (
        <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          (!passwordValidation.isValid || password !== confirmPassword) && styles.buttonDisabled
        ]}
        onPress={handleRegisterSubmit}
        disabled={loading || !passwordValidation.isValid || password !== confirmPassword}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonText}>Registrando...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Registrar</Text>
        )}
      </TouchableOpacity>



      <TouchableOpacity onPress={handleLoginRedirect} style={styles.linkButton}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );


  const renderSMSVerification = () => (
    <View style={styles.formContainer}>
      <Text style={styles.description}>
        Se ha enviado un mensaje SMS con un código de verificación al teléfono
        registrado.
      </Text>

      {renderOTPInput(otpSMS, false)}

      <TouchableOpacity onPress={handleResendSMS} style={styles.linkButton}>
        <Text style={styles.linkText}>Reenviar código</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          (loading || otpSMS.join('').length !== 6) && styles.buttonDisabled,
        ]}
        onPress={handleSMSSubmit}
        disabled={loading || otpSMS.join('').length !== 6}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <CheckCircle size={64} color="#22c55e" />
      <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
      <Text style={styles.description}>
        Tu información ha sido registrada correctamente. Ahora puedes iniciar sesión.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleLoginRedirect}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 'registrar':
        return 'Crear cuenta';
      case 'sms':
        return 'Verificación de número telefónico';
      case 'success':
        return 'Cuenta creada correctamente!!';
      default:
        return 'Crear cuenta';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'registrar':
        return renderRegisterForm();
      case 'sms':
        return renderSMSVerification();
      case 'success':
        return renderSuccess();
      default:
        return renderRegisterForm();
    }
  };

  // Overlay global de loading
    const renderGlobalLoading = () => (
      loading ? (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: 'white', marginTop: 10, fontSize: 16 }}>
            Procesando...
          </Text>
        </View>
      ) : null
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={[styles.card, styles.transparentCard]}>
        <Image
          source={require('@/assets/images/rg-logo.png')}
          style={[styles.logo, styles.largeLogo]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.card}>
        <View style={styles.header}>
          {currentStep !== 'registrar' && currentStep !== 'success' && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color="#3b82f6" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{getStepTitle()}</Text>
        </View>

        {renderStepContent()}

        <EmailRegisteredModal
          visible={showEmailRegisteredModal}
          email={correo}
          onClose={() => setShowEmailRegisteredModal(false)}
        />
      </View>

      {renderGlobalLoading()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: -60,
    margin: 16,
    maxWidth: 400,
    maxHeight: '90%',
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputWarning: {
    borderColor: '#ffa726',
  },
  inputValid: {
    borderColor: '#4caf50',
  },
  button: {
    backgroundColor: "#1A2A6C",
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  highlight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#16a34a',
  },
  // Nuevos estilos para la validación de contraseña
  requirementsContainer: {
    marginTop: 8,
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxValid: {
    borderColor: '#4caf50',
    backgroundColor: '#4caf50',
  },
  checkboxInvalid: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  checkmark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
  },
  requirementTextValid: {
    color: '#4caf50',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -8,
  },
  required: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRequired: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryCodeContainer: {
    minWidth: 115,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    color: 'black'
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 50,
  },

  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    paddingRight: 50,
    color: "#000"
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  //Estilo para el logo
  transparentCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    marginTop: 0,
    marginLeft: 85
  },

  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
  },

  largeLogo: {
    width: 300 * 0.8, // Más ancho
    height: 150 * 0.8, // Más alto
    marginBottom: 30,
  },
});