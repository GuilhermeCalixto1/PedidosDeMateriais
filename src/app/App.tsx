import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmprestimosProvider } from './contexts/EmprestimosContext';
import { MateriaisProvider } from './contexts/MateriaisContext';
import { LoginPage } from './components/LoginPage';
import { ControleFerramentaria } from './features/emprestimos/ControleFerramentaria';
import { GerenciamentoMateriais } from './features/estoque/GerenciamentoMateriais';
import { Button } from './components/ui/button';
import { Package, ClipboardList } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [paginaAtiva, setPaginaAtiva] = useState<'emprestimos' | 'materiais'>('emprestimos');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Navegação */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Sistema de Ferramentaria</h1>
                <p className="text-sm text-gray-600">{user?.nome}</p>
              </div>
            </div>

            {/* Navegação entre páginas */}
            <div className="flex gap-2">
              <Button
                variant={paginaAtiva === 'emprestimos' ? 'default' : 'outline'}
                onClick={() => setPaginaAtiva('emprestimos')}
              >
                <ClipboardList className="size-4 mr-2" />
                Empréstimos
              </Button>
              <Button
                variant={paginaAtiva === 'materiais' ? 'default' : 'outline'}
                onClick={() => setPaginaAtiva('materiais')}
              >
                <Package className="size-4 mr-2" />
                Inventário
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paginaAtiva === 'emprestimos' ? (
          <ControleFerramentaria />
        ) : (
          <GerenciamentoMateriais />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MateriaisProvider>
        <EmprestimosProvider>
          <AppContent />
        </EmprestimosProvider>
      </MateriaisProvider>
    </AuthProvider>
  );
}
