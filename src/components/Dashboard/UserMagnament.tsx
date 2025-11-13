// UsersManagement.tsx
import { useSession } from "@/src/hooks/useSession";
import {
    AGRAGAR_USUARIO_HIJO,
    BLOQUEAR_COLABORADOR,
    COLABORADORES_GETBYID,
    ELIMINAR_COLABORADOR,
} from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { AddColaborador } from "../Modales/AddColaborador";

interface User {
    id: string;
    correo: string;
    nombre: string;
    rfcReceptor: string;
    razonSocialReceptor: string;
    estatus: "Activo" | "Inactivo" | "Bloqueado" | "En Proceso";
}

export const UsersManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showConfirmBlock, setShowConfirmBlock] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [userToBlock, setUserToBlock] = useState<string | null>(null);

    const { session, loading: sessionLoading } = useSession();

    // Asegurar que id_usuario sea string y manejar undefined
    const id_usuario = session?.IdUsuarioSST ? String(session.IdUsuarioSST) : "";
    const emailPadre = session?.CorreoSST || "";

    const colaboradoresGetAll = async (id_usuario: string) => {
        if (!id_usuario) {
            console.error("ID de usuario no disponible");
            return;
        }

        setLoading(true);
        try {
            const response = await requests.get({
                command: COLABORADORES_GETBYID + id_usuario
            });
            const usuarios = response.data?.data || [];

            console.log("Colaboradores", usuarios)
            const mappedUsers: User[] = usuarios.map((usuario: any) => ({
                id: String(usuario.id),
                correo: usuario.email,
                nombre: usuario.nombre ?? "N/A",
                rfcReceptor: usuario.rfcPrincipal ?? "N/A",
                razonSocialReceptor: usuario.razonSocialPrincipal ?? "N/A",
                estatus: !usuario.datosCompletos
                    ? "En Proceso"
                    : usuario.id_estatus_usuario === 1
                        ? "Activo"
                        : usuario.id_estatus_usuario === 2
                            ? "Bloqueado"
                            : "Desconocido",
            }));

            setUsers(mappedUsers);
        } catch (err) {
            console.error("Error cargando usuarios", err);
            Alert.alert("Error", "No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id_usuario) {
            colaboradoresGetAll(id_usuario);
        }
    }, [id_usuario]);

    const handleAddUser = async (data: any) => {
        try {
            await requests.post({
                command: AGRAGAR_USUARIO_HIJO,
                data,
            });
            Alert.alert("Éxito", "Usuario agregado correctamente");
            if (id_usuario) {
                await colaboradoresGetAll(id_usuario);
            }
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
        }
    };

    const handleDeleteUser = async (correo: string) => {
        try {
            await requests.post({
                command: ELIMINAR_COLABORADOR,
                data: { email_padre: emailPadre, email_hijo: correo },
            });
            Alert.alert("Éxito", "Usuario eliminado correctamente");
            if (id_usuario) {
                await colaboradoresGetAll(id_usuario);
            }
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
        }
    };

    const handleBlockUser = async (correo: string) => {
        try {
            await requests.post({
                command: BLOQUEAR_COLABORADOR,
                data: { email_padre: emailPadre, email_hijo: correo },
            });
            Alert.alert("Éxito", "Usuario bloqueado correctamente");
            if (id_usuario) {
                await colaboradoresGetAll(id_usuario);
            }
        } catch (err: any) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Activo":
                return "#22c55e"; // verde
            case "En Proceso":
                return "#facc15"; // amarillo
            case "Bloqueado":
                return "#ef4444"; // rojo
            default:
                return "#9ca3af"; // gris
        }
    };

    if (loading || sessionLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Cargando usuarios...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Administrar mis usuarios</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <MaterialCommunityIcons name="plus" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Usuario</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.table}>
                {users.map((user) => (
                    <View key={user.id} style={styles.userCard}>
                        <View style={styles.userHeader}>
                            <Text style={styles.userName}>Nombre: {user.nombre}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.estatus) }]}>
                                <Text style={styles.statusText}>{user.estatus}</Text>
                            </View>
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={styles.userEmail}>Correo: {user.correo}</Text>
                            <Text style={styles.userSubtext}>Razon Social: {user.razonSocialReceptor}</Text>
                            <Text style={styles.userSubtext}>RFC: {user.rfcReceptor}</Text>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    setUserToBlock(user.correo);
                                    setShowConfirmBlock(true);
                                }}
                            >
                                <MaterialCommunityIcons
                                    name={
                                        user.estatus === "Activo" ? "lock-outline" : "lock-open-outline"
                                    }
                                    size={20}
                                    color="#555"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => {
                                    setSelectedUserId(Number(user.id));
                                    setShowAddModal(true);
                                }}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={20} color="#555" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => {
                                    setUserToDelete(user.correo);
                                    setShowConfirmDelete(true);
                                }}
                            >
                                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#dc2626" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Modal agregar/editar usuario */}
            <AddColaborador
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setSelectedUserId(null);
                }}
                title={selectedUserId ? "Editar Usuario" : "Agregar Usuario"}
                description={
                    selectedUserId
                        ? "Modifica los receptores asignados al usuario"
                        : "Ingresa el correo y selecciona los receptores para el nuevo usuario"
                }
                confirmText={selectedUserId ? "Actualizar" : "Agregar"}
                cancelText="Cancelar"
                id_usuario={id_usuario}
                onConfirm={handleAddUser}
                isEdit={!!selectedUserId}
                initialEmail={
                    selectedUserId
                        ? users.find(user => Number(user.id) === selectedUserId)?.correo || ""
                        : ""
                }
            />

            {/* Confirmar eliminar */}
            <Modal visible={showConfirmDelete} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Eliminar usuario</Text>
                        <Text>¿Deseas eliminar este usuario?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowConfirmDelete(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => {
                                    if (userToDelete) {
                                        handleDeleteUser(userToDelete);
                                    }
                                    setShowConfirmDelete(false);
                                }}
                            >
                                <Text style={styles.confirmText}>Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirmar bloqueo */}
            <Modal visible={showConfirmBlock} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>
                            {users.find(u => u.correo === userToBlock)?.estatus === "Activo"
                                ? "Bloquear usuario"
                                : "Desbloquear usuario"}
                        </Text>
                        <Text>
                            {users.find(u => u.correo === userToBlock)?.estatus === "Activo"
                                ? "¿Deseas bloquear este usuario?"
                                : "¿Deseas desbloquear este usuario?"}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowConfirmBlock(false)}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => {
                                    if (userToBlock) {
                                        handleBlockUser(userToBlock);
                                    }
                                    setShowConfirmBlock(false);
                                }}
                            >
                                <Text style={styles.confirmText}>
                                    {users.find(u => u.correo === userToBlock)?.estatus === "Activo"
                                        ? "Bloquear"
                                        : "Desbloquear"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// Los estilos se mantienen igual...
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { marginTop: 8, color: "#555" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "bold" },
    addButton: {
        flexDirection: "row",
        backgroundColor: "#1A2A6C",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
    
    // Nuevos estilos para la tabla tipo card
    table: { marginTop: 16 },
    userCard: {
        backgroundColor: "#f9fafb",
        padding: 16,
        marginBottom: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    userHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    userName: { 
        fontWeight: "bold", 
        fontSize: 16,
        flex: 1,
        marginRight: 8
    },
    userInfo: {
        marginBottom: 12,
    },
    userEmail: { 
        color: "#000000ff", 
        fontSize: 14,
        marginBottom: 4
    },
    userSubtext: { 
        color: "#000000ff", 
        fontSize: 12,
        marginBottom: 2
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    statusText: { 
        color: "#fff", 
        fontWeight: "600",
        fontSize: 12
    },
    actions: { 
        flexDirection: "row", 
        justifyContent: "flex-end",
        gap: 12
    },
    actionButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: "#f3f4f6",
    },
    deleteButton: {
        backgroundColor: "#fef2f2",
    },
    
    // Estilos modales (se mantienen igual)
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        width: "80%",
    },
    modalTitle: { fontWeight: "bold", fontSize: 18, marginBottom: 10 },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 15 },
    cancelButton: { marginRight: 10 },
    cancelText: { color: "#6b7280" },
    confirmButton: { backgroundColor: "#dc2626", padding: 8, borderRadius: 6 },
    confirmText: { color: "#fff", fontWeight: "bold" },
});