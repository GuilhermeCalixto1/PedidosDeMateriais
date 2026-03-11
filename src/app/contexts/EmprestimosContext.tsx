import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Emprestimo {
  id: string;
  materialSolicitado: string;
  categoria: 'mecanico' | 'eletrico';
  data: string;
  nomeFuncionario: string;
  matricula: string;
  responsavelEntrega: string;
  responsavelEntregaId: string;
  status: 'pendente' | 'devolvido';
  dataRegistro: string;
  dataDevolucao?: string;
  responsavelDevolucao?: string;
  responsavelDevolucaoId?: string;
}

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  carregando: boolean;
  adicionarEmprestimo: (emprestimo: Omit<Emprestimo, 'id' | 'dataRegistro' | 'status'>) => Promise<void>;
  marcarComoDevolvido: (id: string, responsavelDevolucao: string, responsavelDevolucaoId: string) => Promise<void>;
  recarregarEmprestimos: () => Promise<void>;
}

const EmprestimosContext = createContext<EmprestimosContextType | undefined>(undefined);

export function EmprestimosProvider({ children }: { children: React.ReactNode }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarEmprestimos = async () => {
    setCarregando(true);
    try {
      console.log('Carregando empréstimos do servidor...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/emprestimos`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar empréstimos');
      }

      const data = await response.json();
      console.log('Empréstimos carregados:', data.length);
      setEmprestimos(data);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      setEmprestimos([]);
    } finally {
      setCarregando(false);
    }
  };

  const adicionarEmprestimo = async (emprestimo: Omit<Emprestimo, 'id' | 'dataRegistro' | 'status'>) => {
    try {
      console.log('Adicionando empréstimo:', emprestimo);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/emprestimos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emprestimo),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', errorData);
        throw new Error('Erro ao adicionar empréstimo');
      }

      const novoEmprestimo = await response.json();
      console.log('Empréstimo adicionado com sucesso:', novoEmprestimo);

      await carregarEmprestimos();
    } catch (error) {
      console.error('Erro ao adicionar empréstimo:', error);
      throw error;
    }
  };

  const marcarComoDevolvido = async (id: string, responsavelDevolucao: string, responsavelDevolucaoId: string) => {
    try {
      console.log('Marcando empréstimo como devolvido:', { id, responsavelDevolucao, responsavelDevolucaoId });
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/emprestimos/${id}/devolver`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ responsavelDevolucao, responsavelDevolucaoId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', errorData);
        throw new Error('Erro ao marcar como devolvido');
      }

      const emprestimoAtualizado = await response.json();
      console.log('Empréstimo marcado como devolvido:', emprestimoAtualizado);

      await carregarEmprestimos();
    } catch (error) {
      console.error('Erro ao marcar empréstimo como devolvido:', error);
      throw error;
    }
  };

  useEffect(() => {
    carregarEmprestimos();
  }, []);

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
