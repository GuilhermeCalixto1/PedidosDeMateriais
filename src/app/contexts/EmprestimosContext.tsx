import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { emprestimosService } from '../services/emprestimosService';
import { Emprestimo, NovaSaidaDTO } from '../types';

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  carregando: boolean;
  adicionarEmprestimo: (novaSaida: NovaSaidaDTO, materialId?: string) => Promise<void>;
  marcarComoDevolvido: (emprestimo: Emprestimo, dadosDevolucao: { data_devolucao: string; responsavel_recebimento: string }) => Promise<void>;
  recarregarEmprestimos: () => Promise<void>;
}

const EmprestimosContext = createContext<EmprestimosContextType | undefined>(undefined);

export function EmprestimosProvider({ children }: { children: React.ReactNode }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarEmprestimos = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await emprestimosService.obterTodos();
      setEmprestimos(dados as Emprestimo[]);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, []);

  const adicionarEmprestimo = async (novaSaida: NovaSaidaDTO, materialId?: string) => {
    try {
      await emprestimosService.registrarSaida(novaSaida, materialId);
      await carregarEmprestimos();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const marcarComoDevolvido = async (emprestimo: Emprestimo, dadosDevolucao: { data_devolucao: string; responsavel_recebimento: string }) => {
    try {
      await emprestimosService.registrarDevolucao(emprestimo, dadosDevolucao);
      await carregarEmprestimos();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    carregarEmprestimos();
  }, [carregarEmprestimos]);

  return (
    <EmprestimosContext.Provider
      value={{
        emprestimos,
        carregando,
        adicionarEmprestimo,
        marcarComoDevolvido,
        recarregarEmprestimos: carregarEmprestimos,
      }}
    >
      {children}
    </EmprestimosContext.Provider>
  );
}

export function useEmprestimos() {
  const context = useContext(EmprestimosContext);
  if (context === undefined) {
    throw new Error('useEmprestimos deve ser usado dentro de um EmprestimosProvider');
  }
  return context;
}