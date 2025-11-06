import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import FiscalRegistrationMethod from '../components/usuario/MetodoRegistroFiscal';
import { Stack, useRouter } from "expo-router";

export default function PlanesScreen() {

  return (
    <View style={styles.container}>
        <Stack.Screen 
        options={{ 
          title: "MetodoFiscal",
          headerShown: false 
        }} 
      />
      <FiscalRegistrationMethod />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});