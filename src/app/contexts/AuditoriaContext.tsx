import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { auditoriaService } from '../services/auditoriaService';

export interface RegistroLog {
  id: string;
  data_hora: string;
  usuario: string;
  modulo: string;
  acao: string;
  detalhes: string;
}

interface AuditoriaContextData {
  logs: RegistroLog[];
  carregando: boolean;
  registrarLog: (modulo: string, acao: string, detalhes: string) => Promise<void>;
  recarregarLogs: () => Promise<void>;
}

const AuditoriaContext = createContext<AuditoriaContextData | undefined>(undefined);

export function AuditoriaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RegistroLog[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Função que vai ao Supabase buscar todo o histórico real
  const carregarLogs = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await auditoriaService.obterLogs();
      setLogs(dados as RegistroLog[]);
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Assim que o sistema abre, ele puxa os dados
  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);

  // Função Espiã atualizada: Agora ela grava no banco de dados!
  const registrarLog = async (modulo: string, acao: string, detalhes: string) => {
    try {
      await auditoriaService.registrarLog({
        usuario: user?.nome || 'Sistema',
        modulo,
        acao,
        detalhes,
      });
      // Após gravar, pede ao sistema para recarregar a lista e mostrar o novo log na tabela
      await carregarLogs();
    } catch (error) {
      console.error("Erro ao gravar log de auditoria no banco:", error);
    }
  };

  return (
    <AuditoriaContext.Provider value={{ logs, carregando, registrarLog, recarregarLogs: carregarLogs }}>
      {children}
    </AuditoriaContext.Provider>
  );
}

export function useAuditoria() {
  const context = useContext(AuditoriaContext);
  if (context === undefined) {
    throw new Error('useAuditoria deve ser usado dentro de um AuditoriaProvider');
  }
  return context;
}