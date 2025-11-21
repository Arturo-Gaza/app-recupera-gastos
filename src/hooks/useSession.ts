// useSession.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

interface UserSession {
  SesionSST: boolean;
  TokenSST: string;
  IdUsuarioSST: number;
  NombreSST: string;
  ApellidoPSST: string;
  ApellidoMSST: string;
  CorreoSST: string;
  RolSST: string;
  IdRolSST: number;                    // <-- antes string ❌
  TelefonoSST: string;
  IdDepartamentoSST: string;
  DepartamentoSST: string;
  SaldoSST: number;                    // <-- antes string ❌
  DatosCompletosSST: boolean;
  tienDatoFiscalSST: boolean;
  Password_temporalSST: boolean;
  tieneSuscripcionActivaSST: boolean;
  IdPlanSST: number | null;
  TipoPagoSST: string | null;

  // faltaban estos:
  FechaVeigenciaSST?: string;
  vigencia_saldo?: string;
}

export const useSession = () => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar sesión desde AsyncStorage
   */
  const loadSession = useCallback(async () => {
    try {
      setLoading(true);

      const sessionData = await AsyncStorage.getItem("SesionSSTFull");
      const json = sessionData ? JSON.parse(sessionData) : null;

      setSession(json);
    } 
    catch (error) {
      console.error("Error al cargar sesión:", error);
    } 
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  /**
   * Actualizar la sesión (parcial o completa)
   * y reflejar los cambios inmediatamente en la UI
   */
  const updateSession = async (newData: Partial<UserSession>) => {
    try {
      const existingData = await AsyncStorage.getItem("SesionSSTFull");
      const parsed = existingData ? JSON.parse(existingData) : {};

      // merge de los datos
      const updated = { ...parsed, ...newData };

      // guardar en storage
      await AsyncStorage.setItem("SesionSSTFull", JSON.stringify(updated));

      // actualizar UI inmediatamente
      setSession(updated);
    } catch (error) {
      console.error("Error al actualizar sesión:", error);
    }
  };

  /**
   * Eliminar sesión
   */
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
    refreshSession: loadSession,
    updateSession   // <-- aquí se expone el método nuevo
  };
};
