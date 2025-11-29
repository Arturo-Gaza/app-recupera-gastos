import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

// Traemos tu tipo exacto desde donde lo tienes definido
// O vuelve a declararlo aquí si lo tienes en otro archivo.
export interface UserSession {
  SesionSST: boolean;
  TokenSST: string;
  IdUsuarioSST: number;
  NombreSST: string;
  ApellidoPSST: string;
  ApellidoMSST: string;
  CorreoSST: string;
  RolSST: string;
  IdRolSST: number;
  TelefonoSST: string;
  IdDepartamentoSST: string;
  DepartamentoSST: string;
  SaldoSST: number;
  DatosCompletosSST: boolean;
  tienDatoFiscalSST: boolean;
  Password_temporalSST: boolean;
  tieneSuscripcionActivaSST: boolean;
  IdPlanSST: number | null;
  TipoPagoSST: string | null;
  FechaVeigenciaSST?: string;
  vigencia_saldo?: string;
}

interface SessionContextType {
  session: UserSession | null;
  loading: boolean;
  updateSession: (data: Partial<UserSession>) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// 👇 EL "null" inicial se tipa explícitamente
const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem("SesionSSTFull");
      setSession(stored ? JSON.parse(stored) : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, []);

  const updateSession = async (data: Partial<UserSession>) => {
    const stored = await AsyncStorage.getItem("SesionSSTFull");
    const parsed: UserSession | {} = stored ? JSON.parse(stored) : {};

    const updated = { ...parsed, ...data };

    await AsyncStorage.setItem("SesionSSTFull", JSON.stringify(updated));
    setSession(updated as UserSession);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("SesionSSTFull");
    setSession(null);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        loading,
        updateSession,
        logout,
        refreshSession: loadSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>");
  }
  return ctx;
};
