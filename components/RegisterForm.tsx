import { ENVIARCORREOCONF, REGISTER, VALIDARCORREOCONF } from '@/app/services/apiConstans';
import requests from '@/app/services/requests';
import { styles } from '@/app/styles/RegisterStyles';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { EmailRegisteredModal } from './modales/AlertModal';

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

  // Refs para los inputs OTP
  const emailInputRefs = useRef<Array<TextInput>>([]);
  const smsInputRefs = useRef<Array<TextInput>>([]);

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
    router.back();
  };

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  const handleEmailSubmit = async () => {
    const code = otpEmail.join('');
    try {
      const response = await requests.post({
        command: VALIDARCORREOCONF,
        data: {
          email: correo,
          codigo: code
        }
      });

      const { data } = response;

      if (data?.success) {
        Alert.alert("Éxito", data.message);
        // Lógica de éxito
        if (code.length === 6) setCurrentStep('sms');
        return data;
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

  const handleSMSSubmit = () => {
    const code = otpSMS.join('');
    if (code.length === 6) setCurrentStep('success');
  };

  const handleResendCode = () => {
    console.log('Código reenviado');
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
  const handleRegisterSubmit = async () => {
    // --- Validaciones ---
    if (!telefono.trim()) {
      Alert.alert("Error", "El teléfono es obligatorio");
      return;
    }
    if (telefono.length < 10) {
      Alert.alert("Error", "El teléfono debe tener 10 dígitos");
      return;
    }
    if (!correo.trim()) {
      Alert.alert("Error", "El correo electrónico es obligatorio");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "La contraseña es obligatoria");
      return;
    }
    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Confirmar contraseña es obligatorio");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (!passwordValidation.isValid) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe cumplir con todos los requisitos"
      );
      return;
    }

    setLoading(true);

    // --- Registro del usuario ---
    try {
      let formData = {
        "email": correo,
        "tel": telefono,
        "password": password
      };

      const userRegister = await requests.post({
        command: REGISTER,
        data: formData,
      });

      const { data } = userRegister;

      if (data?.success) {
        try {
          const emailResponse = await requests.post({
            command: ENVIARCORREOCONF,
            data: { email: correo },
          });

          const emailData = emailResponse.data;

          if (emailData?.success) {
            Alert.alert("¡Éxito!", emailData.message);
            setCurrentStep("email");
          } else {
            Alert.alert("Error", emailData?.message || "Error al enviar correo");
          }
        } catch (emailError: any) {
          console.error("Error al enviar correo:", emailError);
          Alert.alert("Error", "Error al enviar el correo de confirmación");
        }
      } else {
        Alert.alert("Error", data?.message || "Error en el registro");
      }
    } catch (error: any) {
      console.error("Error en el registro:", error);

      const errorMessage = error?.response?.data?.message;

      // Mostrar modal personalizado para correo ya registrado
      if (errorMessage?.includes("Correo existente")) {
        setShowEmailRegisteredModal(true);
      } else {
        Alert.alert("Error", errorMessage || "Error de conexión");
      }
    } finally {
      setLoading(false);
    }
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
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        placeholder="correo@ejemplo.com"
        placeholderTextColor="rgba(0, 0, 0, 0.3)"
        keyboardType="email-address"
        autoCapitalize="none"
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
        <Text style={styles.buttonText}>
          {loading ? "Registrando..." : "Registrar"}
        </Text>
      </TouchableOpacity>


      <TouchableOpacity onPress={handleLoginRedirect} style={styles.linkButton}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderEmailVerification = () => (
    <View style={styles.formContainer}>
      <Text style={styles.description}>
        Se ha enviado un código de verificación al correo:{' '}
        <Text style={styles.highlight}>{correo}</Text>
      </Text>

      {renderOTPInput(otpEmail, true)}

      <TouchableOpacity onPress={handleResendCode} style={styles.linkButton}>
        <Text style={styles.linkText}>Reenviar código</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          (loading || otpEmail.join('').length !== 6) && styles.buttonDisabled,
        ]}
        onPress={handleEmailSubmit}
        disabled={loading || otpEmail.join('').length !== 6}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verificando...' : 'Verificar código'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSMSVerification = () => (
    <View style={styles.formContainer}>
      <Text style={styles.description}>
        Se ha enviado un mensaje SMS con un código de verificación al teléfono
        registrado.
      </Text>

      {renderOTPInput(otpSMS, false)}

      <TouchableOpacity onPress={handleResendCode} style={styles.linkButton}>
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
      case 'email':
        return 'Verificación de correo electrónico';
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
      case 'email':
        return renderEmailVerification();
      case 'sms':
        return renderSMSVerification();
      case 'success':
        return renderSuccess();
      default:
        return renderRegisterForm();
    }
  };

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
    </KeyboardAvoidingView>
  );
}