import { useSession } from "@/src/hooks/useSession";
import { ACTUALIZAR_RECEPTOR, ELIMINAR_TICKET, IMAGEN_TICKET, PROCESAR_TICKET, RECEPTORES_BYUSER, USUARIO_GETBY_ID } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import { styles } from '@/src/styles/TableTicketsStyle';
import { router } from "expo-router";
import { CheckCircle, ChevronDown, Download, Eye, Send, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    DeviceEventEmitter,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import TicketModal from "../Modales/ModalTicket";
import ViewInvoiceDocumentsModal from "../Modales/VerDocumentosFacturas";



// Interface basada en tu respuesta real de API
interface Ticket {
    id: string;
    num_ticket: string | null;
    establecimiento: string | null;
    fecha_ticket: string | null;
    fechaHora: string | null;
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
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    // Estados para el selector de receptores
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedValues, setSelectedValues] = useState<{ [ticketId: string]: string }>({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedSelectors, setExpandedSelectors] = useState<{ [ticketId: string]: boolean }>({});
    const { session, loading: sessionLoading, updateSession, refreshSession } = useSession();
    const userId = session?.IdUsuarioSST || 0;
    const [imagenModalVisible, setImagenModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showFacturaModal, setShowFacturaModal] = useState(false);




    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await requests.post({
                command: USUARIO_GETBY_ID,
                data: {
                    fecha_inicio: "",
                    fecha_fin: "",
                    usuario_id: userId
                }
            });

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
                id_receptor: ticket.id_receptor
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
            const response = await requests.get({
                command: RECEPTORES_BYUSER + userId
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

                const initialSelectedValues: { [ticketId: string]: string } = {};
                tickets.forEach(ticket => {
                    initialSelectedValues[ticket.id] = String(ticket.id_receptor) || "5";
                });
                setSelectedValues(initialSelectedValues);
            }
        } catch (error) {
            console.error("Error al cargar receptores:", error);

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
        if (session?.IdUsuarioSST) {
            fetchTickets();
        }
    }, [session]);

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
            case 2: return 'En Revisión';
            case 3: return 'Asignado';
            case 4: return 'Visualizado';
            case 5: return 'Procesando';
            case 6: return 'Recuperado';
            case 7: return 'Rechazado';
            case 8: return 'Descargado';
            case 9: return 'Concluido';
            default: return '';
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


// En TableTickets.tsx


const procesarTicket = async (ticketId: string) => {
    try {
        setLoading(true);
        
        const response = await requests.get({
            command: PROCESAR_TICKET + ticketId,
        });

        const nuevoSaldo = response.data?.data;

        if (nuevoSaldo !== undefined && nuevoSaldo !== null) {
            
            
            //Actualizar la sesión
            await updateSession({
                SaldoSST: Number(nuevoSaldo)
            });
            
            //REFRESCAR la sesión completamente
            await refreshSession();
            
            //Emitir evento para notificar a Dashboard
            DeviceEventEmitter.emit('sessionUpdated', { 
                saldo: nuevoSaldo,
                timestamp: Date.now()
            });
            
            //Mostrar alerta
            Alert.alert("Éxito", `Ticket procesado correctamente`);
            
            //Refrescar tickets
            await fetchTickets();
            
            //Navegar al dashboard
            router.push("/dashboard");
        }
        
    } catch (error: any) {
        console.error("Error:", error);
        Alert.alert("Error", "No se pudo procesar el ticket");
    } finally {
        setLoading(false);
    }
};


    const eliminarTicket = async (ticketId: string) => {
        try {
            setLoading(true);
            const response = await requests.get({
                command: ELIMINAR_TICKET + ticketId,
            });

            await fetchTickets();

        } catch (error) {
            console.error("Error eliminando ticket:", error);
            Alert.alert("Error", "No se pudo eliminar el ticket");
        } finally {
            setLoading(false);
        }
    }

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
                        eliminarTicket(ticketId);
                        Alert.alert("Éxito", "Ticket eliminado correctamente");
                    }
                }
            ]
        );
    };

    const handleFactura = (ticketId: string) => {
        setSelectedTicketId(ticketId);
        setShowFacturaModal(true);
    };

    const handleViewImage = async (ticketId: string) => {
        if (!ticketId) return;

        setLoading(true);
        setImageModalVisible(true);

        try {
            const response = await requests.get({
                command: IMAGEN_TICKET + ticketId,
            });

            const result = response.data;

            if (result?.data) {
                setSelectedImage(`data:image/jpeg;base64,${result.data}`);
            } else {
                Alert.alert("No se encontro la imagen");
                setSelectedImage(null);
            }
        } catch (error) {
            console.error("Error al cargar la imagen:", error);
            setSelectedImage(null);
        } finally {
            setLoading(false);
        }
        //setSelectedImage(imageUrl);
        //setImageModalVisible(true);
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
                        Fecha Ticket: {item.fecha_ticket}
                    </Text>
                    <Text style={styles.date}>
                        Fecha y Hora: {item.created_at}
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

                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewImage(item.id)}
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
                        disabled={item.estado_id !== 1 || item.id_receptor === null }
                    >
                        <Send
                            size={20}
                            color={item.estado_id !== 1 || item.id_receptor === null ? "#afafafff" : "#000000ff"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.processButton]}
                        onPress={() => handleFactura(item.id)}
                        disabled={[1, 2, 3, 4, 5, 6, 7, 8, 10, 11].includes(item.estado_id)}
                    >
                        <CheckCircle
                            size={20}
                            color={![1, 2, 3, 4, 5, 6, 7, 8, 10, 11].includes(item.estado_id) ? "#000000ff" : "#717171ff"}
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
                    placeholderTextColor="#6B7280"
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
                scrollEnabled={false}
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
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.modalText}>Cargando imagen...</Text>
                            </View>
                        ) : selectedImage ? (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.image}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.noImageContainer}>
                                <Text style={styles.modalText}>No hay imagen disponible</Text>
                            </View>
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
            <ViewInvoiceDocumentsModal
                open={showFacturaModal}
                onOpenChange={setShowFacturaModal}
                ticketid={selectedTicketId}
            />
        </View>
    );
};

export default TicketsTable;