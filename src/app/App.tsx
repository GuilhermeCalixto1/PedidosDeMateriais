import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { EmprestimosProvider } from "./contexts/EmprestimosContext";
import { MateriaisProvider } from "./contexts/MateriaisContext";
import { ConfiguracoesProvider } from "./contexts/ConfiguracoesContext";
import { AuditoriaProvider } from "./contexts/AuditoriaContext";

// Páginas e Funcionalidades
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./features/dashboard/dashboard";
import { ControleFerramentaria } from "./features/emprestimos/ControleFerramentaria";
import { GerenciamentoMateriais } from "./features/estoque/GerenciamentoMateriais";
import { ConfiguracoesSistema } from "./features/configuracoes/configuracoes";
import { HistoricoAuditoria } from "./features/auditoria/HistoricoAuditoria";
import { GerenciamentoUsuarios } from "./features/usuarios/GerenciamentoUsuarios";
import { Notificacoes } from "./components/Notificacoes";
import { ModalAlterarSenha } from "./components/ModalAlterarSenha";
import { Logo } from "./components/Logo";

// UI e Ícones
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import {
  Package,
  ClipboardList,
  LogOut,
  BarChart3,
  Settings,
  ShieldCheck,
  Users,
  ChevronDown,
  KeyRound,
  LayoutGrid,
} from "lucide-react";

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();

  const [paginaAtiva, setPaginaAtiva] = useState<
    | "dashboard"
    | "emprestimos"
    | "materiais"
    | "configuracoes"
    | "auditoria"
    | "usuarios"
  >("dashboard");
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  // Trava de segurança para impedir visualização indevida de páginas admin
  const eAdmin = user?.role === "admin";
  const paginaExibida =
    ["usuarios", "auditoria", "configuracoes"].includes(paginaAtiva) && !eAdmin
      ? "dashboard"
      : paginaAtiva;

  if (!isAuthenticated) return <LoginPage />;

  const paginasInfo = {
    dashboard: { nome: "Visão Geral", icone: BarChart3, cor: "text-blue-600" },
    emprestimos: {
      nome: "Empréstimos",
      icone: ClipboardList,
      cor: "text-emerald-600",
    },
    materiais: { nome: "Inventário", icone: Package, cor: "text-orange-600" },
    usuarios: {
      nome: "Gestão de Usuários",
      icone: Users,
      cor: "text-indigo-600",
    },
    auditoria: {
      nome: "Log de Auditoria",
      icone: ShieldCheck,
      cor: "text-purple-600",
    },
    configuracoes: {
      nome: "Configurações",
      icone: Settings,
      cor: "text-gray-600",
    },
  };

  const PaginaAtualIcone = paginasInfo[paginaExibida]?.icone || LayoutGrid;

  const ItemMenu = ({
    id,
    label,
    icone: Icone,
    corIcone,
  }: {
    id: any;
    label: string;
    icone: any;
    corIcone?: string;
  }) => (
    <button
      onClick={() => {
        setPaginaAtiva(id);
        setMenuAberto(false);
      }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all ${
        paginaExibida === id
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icone
        className={`size-4 ${paginaExibida === id ? "text-blue-600" : corIcone || "text-gray-400"}`}
      />
      {label}
      {paginaExibida === id && (
        <div className="ml-auto size-1.5 rounded-full bg-blue-600" />
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="border-b border-gray-200 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo e Nome do Sistema */}
          <div className="flex items-center gap-4">
            <Logo className="size-10" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">
                  {user?.nome}
                </span>
                {eAdmin && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Área Central/Direita: NavegaçãoDropdown */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setMenuAberto(!menuAberto)}
                className={`w-[200px] justify-between border-gray-200 shadow-sm hover:border-blue-300 transition-all ${menuAberto ? "ring-2 ring-blue-100 border-blue-400" : ""}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <PaginaAtualIcone
                    className={`size-4 shrink-0 ${paginasInfo[paginaExibida]?.cor}`}
                  />
                  <span className="truncate">
                    {paginasInfo[paginaExibida]?.nome}
                  </span>
                </div>
                <ChevronDown
                  className={`size-4 opacity-50 transition-transform duration-200 ${menuAberto ? "rotate-180" : ""}`}
                />
              </Button>

              {menuAberto && (
                <>
                  {/* Overlay para fechar ao clicar fora */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuAberto(false)}
                  ></div>

                  {/* Menu Dropdown Estilizado */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-2 py-2 mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        Navegação
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <ItemMenu
                        id="dashboard"
                        label="Dashboard"
                        icone={BarChart3}
                        corIcone="text-blue-500"
                      />
                      <ItemMenu
                        id="emprestimos"
                        label="Empréstimos"
                        icone={ClipboardList}
                        corIcone="text-emerald-500"
                      />
                      <ItemMenu
                        id="materiais"
                        label="Inventário"
                        icone={Package}
                        corIcone="text-orange-500"
                      />
                    </div>

                    <div className="h-px bg-gray-100 my-2 mx-2"></div>

                    <div className="px-2 py-1 mb-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        Minha Conta
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setModalSenhaAberto(true);
                        setMenuAberto(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-all group"
                    >
                      <KeyRound className="size-4 text-gray-400 group-hover:text-blue-500" />
                      Alterar Senha
                    </button>

                    {eAdmin && (
                      <>
                        <div className="h-px bg-gray-100 my-2 mx-2"></div>
                        <div className="px-2 py-1 mb-1">
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">
                            Gestão Administrativa
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <ItemMenu
                            id="usuarios"
                            label="Usuários"
                            icone={Users}
                            corIcone="text-indigo-500"
                          />
                          <ItemMenu
                            id="auditoria"
                            label="Logs de Sistema"
                            icone={ShieldCheck}
                            corIcone="text-purple-500"
                          />
                          <ItemMenu
                            id="configuracoes"
                            label="Configurações"
                            icone={Settings}
                            corIcone="text-gray-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            <Notificacoes />
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sair do sistema"
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-in fade-in duration-500">
          {paginaExibida === "dashboard" && <Dashboard />}
          {paginaExibida === "emprestimos" && <ControleFerramentaria />}
          {paginaExibida === "materiais" && <GerenciamentoMateriais />}
          {paginaExibida === "usuarios" && eAdmin && <GerenciamentoUsuarios />}
          {paginaExibida === "auditoria" && eAdmin && <HistoricoAuditoria />}
          {paginaExibida === "configuracoes" && eAdmin && (
            <ConfiguracoesSistema />
          )}
        </div>
      </main>

      <ModalAlterarSenha
        aberto={modalSenhaAberto}
        onFechar={() => setModalSenhaAberto(false)}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuditoriaProvider>
        <ConfiguracoesProvider>
          <MateriaisProvider>
            <EmprestimosProvider>
              <AppContent />
            </EmprestimosProvider>
          </MateriaisProvider>
        </ConfiguracoesProvider>
      </AuditoriaProvider>
    </AuthProvider>
  );
}
