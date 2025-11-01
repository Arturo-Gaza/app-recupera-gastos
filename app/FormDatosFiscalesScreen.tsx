import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FormDatosFiscalesPage from '../components/usuario/FormDatosFiscales'; // ← Default import
import { Stack, useRouter } from "expo-router";

export default function DatosFiscalesScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Lógica de envío del formulario
      console.log('Formulario enviado');
      router.push('/fiscalStep');
      //router.replace('/siguiente-pantalla');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "DatosFiscales",
          headerShown: false
        }} 
      />
      <FormDatosFiscalesPage
        loading={loading}
        onSubmit={handleSubmit}
        onBack={handleBack}
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