import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FormDatosFiscalesCompleto from '../components/usuario/FormDatosFiscales';

export default function DatosFiscalesScreen() {
  const [loading, setLoading] = useState(false);
  const [fiscalData, setFiscalData] = useState<any>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  //Parseo seguro de fiscalData
  useEffect(() => {
    const fiscalDataParam = Array.isArray(params.fiscalData)
      ? params.fiscalData[0]
      : params.fiscalData;

    if (fiscalDataParam) {
      try {
        const parsed = JSON.parse(fiscalDataParam as string);
        setFiscalData(parsed.data);
      } catch (err) {
        console.error('Error parseando fiscalData:', err);
      }
    }
  }, [params.fiscalData]);

  //Función para enviar formulario
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Lógica de envío del formulario
      console.log('Formulario enviado');
      router.push('/fiscalStep'); // Redirige al siguiente paso
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  //Función para regresar
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'DatosFiscales',
          headerShown: false,
        }}
      />
      <FormDatosFiscalesCompleto/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
