import { ACTUALIZAR_RECEPTOR, PROCESAR_TICKET, RECEPTORES_BYUSER, USUARIO_GETBY_ID } from "@/app/services/apiConstans";
import requests from "@/app/services/requests";
import { ChevronDown, Download, Eye, Send, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import TicketModal from "./Modales/ModalTicket";

// Interface basada en tu respuesta real de API
interface Ticket {
    id: string;
    num_ticket: string | null;
    establecimiento: string | null;
    fecha_ticket: string | null;
    monto: string | null;
    estado_id: number;
    estado_solicitud: {
        descripcion_cliente: string;
    };
    imagen_url: string;
    created_at: string;
    usoCFDI: string;
    id_receptor: number; // Cambiado de receptor a id_receptor
}

// Interface para opciones del selector
interface Option {
    value: string;
    label: string;
    predeterminado?: boolean;
}

export const TicketsTable = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    
    // Estados para el selector de receptores
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedValues, setSelectedValues] = useState<{ [ticketId: string]: string }>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedSelectors, setExpandedSelectors] = useState<{ [ticketId: string]: boolean }>({});

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await requests.get({ command: USUARIO_GETBY_ID + 4 });

            const ticketsData = response.data?.data || [];

            const mappedTickets: Ticket[] = ticketsData.map((ticket: any) => ({
                id: ticket.id.toString(),
                num_ticket: ticket.num_ticket,
                establecimiento: ticket.establecimiento,
                fecha_ticket: ticket.fecha_ticket,
                monto: ticket.monto,
                estado_id: ticket.estado_id,
                estado_solicitud: {
                    descripcion_cliente: ticket.estado_solicitud?.descripcion_cliente || "Sin estado"
                },
                imagen_url: ticket.imagen_url,
                created_at: ticket.created_at,
                usoCFDI: ticket.usoCFDI,
                id_receptor: ticket.id_receptor // Usando id_receptor de la API
            }));

            setTickets(mappedTickets);

        } catch (error) {
            console.error("Error cargando tickets:", error);
            setTickets([]);
            Alert.alert("Error", "No se pudieron cargar los tickets");
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar receptores disponibles
    const fetchOptions = async () => {
        try {
            // Reemplaza RECEPTORES_BYUSER con tu endpoint real
            const response = await requests.get({ 
                command: RECEPTORES_BYUSER + 4 // o el userId correspondiente
            });

            const data = response?.data?.data;

            if (Array.isArray(data) && data.length > 0) {
                const formatted = data.map((item: any) => ({
                    value: String(item.id),
                    label: item.nombre_razon,
                    predeterminado: item.predeterminado,
                }));

                setOptions(formatted);

                // Inicializar valores seleccionados con los id_receptor de cada ticket
                const initialSelectedValues: { [ticketId: string]: string } = {};
                tickets.forEach(ticket => {
                    initialSelectedValues[ticket.id] = String(ticket.id_receptor);
                });
                setSelectedValues(initialSelectedValues);
            } else {
                // Si no hay receptores desde la API, usar datos del usuario como opción por defecto
                const defaultOption: Option = {
                    value: "5", // ID del datos_fiscales_personal
                    label: "Arturo Gabriel zamora",
                    predeterminado: true
                };
                setOptions([defaultOption]);
                
                const initialSelectedValues: { [ticketId: string]: string } = {};
                tickets.forEach(ticket => {
                    initialSelectedValues[ticket.id] = String(ticket.id_receptor) || "5";
                });
                setSelectedValues(initialSelectedValues);
            }
        } catch (error) {
            console.error("Error al cargar receptores:", error);
            // En caso de error, usar datos del usuario como opción por defecto
            const defaultOption: Option = {
                value: "5",
                label: "Arturo Gabriel zamora",
                predeterminado: true
            };
            setOptions([defaultOption]);
        }
    };

    // Función para manejar cambios en el selector
    const handleSelectChange = async (ticketId: string, value: string) => {
        const ticket = tickets.find(t => t.id === ticketId);

        // No permitir cambios si el ticket no está en estado 1 (Cargado)
        if (ticket && ticket.estado_id !== 1) {
            Alert.alert("No permitido", "Solo puedes cambiar el receptor en tickets con estado 'Cargado'");
            return;
        }

        // Actualización optimista
        setSelectedValues(prev => ({
            ...prev,
            [ticketId]: value
        }));

        // Cerrar el dropdown después de seleccionar
        setExpandedSelectors(prev => ({
            ...prev,
            [ticketId]: false
        }));

        try {
            setIsRefreshing(true);
            
            // Llamar a tu API para actualizar el receptor
            const response = await requests.post({
                command: ACTUALIZAR_RECEPTOR, // Reemplaza con tu endpoint real
                data: {
                    id_solicitud: ticketId,
                    id_receptor: value,
                },
            });

            // Refrescar tickets para obtener datos actualizados
            await fetchTickets();
            
            Alert.alert("Éxito", "Receptor actualizado correctamente");
        } catch (error: any) {
            // Revertir en caso de error
            const ticket = tickets.find(t => t.id === ticketId);
            setSelectedValues(prev => ({
                ...prev,
                [ticketId]: String(ticket?.id_receptor)
            }));

            Alert.alert("Error", error?.response?.data?.message || "Error al actualizar receptor");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Función para toggle del dropdown
    const toggleSelector = (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        
        // Solo permitir abrir si el ticket está en estado 1
        if (ticket && ticket.estado_id !== 1) {
            Alert.alert("No permitido", "Solo puedes cambiar el receptor en tickets con estado 'Cargado'");
            return;
        }

        setExpandedSelectors(prev => ({
            ...prev,
            [ticketId]: !prev[ticketId]
        }));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTickets();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Cargar receptores cuando los tickets estén listos
    useEffect(() => {
        if (tickets.length > 0) {
            fetchOptions();
        }
    }, [tickets.length]);

    // Actualizar selectedValues cuando cambien los tickets
    useEffect(() => {
        if (tickets.length > 0) {
            const updatedValues: { [ticketId: string]: string } = {};
            tickets.forEach(ticket => {
                updatedValues[ticket.id] = String(ticket.id_receptor);
            });
            setSelectedValues(updatedValues);
        }
    }, [tickets]);

    // Filtrar tickets
    const filteredTickets = tickets.filter((ticket) =>
        (ticket.num_ticket?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (ticket.establecimiento?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (estadoId: number): string => {
        switch (estadoId) {
            case 1: return '#60a5fa';
            case 2: return '#eab308';
            case 3: return '#f59e0b';
            case 4: return '#4ade80';
            case 5: return '#f97316';
            case 6: return '#14b8a6';
            case 7: return '#ef4444';
            case 8: return '#6366f1';
            case 9: return '#059669';
            default: return '#9ca3af';
        }
    };

    const getStatusText = (estadoId: number): string => {
        switch (estadoId) {
            case 1: return 'Cargado';
            case 2: return 'Procesando';
            case 3: return 'Asignado';
            case 4: return 'Visualizado';
            case 5: return 'Procesando';
            case 6: return 'Recuperado';
            case 7: return 'Rechazado';
            case 8: return 'Descargado';
            case 9: return 'Concluido';
            default: return 'Sin estado';
        }
    };

    // Función para obtener el label del receptor seleccionado
    const getSelectedLabel = (ticketId: string): string => {
        const selectedValue = selectedValues[ticketId];
        if (!selectedValue) return "Seleccionar receptor";
        
        const selectedOption = options.find(opt => opt.value === selectedValue);
        return selectedOption?.label || "Seleccionar receptor";
    };

    const handleDownload = (ticketId: string) => {
        Alert.alert("Descargar", `Descargar ticket ${ticketId}`);
    };

    const handleProcess = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setShowTicketModal(true);
    };

    const procesarTicket = async (ticketId: string) => {
        try {
            setLoading(true);
            const response = await requests.get({
                command: PROCESAR_TICKET + ticketId,
            });

            Alert.alert("Éxito", `Ticket ${ticketId} procesado correctamente`);
            await fetchTickets();

        } catch (error) {
            console.error("Error procesando ticket:", error);
            Alert.alert("Error", "No se pudo procesar el ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (ticketId: string) => {
        Alert.alert(
            "Eliminar Ticket",
            "¿Estás seguro de que quieres eliminar este ticket?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => {
                        setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
                        Alert.alert("Éxito", "Ticket eliminado correctamente");
                    }
                }
            ]
        );
    };

    const handleViewImage = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setImageModalVisible(true);
    };

    const renderTicketItem = ({ item }: { item: Ticket }) => {
        const isExpanded = expandedSelectors[item.id];
        const isDisabled = item.estado_id !== 1 || isRefreshing;
        const selectedLabel = getSelectedLabel(item.id);

        return (
            <View style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                    <Text style={styles.ticketNumber}>#{item.id}</Text>
                    <Text style={styles.ticketId}>
                        {item.num_ticket || 'Sin número'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado_id) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.estado_id)}</Text>
                    </View>
                </View>

                <View style={styles.ticketInfo}>
                    <Text style={styles.establishment}>
                        {item.establecimiento || 'Establecimiento no identificado'}
                    </Text>
                    <Text style={styles.date}>
                        Fecha: {item.fecha_ticket || item.created_at}
                    </Text>
                    <Text style={styles.amount}>
                        Monto: {item.monto ? `$${item.monto}` : 'No disponible'}
                    </Text>
                    <Text style={styles.cfdi}>
                        Uso CFDI: {item.usoCFDI || 'No especificado'}
                    </Text>
                    
                    {/* Selector de Receptores */}
                    <View style={styles.receptorContainer}>
                        <Text style={styles.receptorLabel}>Receptor:</Text>
                        <View style={styles.selectorWrapper}>
                            <TouchableOpacity
                                style={[
                                    styles.selectorTrigger,
                                    isDisabled && styles.selectorDisabled,
                                    isExpanded && styles.selectorExpanded
                                ]}
                                onPress={() => toggleSelector(item.id)}
                                disabled={isDisabled}
                            >
                                <Text 
                                    style={[
                                        styles.selectorText,
                                        isDisabled && styles.selectorTextDisabled
                                    ]}
                                    numberOfLines={1}
                                >
                                    {selectedLabel}
                                </Text>
                                {!isDisabled && (
                                    <ChevronDown 
                                        size={16} 
                                        color="#374151"
                                        style={[
                                            styles.chevron,
                                            isExpanded && styles.chevronRotated
                                        ]}
                                    />
                                )}
                            </TouchableOpacity>

                            {isExpanded && options.length > 0 && (
                                <View style={styles.dropdown}>
                                    {options.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={[
                                                styles.dropdownOption,
                                                selectedValues[item.id] === opt.value && styles.dropdownOptionSelected
                                            ]}
                                            onPress={() => handleSelectChange(item.id, opt.value)}
                                        >
                                            <Text style={[
                                                styles.dropdownOptionText,
                                                selectedValues[item.id] === opt.value && styles.dropdownOptionTextSelected
                                            ]}>
                                                {opt.label}
                                                {opt.predeterminado && " (Predeterminado)"}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                        {isDisabled && (
                            <Text style={styles.helperText}>
                                Solo editable en estado "Cargado"
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewImage(item.imagen_url)}
                    >
                        <Eye size={20} color="#3b82f6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDownload(item.id)}
                    >
                       <Download size={20} color="#3b82f6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.processButton]}
                        onPress={() => handleProcess(item.id)}
                        disabled={item.estado_id !== 1}
                    >
                        <Send
                            size={20}
                            color={item.estado_id !== 1 ? "#afafafff" : "#000000ff"}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDelete(item.id)}
                        disabled={item.estado_id !== 1}
                    >
                        <Trash2
                            size={20}
                            color={item.estado_id !== 1 ? "#afafafff" : "#ff0000ff"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const ListHeader = () => (
        <View>
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="Buscar por número de ticket o establecimiento..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={styles.searchInput}
                />
            </View>

            {/* Contador de resultados */}
            <Text style={styles.resultsText}>
                {filteredTickets.length} de {tickets.length} tickets
            </Text>
        </View>
    );

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {searchTerm ? "No se encontraron tickets" : "No hay tickets disponibles"}
            </Text>
            {searchTerm && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                    <Text style={styles.clearSearchText}>Limpiar búsqueda</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Cargando tickets...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredTickets}
                renderItem={renderTicketItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={
                    filteredTickets.length === 0 ? styles.emptyListContent : styles.listContent
                }
            />

            {/* Modal para ver imagen */}
            <Modal
                visible={imageModalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setImageModalVisible(false);
                    setSelectedImage(null);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Imagen del Ticket</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setImageModalVisible(false);
                                setSelectedImage(null);
                            }}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalContent}>
                        {selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={styles.modalText}>No hay imagen disponible</Text>
                        )}
                    </View>
                </View>
            </Modal>
            
            <TicketModal
                isOpen={showTicketModal}
                onClose={() => setShowTicketModal(false)}
                ticketId={selectedTicketId}
                procesarTicket={procesarTicket}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },
    emptyListContent: {
        flexGrow: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    searchContainer: {
        marginBottom: 12,
    },
    searchInput: {
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    resultsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    ticketCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    ticketNumber: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    ticketId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3b82f6',
        flex: 1,
        marginHorizontal: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    ticketInfo: {
        marginBottom: 16,
    },
    establishment: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    amount: {
        fontSize: 15,
        fontWeight: '500',
        color: '#059669',
        marginBottom: 4,
    },
    cfdi: {
        fontSize: 14,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    // Estilos para el selector de receptores
    receptorContainer: {
        marginTop: 8,
        marginBottom: 8,
    },
    receptorLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 6,
        color: '#374151',
    },
    selectorWrapper: {
        position: 'relative',
    },
    selectorTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 6,
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    selectorExpanded: {
        borderColor: '#3b82f6',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    selectorDisabled: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    selectorText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    selectorTextDisabled: {
        color: '#9ca3af',
    },
    chevron: {
        marginLeft: 8,
    },
    chevronRotated: {
        transform: [{ rotate: '180deg' }],
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#3b82f6',
        borderTopWidth: 0,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        maxHeight: 150,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownOption: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    dropdownOptionSelected: {
        backgroundColor: '#3b82f6',
    },
    dropdownOptionText: {
        fontSize: 14,
        color: '#374151',
    },
    dropdownOptionTextSelected: {
        color: 'white',
        fontWeight: '500',
    },
    helperText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        backgroundColor: '#f8fafc',
        minWidth: 70,
        alignItems: 'center',
        marginBottom: 4,
    },
    processButton: {
        backgroundColor: '#dbeafe',
    },
    deleteButton: {
        backgroundColor: '#fef2f2',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        justifyContent: 'center',
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    clearSearchText: {
        color: '#3b82f6',
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        color: '#3b82f6',
        fontSize: 16,
    },
    modalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: '80%',
        borderRadius: 8,
    },
});

export default TicketsTable;