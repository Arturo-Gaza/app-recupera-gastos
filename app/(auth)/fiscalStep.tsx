import { Stack, useRouter } from "expo-router";
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import FiscalStep from '../../src/components/usuario/FiscalStep'; // Ajusta la ruta según tu estructura

export default function FormDatosFiscalesScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
    
  };

  const handleSubmit = (fiscalData: any) => {
    setLoading(true);
  
    
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Datos Fiscales",
          headerShown: false 
        }} 
      />
      <FiscalStep
        onBack={handleBack}
        onSubmit={handleSubmit}
        loading={loading}
        // initialData={datosIniciales} // Opcional: si quieres pasar datos iniciales
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