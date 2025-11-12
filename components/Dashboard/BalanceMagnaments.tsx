import { GET_MIS_MOVIMIENTOS, MOVIMIENTO_EXPORT_EXCEL } from '@/app/services/apiConstans';
import requests from '@/app/services/requests';
import { useSession } from '@/hooks/useSession';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RecargasPersonales from './PlanRecargasDashboard';


// Interfaces
interface BalanceManagementProps {
    activeSubSection: string;
}

export interface MisMovimientos {
    card_brand: string | number | null;
    currency: string | null;
    descripcion: string | null;
    estatus: string | null;
    fecha_creacion: string | null;
    fecha_procesado: string | null;
    id: number | null;
    monto: string | null;
    payment_method: string | null;
    payment_method_type: string | null;
    saldo_antes: string | null;
    saldo_resultante: string | null;
    tarjeta: string | number | null;
    tipo: string | null;
}

// Simulamos las funciones de API
const GetMiMovimientos = async () => {
    try {
        const response = await requests.get({ 
            command: GET_MIS_MOVIMIENTOS
        });
        return response.data;
    } catch (err) {
        return { 
            success: false, 
            data: [], 
            data2: null, 
            message: 'Error al obtener los movimientos' 
        };
    }
};

const GetExportMovimientoEXCEL = async () => {
     try {
        const response = await requests.get({ 
            command: MOVIMIENTO_EXPORT_EXCEL
        });
        return response.data;
    } catch (err) {
        return { 
            success: false, 
            data: [], 
            data2: null, 
            message: 'Error al obtener los movimientos' 
        };
    }
};

const GetExportMovimientoPDF = async () => {
    // Implementar exportación a PDF
};

// Componente Card personalizado
const Card = ({ children, style }: any) => (
    <View style={[styles.card, style]}>
        {children}
    </View>
);

const CardContent = ({ children }: any) => (
    <View style={styles.cardContent}>
        {children}
    </View>
);

// Componente Button personalizado
const Button = ({
    mode = 'contained',
    onPress,
    disabled,
    children,
    style
}: any) => (
    <TouchableOpacity
        style={[
            styles.button,
            mode === 'outlined' && styles.buttonOutlined,
            disabled && styles.buttonDisabled,
            style
        ]}
        onPress={onPress}
        disabled={disabled}
    >
        {children}
    </TouchableOpacity>
);

