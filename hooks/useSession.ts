// useSession.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Interface para la sesión basada en tu estructura
interface UserSession {
  SesionSST: boolean;
  TokenSST: string;
  IdUsuarioSST: number;
  NombreSST: string;
  ApellidoPSST: string;
  ApellidoMSST: string;
  CorreoSST: string;
  RolSST: string;
  IdRolSST: string;
  TelefonoSST: string;
  IdDepartamentoSST: string;
  DepartamentoSST: string;
  SaldoSST: string;
  DatosCompletosSST: boolean;
  tienDatoFiscalSST: boolean;
  Password_temporalSST: boolean;
  tieneSuscripcionActivaSST: boolean;
  IdPlanSST: number; 
}

export const useSession = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

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
    refreshSession: loadSession
  };
};