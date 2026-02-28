import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// 1. Importamos o contexto e a tela de Empréstimos novamente
import { EmprestimosProvider } from "./contexts/EmprestimosContext";
import { LoginPage } from "./components/LoginPage";
import { ControleFerramentaria } from "./components/ControleFerramentaria";

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // 2. Voltamos a renderizar a tela da Ferramentaria
  return <ControleFerramentaria />;
}

export default function App() {
  return (
    <AuthProvider>
      {/* 3. Voltamos a usar o Provider de Empréstimos */}
      <EmprestimosProvider>
        <AppContent />
      </EmprestimosProvider>
    </AuthProvider>
  );
}
