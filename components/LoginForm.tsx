import { LOGIN } from "@/app/services/apiConstans";
import requests from "@/app/services/requests";
import { styles } from "@/app/styles/LoginStyles";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (email: string, password: string, setLoading: (val: boolean) => void) => {
    try {
      setLoading(true);

      const response = await requests.post({
        command: LOGIN,
        data: { email, password },
      });

      const { data } = response;

      if (data?.success) {
        const dataSST = {
          SesionSST: true,
          TokenSST: data.token || "",
          IdUsuarioSST: data.data.id || 0,
          NombreSST: data.data.nombre || "",
          ApellidoPSST: data.data.primer_apellido || "",
          ApellidoMSST: data.data.segundo_apellido || "",
          CorreoSST: data.data.email || "",
          RolSST: data.data.rol || "",
          IdRolSST: data.data.id_rol || "",
          TelefonoSST: data.data.telefono || "",
          IdDepartamentoSST: data.data.id_departamento || "",
          DepartamentoSST: data.data.departamento || "",
          SaldoSST: data.data.saldo || "",
          DatosCompletosSST: data.data.datosCompletos || false,
          tienDatoFiscalSST: data.data.tienDatoFiscal || false,
          Password_temporalSST: data.data.password_temporal || false,
          tieneSuscripcionActivaSST: data.data.tieneSuscripcionActiva || false,
        };

        // Guardar en AsyncStorage
        await AsyncStorage.setItem("SesionSSTFull", JSON.stringify(dataSST));

        //Alert.alert("Bienvenido", `Hola ${data.data.nombre}`);
        if (!dataSST.tieneSuscripcionActivaSST) {
          router.replace("/Planes");
        } else if (!dataSST.DatosCompletosSST) {
          router.replace("/datosAlert");
        } else {
          File
          router.replace("/fiscalesAlert");
        }



      } else {
        Alert.alert("Error", data?.message || "Credenciales incorrectas");
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f0f4ff", "#ffffff"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, styles.transparentCard]}>
          <Image
            source={require('@/assets/images/rg-logo.png')}
            style={[styles.logo, styles.largeLogo]}
            resizeMode="contain"
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.subtitle}>Ingresa tus credenciales para acceder</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="correo@ejemplo.com"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#555" style={styles.icon} />
            <TextInput
              placeholder="Ingresa tu contraseña"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#555"
                style={styles.iconRight}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => handleLogin(email, password, setLoading)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => router.push("/register")}>
              {/*Redirige al registro */}
              <Text style={styles.link}>Regístrate aquí</Text>
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 5 }}>•</Text>
            <TouchableOpacity>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>O CONTINÚA CON</Text>

          <TouchableOpacity style={styles.googleButton}>
            <Ionicons name="logo-google" size={20} color="#000" />
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>

          <Text style={styles.legalText}>
            Al continuar, aceptas recibir llamadas, mensajes de WhatsApp o SMS
            realizados por Recupera Gastos y sus afiliadas.
          </Text>
        </View>

        <Text style={styles.footerText}>
          Plataforma segura para la gestión de gastos empresariales
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

