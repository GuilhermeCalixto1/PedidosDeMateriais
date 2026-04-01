import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { emprestimosService } from '../services/emprestimosService';
import { Emprestimo, NovaSaidaDTO } from '../types';
import { useAuditoria } from './AuditoriaContext'; // <-- IMPORT DO ESPIÃO

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  carregando: boolean;
  adicionarEmprestimo: (novaSaida: NovaSaidaDTO, materialId?: string) => Promise<void>;
  marcarComoDevolvido: (emprestimo: Emprestimo, dadosDevolucao: { data_devolucao: string; responsavel_recebimento: string; em_perfeitas_condicoes: boolean; observacao_avaria?: string }) => Promise<void>;
  excluirEmprestimoPendente: (emprestimo: Emprestimo) => Promise<void>;
  recarregarEmprestimos: () => Promise<void>;
}

const EmprestimosContext = createContext<EmprestimosContextType | undefined>(undefined);

export function EmprestimosProvider({ children }: { children: React.ReactNode }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Ligamos a Auditoria
  const { registrarLog } = useAuditoria();

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
      
      // REGISTO DE AUDITORIA
      registrarLog('Empréstimos', 'Nova Saída', `Entregou ${novaSaida.quantidade}x "${novaSaida.materialSolicitado}" para o funcionário ${novaSaida.usuario}`);

      await carregarEmprestimos();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const marcarComoDevolvido = async (emprestimo: Emprestimo, dadosDevolucao: { data_devolucao: string; responsavel_recebimento: string; em_perfeitas_condicoes: boolean; observacao_avaria?: string }) => {
    try {
      await emprestimosService.registrarDevolucao(emprestimo, dadosDevolucao);
      
      // REGISTO DE AUDITORIA
      registrarLog('Empréstimos', 'Devolução', `Recebeu ${emprestimo.quantidade}x "${emprestimo.materialSolicitado}" de volta do funcionário ${emprestimo.usuario}`);

      await carregarEmprestimos();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const excluirEmprestimoPendente = async (emprestimo: Emprestimo) => {
    try {
      await emprestimosService.excluirPendente(emprestimo);
      
      // REGISTO DE AUDITORIA
      registrarLog('Empréstimos', 'Excluir Saída', `Cancelou o registo de saída pendente de ${emprestimo.quantidade}x "${emprestimo.materialSolicitado}" para ${emprestimo.usuario}`);

      await carregarEmprestimos();
    } catch (error) {
      console.error(error);
      throw error;
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
        excluirEmprestimoPendente,
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