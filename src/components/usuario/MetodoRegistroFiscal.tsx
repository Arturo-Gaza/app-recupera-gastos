import { router } from 'expo-router';
import { CloudUpload, FilePen } from 'lucide-react-native';
import { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Props {
    onMethodSelect?: (method: 'cfdi' | 'constancia' | 'manual') => void;
    onCancel?: () => void;
}

export default function FiscalRegistrationMethod({  
    onMethodSelect = () => {},
    onCancel = () => {},
}: Props) {

    const [loading, setLoading] = useState(false);

    const handleMethodSelect = (method: 'cfdi' | 'constancia' | 'manual') => {
    setLoading(true);
    
    
    switch (method) {
      case 'constancia':
        router.push('/fileUpload');
        break;
      case 'manual':
        router.push('/FormDatosFiscalesScreen'); 
        break;
      default:
        break;
    }
    
    setLoading(false);
  };

    

  const handleCancel = () => {
    router.back();
  };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={[styles.card, styles.transparentCard]}>
                <Image
                    source={require('@/assets/images/rg-logo.png')}
                    style={[styles.logo, styles.largeLogo]}
                    resizeMode="contain"
                />
            </View>
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>
                        ¿Cómo Quieres Registrar tus Datos Fiscales?
                    </Text>

                    <Text style={styles.subtitle}>
                        Selecciona el método que prefieras para ingresar tu información fiscal:
                    </Text>

                    <View style={styles.optionsContainer}>
                        {/* Opción Constancia Fiscal */}
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleMethodSelect('constancia')}
                        >
                            <CloudUpload size={24} color="#6b7280" />
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Completar con Constancia de Situación Fiscal (CSF)</Text>
                                <Text style={styles.optionDescription}>Sube tu archivo CSF para extraer la información</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Opción Manual */}
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={() => handleMethodSelect('manual')}
                        >
                            <FilePen size={24} color="#6b7280" />
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Completar manualmente</Text>
                                <Text style={styles.optionDescription}>Ingresa la información paso a paso</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </ScrollView>
    );
}

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
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        color: '#6b7280',
        lineHeight: 20,
    },
    optionsContainer: {
        width: '100%',
        gap: 16,
        marginBottom: 24,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
        gap: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 18,
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
    outlineButton: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: 'transparent',
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    cancelButton: {
        backgroundColor: '#e5e7eb',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    //Estilo para el logo
    transparentCard: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 0,
        marginTop: 75,
        marginLeft: 55
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