import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EmprestimosProvider } from './contexts/EmprestimosContext';
import { MateriaisProvider } from './contexts/MateriaisContext';
import { ConfiguracoesProvider } from './contexts/ConfiguracoesContext';

// Páginas e Funcionalidades
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './features/dashboard/dashboard';
import { ControleFerramentaria } from './features/emprestimos/ControleFerramentaria';
import { GerenciamentoMateriais } from './features/estoque/GerenciamentoMateriais';
import { ConfiguracoesSistema } from './features/configuracoes/configuracoes';
import { Notificacoes } from './components/Notificacoes';
import { HistoricoAuditoria } from './features/auditoria/HistoricoAuditoria';

// UI e Ícones
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { Package, ClipboardList, LogOut, BarChart3, Settings } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [paginaAtiva, setPaginaAtiva] = useState<'dashboard' | 'emprestimos' | 'materiais' | 'configuracoes'>('dashboard');

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Navegação Responsiva */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-4 gap-4 lg:gap-0">
            
            {/* Logo e Info do Usuário */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Sistema de Ferramentaria</h1>
                <p className="text-sm text-gray-600">Olá, {user?.nome} (Mat: {user?.matricula})</p>
              </div>
            </div>

            {/* O SEGREDO ESTÁ AQUI: Separamos as secções! */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              
              {/* 1. Zona de Scroll (Apenas para os botões de navegação) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full lg:w-auto">
                <Button variant={paginaAtiva === 'dashboard' ? 'default' : 'outline'} onClick={() => setPaginaAtiva('dashboard')} className="whitespace-nowrap">
                  <BarChart3 className="size-4 mr-2" /> Visão Geral
                </Button>
                
                <Button variant={paginaAtiva === 'emprestimos' ? 'default' : 'outline'} onClick={() => setPaginaAtiva('emprestimos')} className="whitespace-nowrap">
                  <ClipboardList className="size-4 mr-2" /> Empréstimos
                </Button>
                
                <Button variant={paginaAtiva === 'materiais' ? 'default' : 'outline'} onClick={() => setPaginaAtiva('materiais')} className="whitespace-nowrap">
                  <Package className="size-4 mr-2" /> Inventário
                </Button>

                <Button variant={paginaAtiva === 'configuracoes' ? 'default' : 'outline'} onClick={() => setPaginaAtiva('configuracoes')} className="whitespace-nowrap">
                  <Settings className="size-4 mr-2" /> Configurações
                </Button>
              </div>

              {/* Separador Visual */}
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

              {/* 2. Zona Fixa (Sino e Logout - Livres do corte do CSS!) */}
              <div className="flex items-center gap-2 shrink-0">
                <Notificacoes />
                
                <Button variant="ghost" onClick={logout} className="whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50" title="Sair do sistema">
                  <LogOut className="size-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paginaAtiva === 'dashboard' && <Dashboard />}
        {paginaAtiva === 'emprestimos' && <ControleFerramentaria />}
        {paginaAtiva === 'materiais' && <GerenciamentoMateriais />}
        {paginaAtiva === 'configuracoes' && <ConfiguracoesSistema />}
      </div>

      <Toaster richColors position="top-right" /> 
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConfiguracoesProvider>
        <MateriaisProvider>
          <EmprestimosProvider>
            <AppContent />
          </EmprestimosProvider>
        </MateriaisProvider>
      </ConfiguracoesProvider>
    </AuthProvider>
  );
}