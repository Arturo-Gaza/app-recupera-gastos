import CheckoutForm from "@/src/components/Dashboard/CheckoutForm";
import { useSession } from "@/src/hooks/useSession";
import { ACTIVAR_PLAN, STRIPE_MENSUAL, STRIPE_PREPAGO } from "@/src/services/apiConstans";
import requests from "@/src/services/requests";
import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

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

  // Obtener la Stripe API Key
  const stripeKey = Constants.expoConfig?.extra?.stripePublishableKey ?? "";

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
      console.error("Error:", error);
      Alert.alert("Error", error?.response?.data?.message || "Error inesperado");
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session || sessionLoading) return;
    const loadPayment = async () => {
  try {
    setLoading(true);
    setError(null);

    // Validaciones
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

    // URL
    const url = isPrepago
      ? STRIPE_PREPAGO
      :STRIPE_MENSUAL ;

    // BODY
    const body = isPrepago
      ? {
          idPrepago: parseInt(idRecarga),
          id_user: session.IdUsuarioSST,
        }
      : {
          id_plan: parseInt(idRecarga),
          id_user: session.IdUsuarioSST,
        };

    // Si NO es prepago se activa el plan
    if (!isPrepago) {
      await handleActivarPlan(idRecarga);
    }

    // Aquí usamos tu estructura post()
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
    console.error("Error creando PaymentIntent:", err);
    setError(err.message || "Error al procesar el pago");
    Alert.alert("Error", err.message || "No se pudo inicializar el pago");
  } finally {
    setLoading(false);
  }
};


    loadPayment();
  }, [idRecarga, tipoPago, session, sessionLoading]);

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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!clientSecret) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No se pudo generar la sesión de pago</Text>
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey={stripeKey}
      merchantIdentifier="merchant.com.example"
    >
      <View style={styles.container}>
        <CheckoutForm
          clientSecret={clientSecret}
        //userEmail={session?.EmailSST} // Pasar email real del usuario
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
  },
});