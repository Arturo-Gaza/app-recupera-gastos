import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Dimensions,
    Alert,
    Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PlanCard from './PlanCard';
import requests from '@/app/services/requests';
import { ACTIVAR_PLAN, GET_ALL_PLANES } from '@/app/services/apiConstans';

// Interfaces
interface PlanFeature { label: string; value: string; }
interface PlanFromAPI {
    id: number;
    nombre_plan: string;
    tipo_plan: "personal" | "empresarial";
    tipo_pago: "prepago" | "postpago";
    num_usuarios: number | null;
    num_facturas: number | null;
    vigencia_inicio: string;
    vigencia_fin: string | null;
    created_at: string;
    updated_at: string;
    precio: string;
}
interface ApiResponse {
    success: boolean;
    data: PlanFromAPI[];
    data2: null;
    message: string;
}

interface RegistroPricingProps {
    onBack: () => void;
}

// Funciones auxiliares
const getPlanFeatures = (plan: PlanFromAPI): PlanFeature[] => [
    { label: "Uso de App y Web", value: "✓" },
    { label: "Tipo de Pago", value: plan.tipo_pago === "prepago" ? "Prepago" : "Mensual" },
    { label: "10 operaciones gratuitas si eres usuario nuevo", value: "✓" },
];

const getPlanDescription = (plan: PlanFromAPI): string => {
    const descriptions: { [key: number]: string } = {
        1: "Selecciona este plan para ver las opciones de recarga disponibles",
        2: "Recupera la mayoría de los gastos",
        3: "Ideal para pequeñas empresas",
        4: "Para empresas en crecimiento",
        5: "Máxima capacidad y soporte",
    };
    return descriptions[plan.id] || "Plan personalizado para tus necesidades";
};

// Funciones de API (mock para desarrollo)
const GetAllPlanes = async (): Promise<ApiResponse> => {
    try {
        const response = await requests.get({ command: GET_ALL_PLANES });
        return response.data;
    } catch (err) {
        return { success: false, data: [], data2: null, message: 'Error al obtener planes' };
    }
};

const ActivarPlan = async (planId: string): Promise<ApiResponse> => {
    console.log('Activar plan:', planId);
    return { success: true, data: [], data2: null, message: 'Plan activado' };
};

