import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSession = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al inicializar
  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem("SesionSSTFull");
      if (sessionData) {
        setSession(JSON.parse(sessionData));
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("SesionSSTFull");
      setSession(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return {
    session,
    loading,
    logout,
    refreshSession: loadSession // Por si necesitas recargar los datos
  };
};