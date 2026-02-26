import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  nome: string;
  email: string;
  tipo: 'funcionario' | 'comprador';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuários de exemplo
const usuariosMock = [
  { id: '1', nome: 'João Silva', email: 'joao@empresa.com', senha: '123', tipo: 'funcionario' as const },
  { id: '2', nome: 'Maria Santos', email: 'maria@empresa.com', senha: '123', tipo: 'funcionario' as const },
  { id: '3', nome: 'Carlos Compras', email: 'compras@empresa.com', senha: '123', tipo: 'comprador' as const },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, senha: string): boolean => {
    const usuario = usuariosMock.find(u => u.email === email && u.senha === senha);
    if (usuario) {
      const { senha: _, ...userSemSenha } = usuario;
      setUser(userSemSenha);
      localStorage.setItem('user', JSON.stringify(userSemSenha));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
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
