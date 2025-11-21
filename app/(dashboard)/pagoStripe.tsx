import CheckoutPage from "@/src/components/Dashboard/CheckoutPage";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function CheckoutPageScreen() {
  const params = useLocalSearchParams();
  
  // Extraer parámetros de forma segura
  const idRecarga = params.idRecarga as string;
  const tipoPago = params.tipoPago as string ;


  // Validación de parámetros requeridos
  if (!idRecarga) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>ID de recarga no especificado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: "Pagar",
          headerShown: false,
        }}
      />

      <CheckoutPage 
        idRecarga={idRecarga}
        tipoPago={tipoPago}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'red',
  },
});