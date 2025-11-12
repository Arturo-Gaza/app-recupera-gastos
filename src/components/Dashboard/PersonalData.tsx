import { useSession } from "@/src/hooks/useSession";
import { DATOS_PEROSNALES_UPDATE, DATOS_PERSONALES } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PersonalDataManagement() {
    const { session, loading: sessionLoading } = useSession();
    const userId = session?.IdUsuarioSST;

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [personalData, setPersonalData] = useState({
        nombres: "",
        primerApellido: "",
        segundoApellido: "",
        calle: "",
        numeroExterior: "",
        numeroInterior: "",
        colonia: "",
        codigoPostal: "",
        alcaldia: "",
        entidadFederativa: "",
        enviar_correo: false,
    });

    const handleInputChange = (field: string, value: string) => {
        setPersonalData((prev) => ({ ...prev, [field]: value }));
    };

    const validateData = () => {
        if (!personalData.nombres.trim()) return "El campo Nombre(s) es obligatorio";
        if (!personalData.primerApellido.trim()) return "El campo Primer Apellido es obligatorio";
        if (personalData.codigoPostal && !/^\d{5}$/.test(personalData.codigoPostal))
            return "El Código Postal debe tener 5 dígitos numéricos";
        return null;
    };

    const fetchPersonalData = async () => {
        if (session?.IdUsuarioSST) {
            try {
                setLoading(true);
                setError(null);
                setMessage(null);

                const response = await requests.get({
                    command: DATOS_PERSONALES + userId,
                });

                const user = response.data?.data;

                if (!user) {
                    setError("No se encontraron datos personales");
                    return;
                }

                setPersonalData({
                    nombres: user.nombre ?? "",
                    primerApellido: user.primer_apellido ?? "",
                    segundoApellido: user.segundo_apellido ?? "",
                    calle: user.direccionPersonal?.calle ?? "",
                    numeroExterior: user.direccionPersonal?.num_exterior ?? "",
                    numeroInterior: user.direccionPersonal?.num_interior ?? "",
                    colonia: user.direccionPersonal?.colonia ?? "",
                    codigoPostal: user.direccionPersonal?.codigo_postal ?? "",
                    alcaldia: user.direccionPersonal?.municipio ?? "",
                    entidadFederativa: user.direccionPersonal?.estado ?? "",
                    enviar_correo: user.enviar_correo ?? false,
                });
            } catch (err) {
                console.error(err);
                setError("Error al cargar datos personales");
            } finally {
                setLoading(false);
            }
        }

    };

    const handleSave = async () => {
        const validationError = validateData();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setMessage(null);

            await requests.put({
                command: DATOS_PEROSNALES_UPDATE + userId,
                data: {
                    nombre: personalData.nombres,
                    primer_apellido: personalData.primerApellido,
                    segundo_apellido: personalData.segundoApellido,
                    enviar_correo: personalData.enviar_correo,
                    direccionPersonal: {
                        calle: personalData.calle,
                        num_exterior: personalData.numeroExterior,
                        num_interior: personalData.numeroInterior,
                        colonia: personalData.colonia,
                        municipio: personalData.alcaldia,
                        estado: personalData.entidadFederativa,
                        codigo_postal: personalData.codigoPostal,
                    },
                },
            });
            Alert.alert("Datos actualizados correctamente")
            fetchPersonalData();
        } catch (err) {
            console.error(err);
            setError("No se pudieron actualizar los datos");
        } finally {
            setLoading(false);
        }
    };

   useEffect(() => {
  if (session?.IdUsuarioSST) {
    fetchPersonalData();
  }
}, [session]);

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loaderText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Administrar mis datos personales</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}
            {message && <Text style={styles.successText}>{message}</Text>}

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Información Personal</Text>

                <Text style={styles.label}>Nombre(s)*</Text>
                <TextInput
                    style={styles.input}
                    value={personalData.nombres}
                    onChangeText={(v) => handleInputChange("nombres", v)}
                />

                <Text style={styles.label}>Primer Apellido*</Text>
                <TextInput
                    style={styles.input}
                    value={personalData.primerApellido}
                    onChangeText={(v) => handleInputChange("primerApellido", v)}
                />

                <Text style={styles.label}>Segundo Apellido</Text>
                <TextInput
                    style={styles.input}
                    value={personalData.segundoApellido}
                    onChangeText={(v) => handleInputChange("segundoApellido", v)}
                />

                {Number(session?.IdRolSST) === 2 && (
                    <View style={styles.checkboxRow}>
                        <Checkbox
                            value={personalData.enviar_correo}
                            onValueChange={(checked) =>
                                setPersonalData((prev) => ({ ...prev, enviar_correo: checked }))
                            }
                        />
                        <Text style={styles.checkboxLabel}>
                            ¿Quieres recibir las facturas por correo electrónico?
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Dirección</Text>

                {[
                    ["Calle", "calle"],
                    ["Número Exterior", "numeroExterior"],
                    ["Número Interior", "numeroInterior"],
                    ["Colonia", "colonia"],
                    ["Código Postal*", "codigoPostal"],
                    ["Alcaldía/Municipio", "alcaldia"],
                    ["Entidad Federativa", "entidadFederativa"],
                ].map(([label, field]) => (
                    <View key={field}>
                        <Text style={styles.label}>{label}</Text>
                        <TextInput
                            style={styles.input}
                            value={(personalData as any)[field]}
                            onChangeText={(v) => handleInputChange(field, v)}
                            keyboardType={field === "codigoPostal" ? "numeric" : "default"}
                            maxLength={field === "codigoPostal" ? 5 : undefined}
                        />
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.button, loading && { backgroundColor: "#ccc" }]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.buttonText}>{loading ? "Guardando..." : "Guardar Cambios"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    loaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
    },
    loaderText: {
        marginTop: 10,
        fontSize: 14,
        color: "#666",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: "#555",
        marginTop: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: "#333",
        flex: 1,
        flexWrap: "wrap",
    },
    button: {
        backgroundColor: "#007AFF",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    errorText: {
        color: "red",
        marginBottom: 10,
    },
    successText: {
        color: "green",
        marginBottom: 10,
    },
});
