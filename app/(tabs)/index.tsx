import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // Cambio aquí
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu correo y contraseña");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://192.168.1.169:8000/api/auth/login", { email, password });
      
      if (response.data.success) {
        await AsyncStorage.setItem("userSession", JSON.stringify(response.data.data));
        Alert.alert("Bienvenido", `Hola ${response.data.data.nombre}`);
        // redirigir al dashboard - puedes usar:
        // router.replace("/dashboard");
      } else {
        Alert.alert("Error", response.data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#f0f4ff", "#ffffff"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            style={[
              styles.button, 
              loading && styles.buttonDisabled
            ]} 
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
            <TouchableOpacity>
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
            Al continuar, aceptas recibir llamadas, mensajes de WhatsApp o SMS realizados por Recupera Gastos y sus afiliadas.
          </Text>
        </View>

        <Text style={styles.footerText}>Plataforma segura para la gestión de gastos empresariales</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 40 
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
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 5 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#666", 
    textAlign: "center", 
    marginBottom: 20 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 8, 
    marginBottom: 15, 
    paddingHorizontal: 10 
  },
  icon: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
  input: { 
    flex: 1, 
    height: 40, 
    color: "#000" 
  },
  button: { 
    backgroundColor: "#1A2A6C", 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: "center", 
    marginTop: 10 
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  linksContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 10 
  },
  link: { 
    color: "#1A2A6C", 
    textDecorationLine: "underline" 
  },
  orText: { 
    textAlign: "center", 
    color: "#888", 
    marginVertical: 15, 
    fontSize: 12 
  },
  googleButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    borderWidth: 1, 
    borderColor: "#ddd", 
    borderRadius: 8, 
    paddingVertical: 10 
  },
  googleButtonText: { 
    marginLeft: 8, 
    fontWeight: "bold", 
    color: "#000" 
  },
  legalText: { 
    fontSize: 10, 
    color: "#888", 
    textAlign: "center", 
    marginTop: 10 
  },
  footerText: { 
    fontSize: 12, 
    color: "#888", 
    textAlign: "center", 
    marginTop: 20 
  },
});