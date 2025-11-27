import { useSession } from '@/src/hooks/useSession';
import {
    BLOCKEAR_CUENTA,
    CAMBIO_PASSWORD,
    RECUPERAPASS_CORREO,
    VALIDA_CODIGO,
    VALIDAR_CODIGO_INHABILITAR,
    VALIDAR_CORREO_INHABILITAR
} from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { ArrowLeftIcon, Eye, EyeOff, Lock, Slash, Trash2, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AccountManagementProps {
    activeSubSection: string;
    onBack: () => void;
}

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

// Componente InputOTP
const InputOTP = ({ length = 6, value, onChange }: any) => {
    const inputRefs = useRef<Array<TextInput>>([]);

    const focusInput = (index: number) => {
        inputRefs.current[index]?.focus();
    };

    const handleChange = (text: string, index: number) => {
        const numericText = text.replace(/[^0-9]/g, '');

        if (numericText) {
            const newValue = value.split('');
            newValue[index] = numericText;
            const combinedValue = newValue.join('');
            onChange(combinedValue);

            if (index < length - 1) {
                focusInput(index + 1);
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (!value[index] && index > 0) {
                focusInput(index - 1);
            }
        }
    };

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

// Componente PasswordInput
const PasswordInput = ({ value, onChange, placeholder }: any) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.passwordContainer}>
            <TextInput
                style={styles.passwordInput}
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

export function AccountManagement({ activeSubSection, onBack }: AccountManagementProps) {
    const { session } = useSession();
    const userEmail = session?.CorreoSST;
    const userPhone =session?.TelefonoSST;

    const [internalSubSection, setInternalSubSection] = useState(activeSubSection);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentAction, setCurrentAction] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // =================== Funciones ===================
    const handleChangeSubSection = (section: string) => setInternalSubSection(section);

    const handleEnvCorreo = async (action: string) => {
        setCurrentAction(action);
        setOtpCode('');
        setLoading(true);
        setShowOtpModal(true);
        setLoading(false);
        try {
            await requests.post({ command: RECUPERAPASS_CORREO, data: { email: userEmail } });
            setShowOtpModal(true);
        } catch { } finally { setLoading(false); }
    };

    const handleStartBlock = async () => {
        setCurrentAction('block');
        setOtpCode('');
        setLoading(true);
        try {
            await requests.post({ command: VALIDAR_CORREO_INHABILITAR, data: { email: userEmail } });
            setShowOtpModal(true);
        } catch { } finally { setLoading(false); }
    };

    const handleValidarCodigo = async () => {
        if (!otpCode) { setErrorMessage("Debes ingresar el código"); setShowErrorModal(true); return; }
        setLoading(true);
        try {
            await requests.post({
                command: currentAction === 'block' ? VALIDAR_CODIGO_INHABILITAR : VALIDA_CODIGO,
                data: { email: userEmail, codigo: otpCode }
            });
            setShowOtpModal(false);
            if (currentAction === "password") setShowPasswordModal(true);
            if (currentAction === "block") setShowBlockModal(true);
            if (currentAction === "delete") setShowDeleteModal(true);
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message || "Error al verificar el código");
            setShowErrorModal(true);
        } finally { setLoading(false); }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) { setErrorMessage('Contraseñas no coinciden'); setShowErrorModal(true); return; }
        if (newPassword.length < 8) { setErrorMessage('La contraseña debe tener al menos 8 caracteres'); setShowErrorModal(true); return; }
        setLoading(true);
        try {
            await requests.post({ command: CAMBIO_PASSWORD, data: { email: userEmail, codigo: otpCode, nuevaPass: newPassword } });
            setSuccessMessage("Contraseña actualizada");
            setShowSuccessModal(true);
            setNewPassword(''); setConfirmPassword('');
        } catch {
            setErrorMessage("No se pudo actualizar la contraseña");
            setShowErrorModal(true);
        } finally {
            setLoading(false);
            setShowPasswordModal(false);
        }
    };

    const handleBlockConfirm = () => { setShowBlockModal(false); setShowBlockConfirmModal(true); }
    const handleBlockAccount = async () => {
        setLoading(true);
        try {
            await requests.post({ command: BLOCKEAR_CUENTA, data: { email: userEmail, codigo: otpCode } });
            setSuccessMessage("Cuenta bloqueada");
            setShowSuccessModal(true);
        } catch { setErrorMessage("Error al bloquear la cuenta"); setShowErrorModal(true); } finally { setLoading(false); }
    };

    const handleSendDelete = async () => { setCurrentAction('delete'); setOtpCode(''); setShowOtpModal(true); }
    const handleDeleteAccount = async () => { setSuccessMessage("Cuenta eliminada"); setShowSuccessModal(true); }

    // =================== Secciones ===================
    const renderSection = (title: string, subtitle: string, description: string, action: () => void, buttonColor?: string) => (
        <View style={styles.section}>
            <Text style={styles.title}>{title}</Text>
            <Card style={styles.sectionCard}>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <Text style={styles.description}>{description}</Text>
                <Button
                    onPress={action}
                    style={buttonColor ? { backgroundColor: buttonColor } : {}}
                    disabled={loading}
                >
                    Enviar código por correo
                </Button>
            </Card>
        </View>
    );

    const renderPasswordSection = () => renderSection(
        'Cambiar mi contraseña',
        'Verificación requerida',
        'Necesitamos verificar tu identidad mediante un código enviado a tu correo.',
        () => handleEnvCorreo('password')
    );

    const renderBlockSection = () => renderSection(
        'Bloquear mi cuenta',
        'Verificación requerida',
        'Antes de bloquear tu cuenta necesitamos confirmar tu identidad con un código enviado a tu correo.',
        handleStartBlock,
        '#FFC107'
    );

    const renderDeleteSection = () => renderSection(
        'Dar de baja mi cuenta',
        'Verificación requerida',
        'Antes de eliminar tu cuenta necesitamos confirmar tu identidad con un código enviado a tu correo.',
        handleSendDelete,
        '#DC3545'
    );
    const renderEditSection = () => (
        <View style={styles.section}>
            <Text style={styles.title}>Modificar mi cuenta</Text>
            <Card style={styles.sectionCard}>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Correo Electrónico</Text>
                    <TextInput
                        style={styles.passwordInput}
                        // value={editEmail}
                        // onChangeText={setEditEmail}
                        placeholder={userEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        editable={false}
                    />
                </View>

                <TouchableOpacity style={styles.buttonChange}
                    // onPress={handlePrepareEmailChange}
                    disabled={loading}
                >
                    <Text style={styles.textChange}>Cambiar</Text>
                </TouchableOpacity>
            </Card>

            <Card style={styles.sectionCard}>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                        style={styles.passwordInput}
                        // value={editEmail}
                        // onChangeText={setEditEmail}
                        placeholder={userPhone}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholderTextColor="rgba(0,0,0,0.3)"
                        editable={false}
                    />
                </View>

                <TouchableOpacity style={styles.buttonChange}
                    // onPress={handlePrepareEmailChange}
                    disabled={loading}
                >
                    <Text style={styles.textChange}>Cambiar</Text>
                </TouchableOpacity>
            </Card>
        </View>
    );


    // =================== SubTabs con íconos ===================
    const AccountSubTabs = () => {
        const tabs = [
            { key: '/account/password', label: 'Contraseña', color: '#007bff', icon: <Lock size={16} color="#fff" /> },
            { key: '/account/block', label: 'Bloquear', color: '#FFC107', icon: <Slash size={16} color="#fff" /> },
            { key: '/account/delete', label: 'Eliminar', color: '#DC3545', icon: <Trash2 size={16} color="#fff" /> },
            { key: '/account/edit', label: 'Modificar', color: '#045f10ff', icon: <User size={16} color="#fff" /> },

        ];

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
                {tabs.map(tab => {
                    const isActive = internalSubSection === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                isActive && { backgroundColor: tab.color }
                            ]}
                            onPress={() => handleChangeSubSection(tab.key)}
                        >
                            {isActive && tab.icon}
                            <Text style={[
                                styles.tabText,
                                isActive && styles.tabTextActive
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    };

    // =================== Render Principal ===================
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <AccountSubTabs />

                {internalSubSection === '/account/password' && renderPasswordSection()}
                {internalSubSection === '/account/block' && renderBlockSection()}
                {internalSubSection === '/account/delete' && renderDeleteSection()}
                {internalSubSection === '/account/edit' && renderEditSection()}


                {/* OTP Modal con nuevo estilo */}
                <Modal visible={showOtpModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Button
                                variant="ghost"
                                onPress={() => setShowOtpModal(false)}
                                style={styles.atrasActionButton}
                            >
                                <ArrowLeftIcon />
                            </Button>
                            <Text style={styles.modalTitle}>Código de verificación</Text>

                            <Text style={styles.modalDescription}>
                                Ingresa el código de 6 dígitos enviado a tu correo
                            </Text>

                            <InputOTP
                                length={6}
                                value={otpCode}
                                onChange={setOtpCode}
                            />

                            <View style={styles.otpActions}>

                                <Button
                                    variant="ghost"
                                    onPress={() => {
                                        if (currentAction === 'password') handleEnvCorreo('password');
                                        else if (currentAction === 'block') handleStartBlock();
                                        else handleSendDelete();
                                    }}
                                    style={styles.otpActionButton}
                                >
                                    Reenviar código
                                </Button>
                            </View>

                            <Button
                                onPress={handleValidarCodigo}
                                style={[
                                    styles.fullWidthButton,
                                    (loading || otpCode.length !== 6) && styles.buttonDisabled
                                ]}
                                disabled={loading || otpCode.length !== 6}
                            >
                                {loading ? "Verificando..." : "Verificar código"}
                            </Button>
                        </View>
                    </View>
                </Modal>

                {/* Password Modal */}
                <Modal visible={showPasswordModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Nueva Contraseña</Text>
                            <Text style={styles.modalDescription}>
                                Ingresa tu nueva contraseña
                            </Text>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Nueva contraseña</Text>
                                <PasswordInput
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    placeholder="Ingresa tu nueva contraseña"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Confirmar contraseña</Text>
                                <PasswordInput
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    placeholder="Confirma tu nueva contraseña"
                                />
                            </View>

                            <View style={styles.modalActions}>
                                <Button
                                    variant="ghost"
                                    onPress={() => setShowPasswordModal(false)}
                                    style={styles.modalActionButton}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onPress={handlePasswordChange}
                                    style={styles.modalActionButton}
                                    disabled={loading || !newPassword || !confirmPassword}
                                >
                                    {loading ? "Actualizando..." : "Cambiar contraseña"}
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Block Confirmation Modal */}
                <Modal visible={showBlockModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Confirmar Bloqueo</Text>
                            <Text style={styles.modalDescription}>
                                ¿Estás seguro de que deseas bloquear tu cuenta? Esta acción es reversible contactando al soporte.
                            </Text>
                            <View style={styles.modalActions}>
                                <Button
                                    variant="ghost"
                                    onPress={() => setShowBlockModal(false)}
                                    style={styles.modalActionButton}
                                >
                                    Cancelar

                                </Button>
                                <Button
                                    onPress={handleBlockConfirm}
                                    style={[styles.modalActionButton, { backgroundColor: '#FFC107' }]}
                                >
                                    Confirmar Bloqueo
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal visible={showDeleteModal} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
                            <Text style={styles.modalDescription}>
                                ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente y no se puede deshacer.
                            </Text>
                            <View style={styles.modalActions}>
                                <Button
                                    variant="ghost"
                                    onPress={() => setShowDeleteModal(false)}
                                    style={styles.modalActionButton}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onPress={handleDeleteAccount}
                                    style={[styles.modalActionButton, { backgroundColor: '#DC3545' }]}
                                >
                                    Eliminar Cuenta
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Success Modal */}
                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title="¡Éxito!"
                    message={successMessage}
                    buttonText="Continuar"
                />

                {/* Error Modal */}
                <ErrorModal
                    isOpen={showErrorModal}
                    onClose={() => setShowErrorModal(false)}
                    message={errorMessage}
                />

                {/* Loading Modal */}
                <LoadingModal
                    isOpen={loading}
                    title="Procesando..."
                    message="Por favor espera..."
                />
            </ScrollView>
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
        padding: 16,
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#1A2A6C',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        lineHeight: 20,
    },
    sectionCard: {
        padding: 16,
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabsContainer: {
        paddingHorizontal: 8,
        marginBottom: 16,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    },
    tabText: {
        color: '#000',
        fontWeight: '400',
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 6,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A2A6C',
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
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonDisabledText: {
        color: '#999',
    },
    fullWidthButton: {
        width: '100%',
        padding: 16,
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
        padding: 25,
        width: '100%',
        maxWidth: 400,
        gap: 16
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#1A2A6C',
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
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
        marginTop: 16,
    },
    modalActionButton: {
        flex: 1,
        padding: 12,
    },
    modalButton: {
        minWidth: 80,
        padding: 12,
        backgroundColor: '#1A2A6C',
        borderRadius: 8,
        alignItems: 'center',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
        marginBottom: 16,
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
    otpActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    otpActionButton: {
        padding: 8,
        alignItems: "center",
        alignContent: "center",
        marginLeft: 90
    },
    atrasActionButton: {
        padding: 8,
        marginLeft: -10,
        alignItems: "flex-start"
    },
    inputContainer: {
        gap: 8,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
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
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
        color: "#000",
    },
    eyeIcon: {
        padding: 12,
    },
    buttonChange: {
        backgroundColor: '#1A2A6C',
        width: 80,
        height: 30,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: 'flex-end'
    },
    textChange: {
        color: 'white'
    }
});