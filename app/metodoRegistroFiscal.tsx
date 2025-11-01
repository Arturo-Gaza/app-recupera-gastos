import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FiscalRegistrationMethod from '../components/usuario/MetodoRegistroFiscal';
import { Stack, useRouter } from "expo-router";

export default function PlanesScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMethodSelect = (method: 'cfdi' | 'constancia' | 'manual') => {
    setLoading(true);
    console.log('Método seleccionado:', method);
    
    switch (method) {
      case 'constancia':
        // router.push('/UploadCSF');
        break;
      case 'manual':
        router.push('/FormDatosFiscalesScreen'); 
        break;
      default:
        break;
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    router.back();
    console.log('Cancelar presionado');
  };

  return (
    <View style={styles.container}>
        <Stack.Screen 
        options={{ 
          title: "MetodoFiscal",
          headerShown: false 
        }} 
      />
      <FiscalRegistrationMethod
        onMethodSelect={handleMethodSelect}
        onCancel={handleCancel}
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