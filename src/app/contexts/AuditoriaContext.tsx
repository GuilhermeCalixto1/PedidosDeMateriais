import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// O molde de um registo de atividade
export interface RegistroLog {
  id: string;
  data_hora: string;
  usuario: string;
  modulo: 'Inventário' | 'Empréstimos' | 'Sistema' | 'Configurações';
  acao: string;
  detalhes: string;
}

interface AuditoriaContextData {
  logs: RegistroLog[];
  registrarLog: (modulo: RegistroLog['modulo'], acao: string, detalhes: string) => void;
}

const AuditoriaContext = createContext<AuditoriaContextData | undefined>(undefined);

export function AuditoriaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<RegistroLog[]>([]);

  // Esta é a função "Espiã" que vamos chamar sempre que alguém fizer algo importante
  const registrarLog = (modulo: RegistroLog['modulo'], acao: string, detalhes: string) => {
    const novoLog: RegistroLog = {
      id: Math.random().toString(36).substring(2, 11),
      data_hora: new Date().toISOString(),
      usuario: user?.nome || 'Sistema', // Grava exatamente quem estava logado
      modulo,
      acao,
      detalhes,
    };
    
    // Adiciona o novo log no início da lista (o mais recente aparece primeiro)
    setLogs(prevLogs => [novoLog, ...prevLogs]);
  };

  return (
    <AuditoriaContext.Provider value={{ logs, registrarLog }}>
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