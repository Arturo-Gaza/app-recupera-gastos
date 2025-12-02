import { useSession } from '@/src/hooks/useSession';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface InfoFormProps {
    onSubmit?: () => void;
    onLater?: () => void;
    loading?: boolean;
}

const InfoForm: React.FC<InfoFormProps> = ({ onSubmit, onLater, loading = false }) => {
    const router = useRouter();
    const { session } = useSession();

    const handleInfoSubmit = () => {
        onSubmit?.();
        router.replace("/(auth)/RegisterColaborador");
    };

    const handleLater = () => {
        if (session?.tienDatoFiscalSST === false) {
            router.push("/fiscalesAlert");
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <View style={styles.mainContainer}>

            {/* Logo */}
            <View style={[styles.card, styles.transparentCard]}>
                <Image
                    source={require('@/assets/images/rg-logo.png')}
                    style={[styles.logo, styles.largeLogo]}
                    resizeMode="contain"
                />
            </View>

            {/* Contenido */}
            <View style={styles.container}>
                <Text style={styles.title}>Información del proceso</Text>

                <Text style={styles.description}>
                    Estás a un paso de comenzar. Por seguridad, te pediremos completar 3 pasos rápidos:
                </Text>

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.description}>
                        <Text style={styles.bold}>Paso 1:</Text> Ingresa tu número celular.
                    </Text>
                    <Text style={styles.description}>
                        <Text style={styles.bold}>Paso 2:</Text> Valida el código enviado.
                    </Text>
                    <Text style={styles.description}>
                        <Text style={styles.bold}>Paso 3:</Text> Establece tu nueva contraseña.
                    </Text>
                </View>

                {/* Botones iguales al primer modal */}
                <View style={styles.buttonsContainer}>
                 
                    <TouchableOpacity
                        style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleInfoSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Cargando...' : 'Entendido'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        marginTop: -25
    },
    container: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    mainContainer: {
        flex: 1,
        padding: 16,
        marginTop: 150,
        borderColor: "black"
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#1f2937',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
        color: '#374151',
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    laterButton: {
        backgroundColor: '#e5e7eb',
    },
    submitButton: {
        backgroundColor: '#1A2A6C'
    },
    buttonDisabled: {
        backgroundColor: '#9ca3af',
        opacity: 0.6,
    },
    laterButtonText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 14,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    transparentCard: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 0,
        marginTop: -55,
        marginLeft: 40
    },
    logo: {
        width: 200,
        height: 100,
        marginBottom: 30,
        marginTop: -55
    },
    largeLogo: {
        width: 240,
        height: 120,
        marginBottom: 30,
    },
});

export default InfoForm;
