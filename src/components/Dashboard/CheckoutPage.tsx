import CheckoutForm from "@/src/components/Dashboard/CheckoutForm";
import { useSession } from "@/src/hooks/useSession";
import { ACTIVAR_PLAN, STRIPE_MENSUAL, STRIPE_PREPAGO } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from "react-native";

interface CheckoutPageProps {
  idRecarga: string;
  tipoPago: string;
}

export default function CheckoutPage({ idRecarga, tipoPago }: CheckoutPageProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: sessionLoading } = useSession();
  const { updateSession } = useSession();

  // Obtener la Stripe API Key con validación mejorada
  const stripeKey = Constants.expoConfig?.extra?.stripePublishableKey;

  // Debug para verificar la clave en APK
  useEffect(() => {
    console.log('Stripe Key en APK:', stripeKey ? 'PRESENTE' : 'FALTANTE');
  }, [stripeKey]);

  const handleActivarPlan = async (idRecarga: string) => {
    try {
      const response = await requests.post({
        command: ACTIVAR_PLAN + idRecarga
      });

      const responseData = response.data;

      if (responseData?.success) {
        const idPlan = responseData.data?.suscripcion?.id_plan ?? null;
        const tipoPago = responseData.data?.tipo_pago ?? null;

        await updateSession({
          IdPlanSST: idPlan,
          TipoPagoSST: tipoPago,
          tieneSuscripcionActivaSST: true,
          DatosCompletosSST: true
        });
      } else {
        Alert.alert("Error", responseData?.message);
        return null;
      }
    } catch (error: any) {
      console.error("Error activando plan:", error);
      Alert.alert("Error", error?.response?.data?.message || "Error inesperado");
      return null;
    }
  };

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validación específica para APK
      if (!stripeKey) {
        const errorMsg = "Error de configuración: Clave de Stripe no disponible en APK";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      if (!idRecarga || !tipoPago) {
        throw new Error("Faltan parámetros requeridos para el pago");
      }

      if (!session?.IdUsuarioSST) {
        throw new Error("No se pudo identificar al usuario");
      }

      const validPaymentTypes = ["prepago", "postpago"];
      if (!validPaymentTypes.includes(tipoPago)) {
        throw new Error(`Tipo de pago no válido: ${tipoPago}`);
      }

      const isPrepago = tipoPago === "prepago";

      const url = isPrepago ? STRIPE_PREPAGO : STRIPE_MENSUAL;

      const body = isPrepago
        ? {
            idPrepago: parseInt(idRecarga),
            id_user: session.IdUsuarioSST,
          }
        : {
            id_plan: parseInt(idRecarga),
            id_user: session.IdUsuarioSST,
          };

      if (!isPrepago) {
        await handleActivarPlan(idRecarga);
      }

      const response = await requests.post({
        command: url,
        data: body,
      });

      const jsonData = response.data;

      if (!jsonData.success) {
        throw new Error(jsonData.message || "Error al crear el pago");
      }

      if (!jsonData.data) {
        throw new Error("No se recibió el client secret del servidor");
      }

      setClientSecret(jsonData.data);

    } catch (err: any) {
      console.error("Error en loadPayment (APK):", err);
      setError(err.message || "Error al procesar el pago en APK");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || sessionLoading) return;
    
    // Timeout para prevenir bloqueos en APK
    const timeoutId = setTimeout(() => {
      loadPayment();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [idRecarga, tipoPago, session, sessionLoading]);

  // Estados de carga
  if (sessionLoading || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>
          {sessionLoading ? "Cargando sesión..." : "Preparando pago..."}
        </Text>
      </View>
    );
  }

  // Estados de error
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Reintentar" 
          onPress={loadPayment} 
          color="#16a34a"
        />
      </View>
    );
  }

  if (!clientSecret) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo generar la sesión de pago</Text>
        <Button 
          title="Reintentar" 
          onPress={loadPayment} 
          color="#16a34a"
        />
      </View>
    );
  }

  // Verificación final antes de renderizar Stripe
  if (!stripeKey) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Error crítico: Configuración de pago no disponible
        </Text>
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey={stripeKey}
      merchantIdentifier="merchant.com.recupergastos"
      urlScheme="recupergastos"
    >
      <View style={styles.container}>
        <CheckoutForm
          clientSecret={clientSecret}
        />
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
});