// Componente Pricing
const Pricing: React.FC<RegistroPricingProps> = ({ onBack }) => {
    const [plans, setPlans] = useState<PlanFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [mode, setMode] = useState<"personal" | "empresarial">("personal");
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const navigation = useNavigation();
    const { width: screenWidth } = Dimensions.get('window');
    const cardWidth = screenWidth * 0.8 + 20;

    // Fetch planes
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await GetAllPlanes();
                if (response.success && response.data) setPlans(response.data);
                else throw new Error(response.message);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / cardWidth);
        setCurrentIndex(index);
    };

    const handleDotPress = (index: number) => {
        setCurrentIndex(index);
        scrollViewRef.current?.scrollTo({
            x: index * cardWidth,
            animated: true,
        });
    };

    const handleModeChange = (newMode: "personal" | "empresarial") => {
        setMode(newMode);
        setSelectedPlan(null);
        setCurrentIndex(0);
    };

    const handleActivarPlan = async (planId: string) => {
        try {
            const response = await requests.post({
                command: ACTIVAR_PLAN + planId
            });

            const { data } = response;

            if (data?.success) {
                Alert.alert("Éxito", data.message);
                // Lógica de éxito
                return data;
            } else {
                Alert.alert("Error", data?.message);
                return null;
            }
        } catch (error: any) {
            console.error("Error:", error);
            Alert.alert("Error", error?.response?.data?.message || "Error inesperado");
            return null;
        } finally {
            setLoading(false);
        }
    }

    const handleButtonClick = async (planId: string, planName: string) => {
        setSelectedPlan(planId);
        await handleActivarPlan(planId);
        if (planName.toLowerCase().includes("personal")) {
            navigation.navigate('Recargas' as never);
        } else {
            //navigation.navigate('ResumenPago' as never, { planId } as never);
        }
    };

    const filteredPlans = plans.filter(plan => plan.tipo_plan === mode);

    if (loading) return (
        <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Cargando planes...</Text>
        </SafeAreaView>
    );

    if (error) return (
        <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => setError(null)}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Botón volver */}
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Volver a Login</Text>
                </TouchableOpacity>
                <View style={[styles.card, styles.transparentCard]}>
                    <Image
                        source={require('@/assets/images/rg-logo.png')}
                        style={[styles.logo, styles.largeLogo]}
                        resizeMode="contain"
                    />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Planes - Recupera Gastos</Text>
                    <Text style={styles.subtitle}>
                        Selecciona el tipo de servicio que mejor se adapte a tus necesidades
                    </Text>

                    {/* Switch de modo */}
                    <View style={styles.modeSwitch}>
                        <TouchableOpacity
                            style={[styles.modeButton, mode === 'personal' && styles.modeButtonActive]}
                            onPress={() => handleModeChange('personal')}
                        >
                            <Text style={[styles.modeButtonText, mode === 'personal' && styles.modeButtonTextActive]}>
                                Personal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modeButton, mode === 'empresarial' && styles.modeButtonActive]}
                            onPress={() => handleModeChange('empresarial')}
                        >
                            <Text style={[styles.modeButtonText, mode === 'empresarial' && styles.modeButtonTextActive]}>
                                Empresarial
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scroll horizontal de planes */}
                <View>
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.plansContainer}
                        snapToInterval={cardWidth}
                        decelerationRate="fast"
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {filteredPlans.map(plan => {
                            const isSelected = selectedPlan === plan.id.toString();
                            return (
                                <View key={plan.id} style={[styles.planWrapper, isSelected && styles.planWrapperSelected]}>
                                    <PlanCard
                                        name={plan.nombre_plan}
                                        description={getPlanDescription(plan)}
                                        price={Number(plan.precio)}
                                        features={getPlanFeatures(plan)}
                                        featured={isSelected}
                                        onSelect={() => handleButtonClick(plan.id.toString(), plan.nombre_plan)}
                                    />
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* Indicadores de paginación */}
                    {filteredPlans.length > 1 && (
                        <View style={styles.dotsContainer}>
                            {filteredPlans.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dot,
                                        currentIndex === index && styles.dotActive
                                    ]}
                                    onPress={() => handleDotPress(index)}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {filteredPlans.length === 0 && (
                    <View style={styles.noPlansContainer}>
                        <Text style={styles.noPlansText}>No hay planes disponibles para esta categoría.</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Todos los precios incluyen IVA. Facturación disponible.</Text>
                    <Text style={styles.footerText}>
                        Haz clic en cualquier plan para seleccionarlo y en "Elegir Plan" para continuar
                    </Text>
                    {mode === "personal" && (
                        <Text style={styles.personalTip}>💡 El plan Personal te mostrará opciones de recarga flexibles</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: 
    {
         flexGrow: 1, 
         padding: 16,
        marginTop: 30
         },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center', marginBottom: 16 },
    retryButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 6 },
    retryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    backButton: { alignSelf: 'flex-start', marginBottom: 16 },
    backButtonText: { color: '#6b7280', fontSize: 16 },
    header: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: -40
    },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: '#1f2937' },
    subtitle: { fontSize: 16, textAlign: 'center', color: '#6b7280', marginBottom: 24, maxWidth: 300 },
    modeSwitch: { flexDirection: 'row', backgroundColor: '#f3f4f6', borderRadius: 25, padding: 4 },
    modeButton: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 },
    modeButtonActive: { backgroundColor: '#0A1E73' },
    modeButtonText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
    modeButtonTextActive: { color: '#fff' },
    plansContainer: { paddingHorizontal: 10, paddingVertical: 20 },
    planWrapper: { width: Dimensions.get('window').width * 0.8, marginHorizontal: 10 },
    planWrapperSelected: { transform: [{ scale: 1.05 }] },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        marginBottom: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#0A1E73',
        width: 12,
    },
    noPlansContainer: { alignItems: 'center', paddingVertical: 40 },
    noPlansText: { fontSize: 16, color: '#6b7280' },
    footer: { alignItems: 'center', marginTop: 32, paddingHorizontal: 20 },
    footerText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
    personalTip: {
        fontSize: 14, color: '#3b82f6', fontWeight: '500', textAlign: 'center', marginTop: 8

    },
    //Estilo para el logo
    transparentCard: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        borderWidth: 0,
        marginLeft: 35,
        marginTop: -35
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
    },
});

export default Pricing;