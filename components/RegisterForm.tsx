import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

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

    // 👇 Navegación con Expo Router
    const handleBack = () => {
        router.back();
    };

    const handleLoginRedirect = () => {
        router.push('/login');
    };

    const handleRegisterSubmit = () => {
        setCurrentStep('email');
    };

    const handleEmailSubmit = () => {
        const code = otpEmail.join('');
        if (code.length === 6) setCurrentStep('sms');
    };

    const handleSMSSubmit = () => {
        const code = otpSMS.join('');
        if (code.length === 6) setCurrentStep('success');
    };

    const handleResendCode = () => {
        console.log('Código reenviado');
    };

    const handleOTPChange = (value: string, index: number, isEmail: boolean) => {
        if (value.length > 1) return;

        const newOTP = isEmail ? [...otpEmail] : [...otpSMS];
        newOTP[index] = value;

        isEmail ? setOtpEmail(newOTP) : setOtpSMS(newOTP);
    };

    const renderRegisterForm = () => (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
                style={styles.input}
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ingresa tu nombre completo"
                autoCapitalize="words"
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
                style={styles.input}
                value={correo}
                onChangeText={setCorreo}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Teléfono</Text>
            <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="5512345678"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresa tu contraseña"
                secureTextEntry
            />

            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu contraseña"
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegisterSubmit}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? 'Registrando...' : 'Registrar'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLoginRedirect} style={styles.linkButton}>
                <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderOTPInput = (otp: string[], isEmail: boolean) => (
        <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
                <TextInput
                    key={index}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index, isEmail)}
                    keyboardType="number-pad"
                    maxLength={1}
                />
            ))}
        </View>
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
            </View>
        </KeyboardAvoidingView>
    );
}

// 👇 Tus estilos permanecen iguales
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 40,
        marginTop: 50,
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
});
