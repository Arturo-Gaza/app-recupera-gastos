import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface CheckoutFormProps {
  clientSecret: string;
  userEmail?: string;
}

type PaymentStatus = 
  'idle' | 
  'processing' | 
  'succeeded' | 
  'requires_action' | 
  'failed';

export default function CheckoutForm({ clientSecret, userEmail }: CheckoutFormProps) {
  const { confirmPayment, loading: stripeLoading } = useConfirmPayment();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  useEffect(() => {
    if (paymentStatus === 'succeeded') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  const handleSubmit = async () => {
    if (!cardDetails?.complete) {
      setMessage("Por favor completa los datos de tu tarjeta.");
      return;
    }

    if (cardDetails?.error) {
      setMessage(cardDetails.error.message);
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setPaymentStatus('processing');

      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            email: userEmail || "cliente@example.com",
          },
        },
      });

      if (error) {
        setMessage(`Error de pago: ${error.message}`);
        setPaymentStatus('failed');
        return;
      }

      const confirmResponse = await fetch(
        'http://192.168.1.171:8000/api/stripe/confirmStripePayment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payment_intent_id: paymentIntent?.id,
          }),
        }
      );

      const confirmData = await confirmResponse.json();
      console.log("Backend:", confirmData);

      switch (paymentIntent?.status) {
        case 'Succeeded':
          setPaymentStatus('succeeded');
          break;
        case 'RequiresAction':
          setPaymentStatus('requires_action');
          setMessage("Tu pago requiere verificación adicional.");
          break;
        case 'RequiresPaymentMethod':
          setPaymentStatus('failed');
          setMessage("El método de pago falló. Intenta otra tarjeta.");
          break;
        default:
          setPaymentStatus('failed');
          setMessage(`Estado de pago: ${paymentIntent?.status}`);
      }

    } catch (error) {
      setMessage("Error de conexión. Revisa tu internet.");
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'succeeded') {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>¡Pago Exitoso!</Text>
          <Text style={styles.successText}>
            Tu pago se ha procesado correctamente.
          </Text>
          <ActivityIndicator size="small" color="#635BFF" />
          <Text style={styles.redirectText}>Redirigiendo...</Text>
        </View>
      </View>
    );
  }

  const isProcessing = loading || stripeLoading;
  const isDisabled = isProcessing || !cardDetails?.complete;

  return (
    <View style={styles.container}>

      {/* Header Stripe Clean */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Pago</Text>
      </View>

      {/* Tarjeta principal */}
      <View style={styles.formCard}>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Información de la Tarjeta</Text>

          <CardField
            postalCodeEnabled={true}
            placeholders={{
              number: '4242 4242 4242 4242',
              postalCode: '90210',
            }}
            style={styles.cardField}
            onCardChange={setCardDetails}
          />

          {cardDetails?.error && (
            <Text style={styles.fieldError}>
              {cardDetails.error.message}
            </Text>
          )}
        </View>

        {/* Botón Stripe Clean */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.payButton, isDisabled && styles.payButtonDisabled]}
          disabled={isDisabled}
          onPress={handleSubmit}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Pagar Ahora</Text>
          )}
        </TouchableOpacity>

        {message && (
          <Text
            style={[
              styles.message,
              paymentStatus === 'failed' ? styles.error : styles.info
            ]}
          >
            {message}
          </Text>
        )}
      </View>

      <View style={styles.securityInfo}>
        <Text style={styles.securityText}>
          🔒 Pago seguro procesado por Stripe
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f6f9fc',
  },

  /* Header estilo Stripe */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backText: {
    fontSize: 16,
    color: '#635BFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    color: '#1e293b',
  },

  /* Card Stripe */
  formCard: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  /* Secciones */
  cardSection: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10,
  },
  cardField: {
    height: 50,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dce0e6',
    paddingHorizontal: 12,
  },
  fieldError: {
    color: '#d00',
    fontSize: 13,
    marginTop: 6,
  },

  /* Botón Stripe */
  payButton: {
    backgroundColor: "#635BFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: '#635BFF',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  payButtonDisabled: {
    backgroundColor: "#a5a7c4",
    shadowOpacity: 0,
  },
  payText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* Mensajes */
  message: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    backgroundColor: '#ffe2e6',
    color: '#b4001e',
    borderColor: '#ffb3c0',
    borderWidth: 1,
  },
  info: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderColor: '#bae6fd',
    borderWidth: 1,
  },

  securityInfo: {
    marginTop: 25,
    padding: 15,
    alignItems: 'center',
  },
  securityText: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },

  /* Éxito */
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f6f9fc",
  },
  successCard: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 14,
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  successEmoji: { fontSize: 50, marginBottom: 10 },
  successTitle: { 
    fontSize: 22, 
    fontWeight: "700",
    color: "#2e7d32",
    marginBottom: 8,
  },
  successText: { 
    color: "#475569",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  redirectText: { 
    color: "#64748b",
    fontSize: 12,
    marginTop: 5,
  },
});
