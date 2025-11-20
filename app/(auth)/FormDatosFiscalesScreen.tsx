import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FormDatosFiscalesCompleto from '../../src/components/usuario/FormDatosFiscales';

export default function DatosFiscalesScreen() {
  const [loading, setLoading] = useState(false);
  const [fiscalData, setFiscalData] = useState<any>(null);
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ NUEVO: Procesar datos de edición
  const [initialData, setInitialData] = useState<any>(null);

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

    // ✅ NUEVO: Procesar initialData para edición
    const initialDataParam = Array.isArray(params.initialData)
      ? params.initialData[0]
      : params.initialData;

    if (initialDataParam) {
      try {
        const parsed = JSON.parse(initialDataParam as string);
        setInitialData(parsed);
        console.log('📦 Datos de edición recibidos:', parsed);
      } catch (err) {
        console.error('Error parseando initialData:', err);
      }
    }
  }, [params.fiscalData, params.initialData]);

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
          title: initialData ? 'Editar Receptor' : 'Datos Fiscales', // ✅ Título dinámico
          headerShown: false,
        }}
      />
      <FormDatosFiscalesCompleto 
        initialData={initialData} // ✅ Pasar datos de edición al formulario
        modo={initialData ? 'edicion' : 'creacion'} // ✅ Pasar modo
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});