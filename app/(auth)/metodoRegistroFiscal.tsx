import { Stack } from "expo-router";
import { StyleSheet, View } from 'react-native';
import FiscalRegistrationMethod from '../../src/components/usuario/MetodoRegistroFiscal';

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