export function BalanceManagement({ activeSubSection }: BalanceManagementProps) {
    const [misMovimientos, setMisMovimientos] = useState<MisMovimientos[]>([]);
    const [loadData, setLoadData] = useState(false);
    const [loadDataExportPDF, setLoadDataExportPDF] = useState(false);
    const [loadDataExportExcel, setLoadDataExportExcel] = useState(false);
    const { session, loading: sessionLoading } = useSession();
    const userBalance = session?.SaldoSST || "0.00";

    const getMisMovimientos = async () => {
        try {
            setLoadData(true);
            const response = await GetMiMovimientos();
            console.log('ver respuesta mis movimientos: ', response);
            if (response?.success) {
                setMisMovimientos(response.data);
            } else {
                Alert.alert("Error", "No se pudo obtener los movimientos");
                return;
            }
        } catch (error) {
            Alert.alert("Error", "Ocurrió un error al obtener los movimientos");
            return;
        } finally {
            setLoadData(false);
        }
    }

    const exportExcel = async () => {
        try {
            setLoadDataExportExcel(true);
            const response = await GetExportMovimientoEXCEL();
            console.log('export excel: ', response);
            Alert.alert('Éxito', 'Archivo Excel descargado');
        } catch (error) {
            Alert.alert("Error", "Ocurrió un error al descargar el Excel");
            return;
        } finally {
            setLoadDataExportExcel(false);
        }
    }

    const exportPDF = async () => {
        try {
            setLoadDataExportPDF(true);
            const response = await GetExportMovimientoPDF();
            console.log('export pdf', response);
            Alert.alert('Éxito', 'Archivo PDF descargado');
        } catch (error) {
            Alert.alert("Error", "Ocurrió un error al descargar el PDF");
            return;
        } finally {
            setLoadDataExportPDF(false);
        }
    }

    useEffect(() => {
        const init = async () => {
            await Promise.all([getMisMovimientos()]);
        };
        init();
    }, []);

    // Funciones auxiliares para estilos y textos
    const getMovementTypeColor = (tipo: string | null) => {
        switch (tipo?.toLowerCase()) {
            case 'ingreso':
            case 'deposito':
            case 'recarga':
                return '#10b981'; // Verde
            case 'egreso':
            case 'retiro':
            case 'pago':
                return '#ef4444'; // Rojo
            default:
                return '#6b7280'; // Gris
        }
    };

    const getMovementTypeText = (tipo: string | null) => {
        switch (tipo?.toLowerCase()) {
            case 'ingreso':
                return 'Ingreso';
            case 'egreso':
                return 'Egreso';
            case 'deposito':
                return 'Depósito';
            case 'retiro':
                return 'Retiro';
            case 'recarga':
                return 'Recarga';
            case 'pago':
                return 'Pago';
            default:
                return tipo || 'Movimiento';
        }
    };

    const getStatusColor = (estatus: string | null) => {
        switch (estatus?.toLowerCase()) {
            case 'completado':
            case 'aprobado':
            case 'exitoso':
                return '#10b981'; // Verde
            case 'pendiente':
            case 'procesando':
                return '#f59e0b'; // Amarillo
            case 'rechazado':
            case 'cancelado':
            case 'fallido':
                return '#ef4444'; // Rojo
            default:
                return '#6b7280'; // Gris
        }
    };

    const getStatusText = (estatus: string | null) => {
        switch (estatus?.toLowerCase()) {
            case 'completado':
                return 'Completado';
            case 'pendiente':
                return 'Pendiente';
            case 'procesando':
                return 'Procesando';
            case 'rechazado':
                return 'Rechazado';
            case 'cancelado':
                return 'Cancelado';
            case 'aprobado':
                return 'Aprobado';
            case 'exitoso':
                return 'Exitoso';
            case 'fallido':
                return 'Fallido';
            default:
                return estatus || 'Desconocido';
        }
    };

    if (activeSubSection === '/balance/recharge') {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Recargar Saldo</Text>
                </View>

                <Card style={styles.card}>
                    <CardContent>
                        <Text style={styles.cardTitle}>Saldo Actual</Text>
                        <Text style={styles.balanceText}>
                            ${userBalance} MXN
                        </Text>
                    </CardContent>
                </Card>

                <Card style={styles.card}>
                    <CardContent>
                        <RecargasPersonales/>
                    </CardContent>
                </Card>
            </ScrollView>
        );
    }

    if (activeSubSection === '/balance/statement') {
        return (
            <ScrollView style={styles.container}>
                {/* Título */}
                <View style={styles.header}>
                    <Text style={styles.title}>Estado de Cuenta</Text>
                </View>

                {/* Botones de exportación debajo del título */}
                <View style={styles.exportSection}>
                    <Button
                        mode="outlined"
                        onPress={exportExcel}
                        disabled={loadDataExportExcel}
                        style={styles.exportButton}
                    >
                        <Icon name="file-excel" size={16} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>
                            {loadDataExportExcel ? 'Descargando...' : 'Exportar Excel'}
                        </Text>
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={exportPDF}
                        disabled={loadDataExportPDF}
                        style={styles.exportButton}
                    >
                        <Icon name="file-pdf" size={16} style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>
                            {loadDataExportPDF ? 'Descargando...' : 'Exportar PDF'}
                        </Text>
                    </Button>
                </View>

                {loadData ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.loadingText}>Cargando movimientos...</Text>
                    </View>
                ) : (
                    <View style={styles.tableContainer}>
                        {misMovimientos.map((movimiento, index) => (
                            <View key={index} style={styles.movementCard}>
                                {/* Header de la tarjeta */}
                                <View style={styles.movementHeader}>
                                    <Text style={styles.movementNumber}>#{movimiento.id || 'N/A'}</Text>
                                    <View style={[
                                        styles.typeBadge,
                                        { backgroundColor: getMovementTypeColor(movimiento.tipo) }
                                    ]}>
                                        <Text style={styles.typeText}>
                                            {getMovementTypeText(movimiento.tipo)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Información principal */}
                                <View style={styles.movementInfo}>
                                    <Text style={styles.description}>
                                        {movimiento.descripcion || 'Sin descripción'}
                                    </Text>

                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailLabel}>Fecha:</Text>
                                        <Text style={styles.detailValue}>
                                            {movimiento.fecha_creacion
                                                ? new Date(movimiento.fecha_creacion).toLocaleDateString("es-MX")
                                                : "-"}
                                        </Text>
                                    </View>

                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailLabel}>Método:</Text>
                                        <Text style={styles.detailValue}>
                                            {movimiento.payment_method_type
                                                ? `${movimiento.payment_method_type} (${movimiento.card_brand || ""})`
                                                : "-"}
                                        </Text>
                                    </View>

                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailLabel}>Saldo anterior:</Text>
                                        <Text style={styles.detailValue}>
                                            {movimiento.saldo_antes
                                                ? `$${parseFloat(movimiento.saldo_antes).toFixed(2)}`
                                                : "$0.00"}
                                        </Text>
                                    </View>

                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailLabel}>Monto:</Text>
                                        <Text style={[
                                            styles.amount,
                                            movimiento.tipo === 'ingreso' ? styles.amountPositive : styles.amountNegative
                                        ]}>
                                            {movimiento.monto
                                                ? `$${parseFloat(movimiento.monto).toFixed(2)}`
                                                : "$0.00"}
                                        </Text>
                                    </View>

                                    <View style={styles.detailsRow}>
                                        <Text style={styles.detailLabel}>Saldo resultante:</Text>
                                        <Text style={[styles.detailValue, styles.finalBalance]}>
                                            {movimiento.saldo_resultante
                                                ? `$${parseFloat(movimiento.saldo_resultante).toFixed(2)}`
                                                : "$0.00"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        );
    }

    // Return por defecto si no coincide ninguna subsección
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gestión de Saldo</Text>
            <Text style={styles.subtitle}>Selecciona una opción para continuar.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    // Nueva sección para los botones de exportación
    exportSection: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 12,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    exportButton: {
        flex: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        // Contenido del card
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    balanceText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    largeBalanceText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'center',
        marginVertical: 10,
    },
    centerContent: {
        alignItems: 'center',
    },
    currencyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    updateText: {
        fontSize: 12,
        color: '#999',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    buttonOutlined: {
        backgroundColor: 'transparent',
        borderColor: '#007AFF',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonIcon: {
        marginRight: 8,
        color: '#007AFF',
    },
    buttonText: {
        color: '#007AFF',
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    tableContainer: {
        padding: 0,
    },
    movementCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    movementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    movementNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    movementInfo: {
        gap: 8,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '400',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    amountPositive: {
        color: '#10b981',
    },
    amountNegative: {
        color: '#ef4444',
    },
    finalBalance: {
        fontWeight: 'bold',
        color: '#1f2937',
    },
});

export default BalanceManagement;