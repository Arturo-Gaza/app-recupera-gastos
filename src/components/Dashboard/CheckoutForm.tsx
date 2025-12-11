import { useSession } from '@/src/hooks/useSession';
import { STRIPE_CONFIRM } from '@/src/services/apiConstans';
import requests from '@/src/services/requests';
import { styles } from '@/src/styles/CheckoutFormStyle';
import {
  initPaymentSheet,
  presentPaymentSheet
} from '@stripe/stripe-react-native';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  const [sheetReady, setSheetReady] = useState(false);
  const { session, updateSession } = useSession();

  // ✅ Usar ref para evitar múltiples redirecciones
  const hasRedirected = useRef(false);

  const datosActualizados = session?.DatosCompletosSST;
  const fiscalActualizado = session?.tienDatoFiscalSST;
  console.log("datos actualizados fuera del useEffect:", datosActualizados);
  console.log("fiscal actualizado fuera del useEfect:", fiscalActualizado);



  // Inicializa la PaymentSheet
  useEffect(() => {
    if (!clientSecret) return;

    const initializeSheet = async () => {
      try {
        setLoading(true);
        const { error } = await initPaymentSheet({
          merchantDisplayName: "Recupera Gastos",
          paymentIntentClientSecret: clientSecret,
          customFlow: false,
          allowsDelayedPaymentMethods: false,
          returnURL: 'recupergastos://stripe-redirect',
          defaultBillingDetails: userEmail ? { email: userEmail } : undefined,
        });

        if (error) {
          console.error('Error inicializando Payment Sheet:', error);
          setMessage("Error al inicializar formulario de pago: " + error.message);
          setSheetReady(false);
        } else {
          setSheetReady(true);
          setMessage(null);
        }
      } catch (err) {
        console.error('Error en initializeSheet:', err);
        setMessage("Error inesperado al configurar el pago");
        setSheetReady(false);
      } finally {
        setLoading(false);
      }
    };

    initializeSheet();
  }, [clientSecret]);

  // ✅ Redirección SOLO cuando el pago es exitoso y no se ha redirigido antes
 useEffect(() => {
  if (paymentStatus === 'succeeded' && session && !hasRedirected.current) {
    hasRedirected.current = true;

    const datosActualizados = session.DatosCompletosSST ?? false;
    const fiscalActualizado = session.tienDatoFiscalSST ?? false;

    console.log("datos actualizados dentro del useEffect:", datosActualizados);
    console.log("fiscal actualizado dentro del useEffect:", fiscalActualizado);

    const timer = setTimeout(() => {
      router.replace("/dashboard");
      
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [paymentStatus, session]);
  // Abre PaymentSheet
  const openPaymentSheet = async () => {
    if (!sheetReady) {
      setMessage("El sistema de pago no está listo. Por favor espera.");
      return;
    }

    setMessage(null);
    setLoading(true);
    setPaymentStatus('processing');

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        setPaymentStatus('failed');
        if (error.code === 'Canceled') {
          setMessage("Pago cancelado por el usuario");
        } else {
          setMessage(error.message || "El pago no se completó.");
        }
        setLoading(false);
        return;
      }

      // Confirmar con el backend
      const paymentIntentId = clientSecret.split('_secret')[0];

      const confirmResponse = await requests.post({
        command: STRIPE_CONFIRM,
        data: {
          payment_intent_id: paymentIntentId,
        },
      });

      const confirmData = confirmResponse.data;

      if (confirmData?.success) {
        // Actualizar sesión
        await updateSession({
          SaldoSST: confirmData.data.saldo_resultante,
          TipoPagoSST: confirmData.data.tipo_pago,
          tieneSuscripcionActivaSST: confirmData.data.is_subscription,
          DatosCompletosSST: confirmData.data.datosCompletos,
          tienDatoFiscalSST: confirmData.data.tienDatoFiscal,
          FechaVeigenciaSST: confirmData.data.fecha_vencimiento,
          vigencia_saldo: confirmData.data.vigencia_saldo,
          
        });

        setPaymentStatus('succeeded');
      } else {
        throw new Error(confirmData?.message || "Error confirmando el pago");
      }

    } catch (err: any) {
      console.error('Error en openPaymentSheet:', err);
      setPaymentStatus('failed');
      setMessage(err.message || "Error del servidor al confirmar el pago.");
    } finally {
      setLoading(false);
    }
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

          <TouchableOpacity
            style={[
              styles.sheetButton,
              !sheetReady && styles.sheetButtonDisabled
            ]}
            onPress={openPaymentSheet}
            disabled={!sheetReady || isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color="#1e293b" />
            ) : (
              <Text style={styles.sheetButtonText}>
                {sheetReady ? "Ingresar datos de tarjeta" : "Configurando pago..."}
              </Text>
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

        {!sheetReady && !loading && (
          <Text style={styles.warningText}>
            El sistema de pago se está inicializando...
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

