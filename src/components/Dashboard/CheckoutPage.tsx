import CheckoutForm from "@/src/components/Dashboard/CheckoutForm";
import { useSession } from "@/src/hooks/useSession";
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

  // Obtener la Stripe API Key
  const stripeKey = Constants.expoConfig?.extra?.stripePublishableKey ?? "";

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

        // Configurar URL y body según tipo de pago
        const url =
          tipoPago === "prepago"
            ? "http://192.168.1.171:8000/api/stripe/crearPagoByPrepago"
            : "http://192.168.1.171:8000/api/stripe/crearPagoByMensual"

        const body =
          tipoPago === "prepago"
            ? {
              idPrepago: parseInt(idRecarga),
              id_user: session.IdUsuarioSST,
            }
            : {
              id_plan: parseInt(idRecarga),
              id_user: session.IdUsuarioSST,
            };

        

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const rawText = await res.text();

        let jsonData;
        try {
          jsonData = JSON.parse(rawText);
        } catch (parseError) {
          console.error("Error parseando JSON:", parseError);
          throw new Error("Error en la respuesta del servidor");
        }

        if (!res.ok || !jsonData.success) {
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