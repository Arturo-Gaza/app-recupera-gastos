import { useSession } from '@/src/hooks/useSession';
import { ACTIVAR_PLAN, GET_BY_ID_BASICOS } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { useNavigation } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import PlanCardRecarga from './PlanCardRecarga';

// Interfaces
interface PlanFeature {
    label: string;
    value: string;
}

interface PlanFromAPI {
    id: number;
    nombre: string;
    id_plan: number;
    monto: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    success: boolean;
    data: PlanFromAPI[];
    data2: null;
    message: string;
}



// Componente principal
const RecargasPersonales = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [plans, setPlans] = useState<PlanFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const navigation = useNavigation();
    const { width: screenWidth } = Dimensions.get('window');
    const cardWidth = screenWidth * 0.8 + 20;
    const { planId } = useLocalSearchParams();
    const { session, loading: sessionLoading } = useSession();
    const { updateSession } = useSession();

    // Funciones de API
    const GetAllPlanesBasicos = async (): Promise<ApiResponse> => {
        try {
            const response = await requests.get({ command: GET_BY_ID_BASICOS + planId });
            return response.data;
        } catch (err) {
            return { success: false, data: [], data2: null, message: 'Error al obtener planes básicos' };
        }
    };

    const handleActivarPlan = async (planId: string) => {
        
        try {
            const response = await requests.post({
                command: ACTIVAR_PLAN + planId
            });

            const responseData = response.data;

            if (responseData?.success) {

                const idPlan = responseData.data?.suscripcion?.id_plan ?? null;
                const tipoPago = responseData.data?.tipo_pago ?? null;

                await updateSession({
                    IdPlanSST: idPlan,
                    TipoPagoSST: tipoPago,
                    tieneSuscripcionActivaSST: true,
                    DatosCompletosSST: true
                });

            } else {
                Alert.alert("Error", responseData?.message);
                return null;
            }
        } catch (error: any) {
            console.error("Error:", error);
            Alert.alert("Error", error?.response?.data?.message || "Error inesperado");
            return null;
        } finally {
            setLoading(false);
        }
    };


    const getPlanFeatures = (plan: PlanFromAPI): PlanFeature[] => {
        return [];
    };

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response: ApiResponse = await GetAllPlanesBasicos();
                if (response.success && response.data) {
                    setPlans(response.data);
                } else {
                    throw new Error(response.message || "Error al cargar los planes");
                }
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

    const handleCardClick = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handlePlanSelect = async (planId: string) => {
        // Navegar a la pantalla de pago con el plan seleccionado
          if (!planId) {
            console.log("No viene planId en los parámetros");
        } else {
            await handleActivarPlan(String(planId));
        }
        router.push({
            pathname: '/pagoStripe',
            params: {
                idRecarga: planId,
                tipoPago: 'prepago'
            }
        });
    };

    const datosCompletos = session?.DatosCompletosSST;


    const handleOmitir = async () => {

        if (!planId) {
            console.log("No viene planId en los parámetros");
        } else {
            await handleActivarPlan(String(planId));
        }

        if (datosCompletos !== true) {
            router.push('/datosAlert');
        } else {
            router.push('/dashboard');
        }

    };



    if (loading) return (
        <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Cargando planes...</Text>
        </SafeAreaView>
    );

    if (error) return (
        <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity
                style={styles.retryButton}
            //onPress={() => window.location.reload()}
            >
                <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header con botones */}
                <View style={styles.headerButtons}>
                    {/* Botón Volver a la izquierda */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <ArrowLeft size={16} color="#6b7280" />
                        <Text style={styles.backButtonText}>Volver a Planes</Text>
                    </TouchableOpacity>


                </View>
                <View style={[styles.card, styles.transparentCard]}>
                    <Image
                        source={require('@/assets/images/rg-logo.png')}
                        style={[styles.logo, styles.largeLogo]}
                        resizeMode="contain"
                    />
                </View>

                {/* Título */}
                <View style={styles.header}>
                    <Text style={styles.title}>Recargas</Text>
                    <Text style={styles.subtitle}>
                        Elige la recarga que mejor se adapte a tus necesidades personales.
                    </Text>
                </View>

                {/* Botón Omitir a la derecha */}
                <TouchableOpacity
                    onPress={handleOmitir}
                    style={styles.omitButton}
                >
                    <Text style={styles.omitButtonText}>Continuar con pruebas gratis</Text>

                </TouchableOpacity>

                {/* Carrusel de Planes */}
                <View style={styles.carouselContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.plansContainer}
                    //snapToInterval={cardWidth}
                    //decelerationRate="fast"
                    //onScroll={handleScroll}
                    //scrollEventThrottle={16}
                    >
                        {plans.map((plan) => {
                            const isSelected = selectedPlan === plan.id.toString();
                            const planCardData = {
                                id: plan.id.toString(),
                                name: plan.nombre,
                                price: parseFloat(plan.monto),
                                category: "personal" as const,
                                features: getPlanFeatures(plan),
                            };

                            return (
                                <View
                                    key={plan.id}
                                    style={[
                                        styles.planWrapper,
                                        isSelected && styles.planWrapperSelected
                                    ]}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => handleCardClick(plan.id.toString())}
                                    >
                                        <View style={[
                                            styles.planCard,
                                            isSelected && styles.planCardSelected
                                        ]}>
                                            <PlanCardRecarga
                                                {...planCardData}
                                                featured={isSelected}
                                                onSelect={() => handlePlanSelect(plan.id.toString())}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>

                    {/* Indicadores de paginación */}
                    {/* {plans.length > 1 && (
                        <View style={styles.dotsContainer}>
                            {plans.map((_, index) => (
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
                    )} */}
                </View>

                {/* Información adicional */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        Todos los precios incluyen IVA. Facturación disponible.
                    </Text>
                    <Text style={styles.tipText}>
                        💡 Los planes personales son prepago y ofrecen máxima flexibilidad.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        marginTop: 30
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    backButtonText: {
        color: '#6b7280',
        fontSize: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
        marginTop: -35
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6b7280',
        maxWidth: 300,
        lineHeight: 24,
    },
    carouselContainer: {
        marginBottom: 48,
    },
    plansContainer: {
        paddingVertical: 20,
        alignItems: 'center',
        gap: 20,
    },
    planWrapper: {
        width: '90%',
    },
    planWrapperSelected: {
        transform: [{ scale: 1.05 }],
    },
    planCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    planCardSelected: {
        borderColor: '#3b82f6',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
        marginHorizontal: 4,
    },
    dotActive: {
        backgroundColor: '#3b82f6',
        width: 12,
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 0,
        paddingHorizontal: 20,
    },
    infoText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 8,
        marginTop: -20
    },
    tipText: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 8,
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
    omitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#052756ff",
        width: 210,
        height: 40,
        borderRadius: 4,
        alignSelf: 'center'

    },
    omitButtonText: {
        color: '#ffffffff',
        fontSize: 16,
        fontWeight: '500',
        alignItems: 'center'
    },
});

export default RecargasPersonales;