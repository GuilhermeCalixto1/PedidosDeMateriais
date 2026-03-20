import React, { createContext, useContext, useState, ReactNode } from 'react';

// O "molde" dos nossos limites
interface Configuracoes {
  limiteCargaAlta: number;
  diasAlertaPerda: number;
  estoqueMinimoRuptura: number;
}

interface ConfiguracoesContextData {
  configuracoes: Configuracoes;
  atualizarConfiguracoes: (novasConfiguracoes: Partial<Configuracoes>) => void;
}

const ConfiguracoesContext = createContext<ConfiguracoesContextData | undefined>(undefined);

export function ConfiguracoesProvider({ children }: { children: ReactNode }) {
  // Valores padrão de fábrica
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    limiteCargaAlta: 15,
    diasAlertaPerda: 7,
    estoqueMinimoRuptura: 2,
  });

  const atualizarConfiguracoes = (novasConfiguracoes: Partial<Configuracoes>) => {
    setConfiguracoes(prev => ({ ...prev, ...novasConfiguracoes }));
  };

  return (
    <ConfiguracoesContext.Provider value={{ configuracoes, atualizarConfiguracoes }}>
      {children}
    </ConfiguracoesContext.Provider>
  );
}

export function useConfiguracoes() {
  const context = useContext(ConfiguracoesContext);
  if (context === undefined) {
    throw new Error('useConfiguracoes deve ser usado dentro de um ConfiguracoesProvider');
  }
  return context;
}