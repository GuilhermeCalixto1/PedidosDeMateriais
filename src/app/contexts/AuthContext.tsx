import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/authService";
import { UsuarioLogado } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UsuarioLogado | null;
  loading: boolean;
  login: (
    matricula: string,
    senha: string,
  ) => Promise<{ error: string | null }>;
  cadastrar: (
    nome: string,
    matricula: string,
    senha: string,
    role: string,
  ) => Promise<{ error: string | null }>;
  mudarSenha: (novaSenha: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.obterSessaoAtual().then((usuario) => {
      setUser(usuario);
      setLoading(false);
    });
    const subscription = authService.observarEstadoAuth((usuario) => {
      setUser(usuario);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (m: string, s: string) => {
    try {
      await authService.login(m, s);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const cadastrar = async (n: string, m: string, s: string, r: string) => {
    try {
      await authService.cadastrar(n, m, s, r);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const mudarSenha = async (ns: string) => {
    try {
      await authService.mudarSenha(ns);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        login,
        cadastrar,
        mudarSenha,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
