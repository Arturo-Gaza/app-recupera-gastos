import { DATOS_FISCALES_TERCEROS_GETBYID } from "@/app/services/apiConstans";
import requests from "@/app/services/requests";
import { useSession } from "@/hooks/useSession";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface Recipient {
    id: string;
    rfc: string;
    razonSocial: string;
    codigoPostal: string;
    regimenFiscal: string;
    estatus: "Activo" | "Inactivo";
    predeterminado: boolean;
}

export default function RecipientsManagement() {
    const { session } = useSession();
    const userId = session?.IdUsuarioSST;

    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Todos");
    const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const fetchRecipients = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await requests.get({
                command: DATOS_FISCALES_TERCEROS_GETBYID + userId,
            });

            const data = response.data?.data || [];
            const mapped = data.map((item: any) => ({
                id: item.id,
                rfc: item.rfc,
                razonSocial: item.nombre_razon ?? "",
                codigoPostal: item.domicilioFiscal?.codigo_postal ?? "",
                regimenFiscal: item.regimenesFiscales?.[0]?.nombre_regimen ?? "N/A",
                estatus: item.id_estatus_sat === 1 ? "Activo" : "Inactivo",
                predeterminado: item.predeterminado ?? false,
            }));

            setRecipients(mapped);
        } catch (e) {
            console.error(e);
            setError("Error al cargar receptores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipients();
    }, [userId]);

    const filtered = recipients.filter((r) => {
        const matchSearch =
            r.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.razonSocial.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus =
            statusFilter === "Todos" || r.estatus === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleDelete = (id: string) => {
        Alert.alert("Confirmar eliminación", "¿Deseas eliminar este receptor?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Eliminar",
                style: "destructive",
                onPress: async () => {
                    // aquí iría tu función para eliminar
                    setRecipients((prev) => prev.filter((r) => r.id !== id));
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Cargando receptores...</Text>
            </View>
        );
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Administrar Receptores</Text>
            <TouchableOpacity
                style={styles.boton}
                onPress={() => {
                    router.push('/metodoRegistroFiscal')
                }}
            >
                <Text style={styles.botonTexto}>+ Nuevo Receptor</Text>
            </TouchableOpacity>

            <View style={styles.searchContainer}>
                <Icon name="search-outline" size={18} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="Buscar por RFC o Razón Social"
                    style={styles.input}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardRow}>
                            <Text style={styles.label}>RFC:</Text>
                            <Text style={styles.value}>{item.rfc}</Text>
                        </View>
                        <View style={styles.cardRow}>
                            <Text style={styles.label}>Razón Social:</Text>
                            <Text style={styles.value}>{item.razonSocial}</Text>
                        </View>
                        <View style={styles.cardRow}>
                            <Text style={styles.label}>Código Postal:</Text>
                            <Text style={styles.value}>{item.codigoPostal}</Text>
                        </View>
                        <View style={styles.cardRow}>
                            <Text style={styles.label}>Estatus:</Text>
                            <Text
                                style={[
                                    styles.status,
                                    { backgroundColor: item.estatus === "Activo" ? "#28a745" : "#aaa" },
                                ]}
                            >
                                {item.estatus}
                            </Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedRecipient(item);
                                    setShowDetails(true);
                                }}
                            >
                                <Icon name="eye-outline" size={20} color="#007AFF" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => Alert.alert("Editar", "Función de editar")}>
                                <Icon name="create-outline" size={20} color="#666" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Icon name="trash-outline" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Modal Detalles */}
            <Modal visible={showDetails} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Detalles del Receptor</Text>
                        {selectedRecipient && (
                            <>
                                <Text>RFC: {selectedRecipient.rfc}</Text>
                                <Text>Razón Social: {selectedRecipient.razonSocial}</Text>
                                <Text>Código Postal: {selectedRecipient.codigoPostal}</Text>
                                <Text>Régimen: {selectedRecipient.regimenFiscal}</Text>
                                <Text>Estatus: {selectedRecipient.estatus}</Text>
                            </>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowDetails(false)}
                        >
                            <Text style={{ color: "#fff" }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
        marginTop: 10
    },
    input: { flex: 1, height: 40 },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginVertical: 6,
        elevation: 2,
    },
    cardRow: { flexDirection: "row", justifyContent: "space-between" },
    label: { fontWeight: "600", color: "#333" },
    value: { color: "#555", maxWidth: "60%" },
    status: {
        color: "#fff",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        textAlign: "center",
        minWidth: 70,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 10,
        gap: 15,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: { color: "red", textAlign: "center" },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
    closeButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
    },
    boton: {
        backgroundColor: "#1A2A6C",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        width: 150,
        marginLeft: 200
    },
    botonTexto: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});
