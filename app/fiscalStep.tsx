import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FiscalStep from '../components/usuario/FiscalStep'; // Ajusta la ruta según tu estructura
import { Stack, useRouter } from "expo-router";

export default function FormDatosFiscalesScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
    console.log('Regresar presionado');
  };

  const handleSubmit = (fiscalData: any) => {
    setLoading(true);
    console.log('Datos fiscales enviados:', fiscalData);
    
    // Aquí iría tu lógica para enviar los datos
    // Por ejemplo:
    // await enviarDatosFiscales(fiscalData);
    
    setTimeout(() => {
      setLoading(false);
      // Redirigir a la siguiente pantalla o mostrar éxito
      // router.push('/SiguientePantalla');
      console.log('Registro fiscal completado');
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