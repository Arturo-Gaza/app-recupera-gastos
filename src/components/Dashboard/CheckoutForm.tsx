import { useSession } from '@/src/hooks/useSession';
import { STRIPE_CONFIRM } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import {
  initPaymentSheet,
  presentPaymentSheet
} from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const { refreshSession, updateSession } = useSession();




  // Inicializa la PaymentSheet
  useEffect(() => {
    if (!clientSecret) return;

    const initializeSheet = async () => {
      const { error } = await initPaymentSheet({
        merchantDisplayName: "Mi App",
        allowsDelayedPaymentMethods: false,
        paymentIntentClientSecret: clientSecret,
      });

      if (error) {
        setMessage("Error al inicializar formulario de pago.");

      }
    };

    initializeSheet();
  }, [clientSecret]);

  // Redirección en éxito
  useEffect(() => {
    if (paymentStatus === 'succeeded') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus]);

  // Abre PaymentSheet
  const openPaymentSheet = async () => {
    setMessage(null);
    setLoading(true);
    setPaymentStatus('processing');

    const { error } = await presentPaymentSheet();

    if (error) {
      setPaymentStatus('failed');
      setMessage(error.message || "El pago no se completó.");
      setLoading(false);
      return;
    }
    try {
      const paymentIntentId = clientSecret.split('_secret')[0];

      const confirmResponse = await requests.post({
        command: STRIPE_CONFIRM,
        data: {
          payment_intent_id: paymentIntentId,
        },
      });


      const confirmData = confirmResponse.data;

      // -------------------------------------------
      // ACTUALIZAR SESIÓN (versión completa)
      // -------------------------------------------
      if (confirmData?.success) {

        await updateSession({
          SaldoSST: confirmData.data.saldo_resultante,
          TipoPagoSST: confirmData.data.tipo_pago,
          tieneSuscripcionActivaSST: confirmData.data.is_subscription,
          DatosCompletosSST: confirmData.data.datos_completos,
          tienDatoFiscalSST: confirmData.data.datos_fiscales,
          FechaVeigenciaSST: confirmData.data.fecha_vencimiento,
          vigencia_saldo: confirmData.data.vigencia_saldo
        });

      }

      setPaymentStatus('succeeded');

    } catch (err) {
      setPaymentStatus('failed');
      setMessage("Error del servidor.");
    }

    setLoading(false);


  };

  // Pantalla de éxito
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

  const isProcessing = loading;

  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.transparentCard]}>
        <Image
          source={require('@/assets/images/rg-logo.png')}
          style={[styles.logo, styles.largeLogo]}
          resizeMode="contain"
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Pago</Text>
      </View>

      {/* Card principal */}
      <View style={styles.formCard}>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Información de Pago</Text>

          {/* Botón que abre PaymentSheet */}
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={openPaymentSheet}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color="#1e293b" />
            ) : (
              <Text style={styles.sheetButtonText}>Ingresar datos de tarjeta</Text>
            )}
          </TouchableOpacity>
        </View>

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
    marginTop: 50
  },

  formCard: {
    width: "100%",
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  cardSection: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10,
  },

  sheetButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  sheetButtonText: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
  },

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
  //Estilo para el logo
  transparentCard: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    marginTop: 5,
    alignSelf: "center",
  },

  logo: {
    width: 200,
    height: 100,
    marginBottom: 30,
    marginTop: 5,
  },

  largeLogo: {
    width: 300 * 0.7,
    height: 150 * 0.7,
    marginBottom: 30,
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
});
