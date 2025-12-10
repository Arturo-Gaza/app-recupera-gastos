import { LOGIN } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import { styles } from "@/src/styles/LoginStyles";
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


import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import ErrorModal from "../Modales/ModalPassword";

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: "120298799063-liofb50it50njvmfmooclstgkqcpnhmo.apps.googleusercontent.com"
});



WebBrowser.maybeCompleteAuthSession();

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const redirectUri = AuthSession.makeRedirectUri();
  const [modalVisible, setModalVisible] = useState(false);


  // ------------------------------------------------------------------
  //LOGIN CON GOOGLE (COMPLETO)
  // ------------------------------------------------------------------
  const [userInfo, setUserInfo] = useState<any>(null);
  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setUserInfo(response.data);
        console.log("Ver error", response.data)
      } else {
        console.log("sing in was cancelled by user")
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert("sing in is in progress")
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Play services not available")
            break;
          default:
        }
      } else {
        Alert.alert("an error that's not related to google sing in occurred")
      }
    }
  };

  const handleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      setUserInfo(null);
      Alert.alert("Logged Out", "You have been signed out.")
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out")
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "recupergastos",
      });

      const authUrl = `http://192.168.1.171:8000/auth/google?redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== "success") {
        Alert.alert("Aviso", "Inicio de sesión cancelado");
        return;
      }

      const url = result.url;
      const urlObj = new URL(url);

      const token = urlObj.searchParams.get("token");
      const user = JSON.parse(urlObj.searchParams.get("user") || "{}");

      if (!token) {
        Alert.alert("Error", "No se recibió token desde el servidor.");
        return;
      }
      // Guardar sesión igual que el login normal (ajústalo a tus campos)
      const dataSST = {
        SesionSST: true,
        TokenSST: token,
        IdUsuarioSST: user.id || 0,
        NombreSST: user.nombre || "",
        ApellidoPSST: user.primer_apellido || "",
        ApellidoMSST: user.segundo_apellido || "",
        CorreoSST: user.email || "",
        RolSST: user.rol || "",
        IdRolSST: user.id_rol || "",
        TelefonoSST: user.telefono || "",
        IdDepartamentoSST: user.id_departamento || "",
        DepartamentoSST: user.departamento || "",
        SaldoSST: user.saldo || "",
        DatosCompletosSST: user.datosCompletos || false,
        tienDatoFiscalSST: user.tienDatoFiscal || false,
        Password_temporalSST: user.password_temporal || false,
        tieneSuscripcionActivaSST: user.tieneSuscripcionActiva || false,
        IdPlanSST: user.suscripcionActiva?.id_plan || null,
        TipoPagoSST: user.suscripcionActiva?.plan?.tipo_pago || null
      };

      await AsyncStorage.setItem("SesionSSTFull", JSON.stringify(dataSST));

      // MISMA LÓGICA QUE TU LOGIN NORMAL
      if (!dataSST.tieneSuscripcionActivaSST) return router.replace("/Planes");
      if (!dataSST.DatosCompletosSST) return router.replace("/datosAlert");
      if (!dataSST.tienDatoFiscalSST) return router.replace("/fiscalesAlert");

      router.replace("/dashboard");
    } catch (error) {
      console.log("Error Google:", error);
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
    }
  };


  // ------------------------------------------------------------------
  const handleLogin = async () => {
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
          IdPlanSST: data.data.suscripcionActiva?.id_plan || null,
          TipoPagoSST: data.data.suscripcionActiva?.plan?.tipo_pago || null,
          FechaVeigenciaSST: data.data.suscripcionActiva?.fecha_vencimiento || null
        };

        await AsyncStorage.setItem("SesionSSTFull", JSON.stringify(dataSST));

        console.log("la sesion es fuera", dataSST.Password_temporalSST);

        if (!dataSST.tieneSuscripcionActivaSST) {
          router.replace("/Planes");
        } else if (dataSST.Password_temporalSST === true) {
          console.log("la sesion es", dataSST.Password_temporalSST);
          router.replace("/(auth)/AlertColaboradorScreen");
        }
        else if (!dataSST.DatosCompletosSST) {
          router.replace("/datosAlert");
        } else if (!dataSST.tienDatoFiscalSST) {
          router.replace("/fiscalesAlert");

        } else {
          router.replace("/dashboard");
        }

      } else {
        Alert.alert("Aviso", data?.message);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message;

      setModalVisible(true)
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
              placeholderTextColor="#6B7280"
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
              placeholderTextColor="#6B7280"
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
            onPress={handleLogin}
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
              <Text style={styles.link}>Regístrate aquí</Text>
            </TouchableOpacity >
            <Text style={{ marginHorizontal: 5 }}>•</Text>
            <TouchableOpacity onPress={() => router.push("/forgotPassword")}>
              <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          {/* <Text style={styles.orText}>O CONTINÚA CON</Text>

          {userInfo ? (<View style={styles.container}>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={{ color: "Black" }}>
                {JSON.stringify(userInfo, null, 2)}
              </Text>
            </ScrollView>

            <Button title="Sing out" onPress={handleLogout} />
          </View>) : (
            <TouchableOpacity style={styles.googleButton} onPress={signIn}>
              <Ionicons name="logo-google" size={20} color="#000" />
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>
          )} */}

          <Text style={styles.legalText}>
            Al continuar, aceptas recibir llamadas, mensajes de WhatsApp o SMS
            realizados por Recupera Gastos y sus afiliadas.
          </Text>
        </View>
       

        <Text style={styles.footerText}>
          Plataforma segura para la gestión de gastos empresariales
        </Text>
      </ScrollView>

      <ErrorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onForgotPassword={() => {
          setModalVisible(false);
          router.push('/forgotPassword');
        }}

      />
    </LinearGradient>


  );
}


