import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmprestimosProvider } from './contexts/EmprestimosContext';
import { LoginPage } from './components/LoginPage';
import { ControleFerramentaria } from './components/ControleFerramentaria';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Todos os usuários autenticados veem a tela de controle da ferramentaria
  return <ControleFerramentaria />;
}

export default function App() {
  return (
    <AuthProvider>
      <EmprestimosProvider>
        <AppContent />
      </EmprestimosProvider>
    </AuthProvider>
  );
}