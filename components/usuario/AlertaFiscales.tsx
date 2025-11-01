import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Image
} from 'react-native';
import { useRouter } from 'expo-router';


interface AlertaFiscalesProps {
    onSubmit: () => void;
    onLater?: () => void;
    loading?: boolean;
}

const AlertaFiscales: React.FC<AlertaFiscalesProps> = ({ onSubmit, onLater, loading = false }) => {
    const router = useRouter();

    const handleInfoSubmit = () => {
        onSubmit();
        router.push('/metodoRegistroFiscal');
    };

    const handleLater = () => {
        Alert.alert(
            "Información importante",
            "Recuerda que tienes 5 días para completar tus datos personales y fiscales para evitar la desactivación de tu cuenta.",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Entendido",
                    onPress: onLater,
                }
            ]
        );
    };

    return (
        <View style={styles.mainContainer}>
            {/* Sección del logo */}
            <View style={[styles.card, styles.transparentCard]}>
                <Image
                    source={require('@/assets/images/rg-logo.png')}
                    style={[styles.logo, styles.largeLogo]}
                    resizeMode="contain"
                />
            </View>

            {/* Sección del contenido */}
            <View style={styles.container}>
                <Text style={styles.title}>¡Último Paso! Completa los Datos Fiscales</Text>

                <Text style={styles.description}>
                    Para Desbloquear y Disfrutar de todas las funcionalidades y comenzar a operar en la plataforma,
                    es necesario registrar{' '}
                    <Text style={styles.bold}>Datos Fiscales</Text> de quién será el{' '}
                    <Text style={styles.bold}> Receptor de los CFDI</Text>.
                </Text>

                <View style={styles.buttonsContainer}>

                    <TouchableOpacity
                        style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleInfoSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Cargando...' : 'Completar Registro Fiscal'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.laterButton]}
                        onPress={handleLater}
                        disabled={loading}
                    >
                        <Text style={styles.laterButtonText}>Lo haré después</Text>
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
        //backgroundColor: '#f5f5f5',
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
        marginBottom: 24,
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
        backgroundColor: '#1A2A6C',
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
    //Estilo para el logo
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
        width: 300 * 0.8, // Más ancho
        height: 150 * 0.8, // Más alto
        marginBottom: 30,
    },
});

export default AlertaFiscales;