import { useSession } from "@/src/hooks/useSession";
import { USUARIO_FINAL_UPDATE } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Home, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// --- Validaciones
const validateApellido = (value: string) =>
  /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(value) ? "Solo letras permitidas" : "";

const validateRFC = (rfc: string) =>
  /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/.test(rfc.toUpperCase());

const validatePostalCode = (cp: string) =>
  !/^\d{5}$/.test(cp) ? "Debe tener 5 dígitos" : "";

export default function PersonalForm() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { updateSession } = useSession();
  const [personalData, setPersonalData] = useState({
    nombre_razon: "",
    primer_apellido: "",
    segundo_apellido: "",
    rfc: "",
    curp: "",
    direccion: {
      calle: "",
      num_exterior: "",
      num_interior: "",
      codigo_postal: "",
      colonia: "",
      localidad: "",
      municipio: "",
      estado: "",
    },
  });

  const [session, setSession] = useState<any>(null);

  // Cargar sesión
  useEffect(() => {
    const loadSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem("SesionSSTFull");
        if (sessionData) setSession(JSON.parse(sessionData));
      } catch (error) {
        console.error("Error al cargar sesión:", error);
      }
    };
    loadSession();
  }, []);

  const handleNext = () => {
    if (step === 1) {
      if (!personalData.nombre_razon || !personalData.primer_apellido || !personalData.rfc) {
        Alert.alert("Campos obligatorios", "Completa los datos personales requeridos.");
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let usuarioId = 0;
      if (session) usuarioId = session.IdUsuarioSST || 0;

      const datosAEnviar = {
        ...personalData,
        id_usuario: usuarioId,
      };

      const response = await requests.post({
        command: USUARIO_FINAL_UPDATE,
        data: datosAEnviar,
      });

      const responseData = response.data;

      if (responseData?.success) {
        await updateSession({
          NombreSST: responseData.data.nombre || "",
          ApellidoPSST: responseData.data.apellido_p || "",
          ApellidoMSST: responseData.data.apellido_m || "",
          TelefonoSST: responseData.data.telefono || "",
          DatosCompletosSST: true, // si ya están completos los datos
        });
        setStep(3); // ← mostrar step de éxito
      } else {
        Alert.alert("Error", responseData?.message || "No se pudo registrar la información.");
      }
    } catch (error) {
      console.error("Error al guardar datos:", error);
      Alert.alert("Error", "Ocurrió un problema al enviar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // --- Step de éxito
  const renderSuccessStep = () => (
    <View style={styles.section}>
      {/* Logo */}
      <Image
        source={require("@/assets/images/rg-logo.png")}
        style={[styles.logo2, styles.largeLogo2]}
        resizeMode="contain"
      />
      <View style={[styles.card, { alignItems: "center", justifyContent: "center" }]}>

        {/* Icono */}
        <Text style={{ fontSize: 50, color: "green", marginBottom: 16 }}>✓</Text>

        <Text style={{ fontSize: 18, fontWeight: "bold", color: "green", marginBottom: 8 }}>
          ¡Información Personal Guardada con Éxito!
        </Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 16, textAlign: "center" }}>
          Tu información personal ha sido registrada.
        </Text>

        {/* Datos registrados */}
        <View style={{ backgroundColor: "#f0f0f0", padding: 12, borderRadius: 8, marginBottom: 16, width: "100%" }}>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Datos registrados:</Text>
          <Text>• Nombre: {personalData.nombre_razon} {personalData.primer_apellido} {personalData.segundo_apellido}</Text>
          <Text>• RFC: {personalData.rfc}</Text>
          <Text>• Dirección: {personalData.direccion.calle} {personalData.direccion.num_exterior}</Text>
        </View>

        {/* Botones según rol */}
        {session && Number(session.IdRolSST) === 2 && (
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <TouchableOpacity
              style={[styles.button, { flex: 1, backgroundColor: "#fff", borderWidth: 1, borderColor: "#1A2A6C" }]}
              onPress={() => router.replace("/dashboard")}
            >
              <Text style={{ color: "#1A2A6C", fontWeight: "bold" }}>Lo haré después</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={() => router.push('/metodoRegistroFiscal')}
              disabled={loading}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>¡Completar Datos Fiscales Ahora!</Text>
            </TouchableOpacity>
          </View>
        )}

        {session && Number(session.IdRolSST) === 3 && (
          <TouchableOpacity
            style={[styles.button, { flex: 1 }]}
            onPress={() => console.log("Continuar")}
          >
            <Text style={{ color: "#FFF", fontWeight: "bold" }}>Continuar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          // --- Datos personales
          <View style={styles.section}>
            <View style={[styles.card, styles.transparentCard]}>
              <Image
                source={require("@/assets/images/rg-logo.png")}
                style={[styles.logo, styles.largeLogo]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <User color="#007AFF" size={20} />
                <Text style={styles.sectionTitle}>Datos Personales</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Nombre(s) *</Text>
                <TextInput
                  style={styles.input}
                  value={personalData.nombre_razon}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  onChangeText={(value) =>
                    setPersonalData((prev) => ({ ...prev, nombre_razon: value }))
                  }
                  placeholder="Nombre completo"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Primer Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={personalData.primer_apellido}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  onChangeText={(value) =>
                    setPersonalData((prev) => ({ ...prev, primer_apellido: value }))
                  }
                  placeholder="Apellido paterno"
                />
                {personalData.primer_apellido &&
                  validateApellido(personalData.primer_apellido) && (
                    <Text style={styles.errorText}>
                      {validateApellido(personalData.primer_apellido)}
                    </Text>
                  )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Segundo Apellido</Text>
                <TextInput
                  style={styles.input}
                  value={personalData.segundo_apellido}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  onChangeText={(value) =>
                    setPersonalData((prev) => ({ ...prev, segundo_apellido: value }))
                  }
                  placeholder="Apellido materno"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>RFC *</Text>
                <TextInput
                  style={styles.input}
                  value={personalData.rfc}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  onChangeText={(value) =>
                    setPersonalData((prev) => ({ ...prev, rfc: value.toUpperCase() }))
                  }
                  placeholder="XXXX000000XXX"
                  maxLength={13}
                  autoCapitalize="characters"
                />
                {personalData.rfc && !validateRFC(personalData.rfc) && (
                  <Text style={styles.errorText}>
                    Formato inválido: 4 letras + fecha real (AAMMDD) + 3 caracteres
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>CURP</Text>
                <TextInput
                  style={styles.input}
                  value={personalData.curp}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  onChangeText={(value) =>
                    setPersonalData((prev) => ({ ...prev, curp: value.toUpperCase() }))
                  }
                  placeholder="XXXX000000XXXXXXXX"
                  maxLength={18}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          // --- Domicilio
          <View style={styles.section}>
            <View style={[styles.card, styles.transparentCard]}>
              <Image
                source={require("@/assets/images/rg-logo.png")}
                style={[styles.logo, styles.largeLogo]}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardPersonal}>
              <View style={styles.sectionHeader}>
                <Home color="#007AFF" size={20} />
                <Text style={styles.sectionTitle}>Domicilio Personal</Text>
              </View>

              {Object.keys(personalData.direccion).map((key) => (
                <View key={key} style={styles.field}>
                  <Text style={styles.label}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={(personalData.direccion as any)[key]}
                    placeholderTextColor="rgba(0, 0, 0, 0.3)"
                    onChangeText={(value) =>
                      setPersonalData((prev) => ({
                        ...prev,
                        direccion: { ...prev.direccion, [key]: value },
                      }))
                    }
                    placeholder={key === "codigo_postal" ? "12345" : ""}
                    keyboardType={key === "codigo_postal" ? "numeric" : "default"}
                    maxLength={key === "codigo_postal" ? 5 : 149}
                  />
                  {key === "codigo_postal" &&
                    personalData.direccion.codigo_postal &&
                    validatePostalCode(personalData.direccion.codigo_postal) && (
                      <Text style={styles.errorText}>
                        {validatePostalCode(personalData.direccion.codigo_postal)}
                      </Text>
                    )}
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 3 && renderSuccessStep()}

        {/* Botones */}
        {step !== 3 && (
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.buttonText}>Atrás</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{step === 1 ? "Continuar" : "Enviar"}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF"
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    paddingBottom: 8,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF"
  },
  field: {
    marginBottom: 12
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16
  },
  errorText: {
    fontSize: 12,
    color: "#E53935",
    marginTop: 4
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 30
  },
  button: {
    flex: 1,
    backgroundColor: "#1A2A6C",
    borderRadius: 8,
    padding: 14,
    alignItems: "center"
  },
  backButton: { flex: 1, backgroundColor: "#404040ff", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonDisabled: { backgroundColor: "#A0A0A0" },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  transparentCard: { backgroundColor: "transparent", shadowOpacity: 0, elevation: 0, borderWidth: 0, marginTop: -55, marginLeft: 85 },
  logo: { width: 200, height: 100, marginBottom: 30, marginTop: 65, marginLeft: -45 },
  largeLogo: { width: 300 * 0.8, height: 150 * 0.8, marginBottom: 30 },
  cardPersonal: { width: "99%", backgroundColor: "#fff", borderRadius: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, marginTop: -45 },
  card: { width: "99%", backgroundColor: "#fff", borderRadius: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, marginTop: 0 },
  logo2: { width: 200, height: 100, marginBottom: 30, marginTop: 65, marginLeft: 55 },
  largeLogo2: { width: 300 * 0.8, height: 150 * 0.8, marginBottom: 30 },
});
