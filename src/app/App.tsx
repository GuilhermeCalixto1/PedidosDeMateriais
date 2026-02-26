import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PedidosProvider } from './contexts/PedidosContext';
import { LoginPage } from './components/LoginPage';
import { PedidosPage } from './components/PedidosPage';
import { ComprasPage } from './components/ComprasPage';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Se o usuário é do tipo comprador, mostra a página de compras
  if (user?.tipo === 'comprador') {
    return <ComprasPage />;
  }

  // Caso contrário, mostra a página de pedidos para funcionários
  return <PedidosPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <PedidosProvider>
        <AppContent />
      </PedidosProvider>
    </AuthProvider>
  );
}
