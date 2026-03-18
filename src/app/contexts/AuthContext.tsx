import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UsuarioLogado } from '../types/index';

interface AuthContextType {
  user: UsuarioLogado | null;
  login: (matricula: string, senha: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  cadastrar: (nome: string, matricula: string, senha: string) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica a sessão inicial através do serviço
    authService.obterSessaoAtual().then(usuario => {
      setUser(usuario);
      setLoading(false);
    });

    // 2. Fica a escutar mudanças de estado (login/logout em outras abas)
    const subscription = authService.observarEstadoAuth((usuario) => {
      setUser(usuario);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (matricula: string, senha: string) => {
    try {
      await authService.login(matricula, senha);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao fazer login.' };
    }
  };

  const cadastrar = async (nome: string, matricula: string, senha: string) => {
    try {
      await authService.cadastrar(nome, matricula, senha);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao cadastrar.' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, cadastrar, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}