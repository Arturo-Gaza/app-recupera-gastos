import CheckoutForm from "@/src/components/Dashboard/CheckoutForm";
import { useSession } from "@/src/hooks/useSession";
import { ACTIVAR_PLAN, STRIPE_MENSUAL, STRIPE_PREPAGO } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from "react-native";

interface CheckoutPageProps {
  idRecarga: string;
  tipoPago: string;
}

export default function CheckoutPage({ idRecarga, tipoPago }: CheckoutPageProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: sessionLoading, updateSession } = useSession();

  const stripeKey = Constants.expoConfig?.extra?.stripePublishableKey;

  const hasLoadedPayment = useRef(false);   // Evita doble ejecución de loadPayment
  const hasActivatedPlan = useRef(false);   // Evita doble activación de plan

  useEffect(() => {
    console.log('Stripe Key en APK:', stripeKey ? 'PRESENTE' : 'FALTANTE');
  }, [stripeKey]);

  const handleActivarPlan = async (idRecarga: string) => {
    if (hasActivatedPlan.current) return; // ✅ evita doble llamada
    console.log("activa plan");

    try {
      const response = await requests.post({
        command: ACTIVAR_PLAN + idRecarga
      });

      const responseData = response.data;

      if (responseData?.success) {
        const idPlan = responseData.data?.suscripcion?.id_plan ?? null;
        const tipoPagoResp = responseData.data?.tipo_pago ?? null;

        await updateSession({
          IdPlanSST: idPlan,
          TipoPagoSST: tipoPagoResp,
          tieneSuscripcionActivaSST: true,
          DatosCompletosSST: true
        });

        hasActivatedPlan.current = true; // marcar como ejecutado
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
    if (hasLoadedPayment.current) return; // ✅ evita doble llamada
    hasLoadedPayment.current = true;

    try {
      setLoading(true);
      setError(null);

      if (!stripeKey) throw new Error("Clave Stripe no disponible");
      if (!idRecarga || !tipoPago) throw new Error("Faltan parámetros");
      if (!session?.IdUsuarioSST) throw new Error("Usuario no identificado");

      const isPrepago = tipoPago === "prepago";

      if (!isPrepago) {
        await handleActivarPlan(idRecarga);
      }

      const url = isPrepago ? STRIPE_PREPAGO : STRIPE_MENSUAL;

      const body = isPrepago
        ? { idPrepago: parseInt(idRecarga), id_user: session.IdUsuarioSST }
        : { id_plan: parseInt(idRecarga), id_user: session.IdUsuarioSST };

      const response = await requests.post({ command: url, data: body });
      const jsonData = response.data;

      if (!jsonData.success) throw new Error(jsonData.message || "Error al crear el pago");
      if (!jsonData.data) throw new Error("No se recibió el client secret");

      setClientSecret(jsonData.data);

    } catch (err: any) {
      console.error("Error en loadPayment:", err);
      setError(err.message || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || sessionLoading) return;

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
