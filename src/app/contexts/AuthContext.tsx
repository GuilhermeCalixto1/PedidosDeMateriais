import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase/supabaseClient';

interface User {
  id: string;
  nome: string;
  matricula: string;
}

interface AuthContextType {
  user: User | null;
  login: (matricula: string, senha: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  cadastrar: (nome: string, matricula: string, senha: string) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Domínio invisível usado apenas para fazer o Supabase aceitar a matrícula como "email"
const DOMINIO_SISTEMA = '@ferramentaria.local';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica se já existe um usuário logado ao abrir a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          nome: session.user.user_metadata?.nome || 'Usuário',
          matricula: session.user.user_metadata?.matricula || '',
        });
      }
      setLoading(false);
    });

    // 2. Fica escutando mudanças (quando o usuário faz login ou logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          nome: session.user.user_metadata?.nome || 'Usuário',
          matricula: session.user.user_metadata?.matricula || '',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (matricula: string, senha: string) => {
    try {
      // Transforma a matrícula em um formato de email para o Supabase
      const emailFake = `${matricula}${DOMINIO_SISTEMA}`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: emailFake,
        password: senha,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Matrícula ou senha incorretos.' };
        }
        return { error: 'Erro ao fazer login: ' + error.message };
      }
      return { error: null };
    } catch (err) {
      return { error: 'Erro inesperado ao fazer login.' };
    }
  };

  const cadastrar = async (nome: string, matricula: string, senha: string) => {
    try {
      const emailFake = `${matricula}${DOMINIO_SISTEMA}`;
      
      const { error } = await supabase.auth.signUp({
        email: emailFake,
        password: senha,
        options: {
          data: {
            nome: nome,
            matricula: matricula
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          return { error: 'Esta matrícula já está cadastrada no sistema.' };
        }
        return { error: 'Erro ao cadastrar: ' + error.message };
      }
      
      return { error: null };
    } catch (err) {
      return { error: 'Erro inesperado ao cadastrar.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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