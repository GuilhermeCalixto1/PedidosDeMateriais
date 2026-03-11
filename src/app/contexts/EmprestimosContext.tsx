import React, { createContext, useContext, useState, useEffect } from 'react';
// Importamos o cliente oficial que você já configurou
import { supabase } from '../../../utils/supabase/supabaseClient';

export interface Emprestimo {
  id: string;
  usuario: string; // Nome de quem retirou
  material_nome: string;
  quantidade: number;
  status: 'Pendente' | 'Devolvido';
  data_saida: string;
  observacao?: string;
}

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  carregando: boolean;
  adicionarEmprestimo: (novaSaida: Omit<Emprestimo, 'id' | 'status' | 'data_saida'>) => Promise<void>;
  marcarComoDevolvido: (emprestimo: Emprestimo) => Promise<void>;
  recarregarEmprestimos: () => Promise<void>;
}

const EmprestimosContext = createContext<EmprestimosContextType | undefined>(undefined);

export function EmprestimosProvider({ children }: { children: React.ReactNode }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

  // 1. Carregar empréstimos diretamente do Banco de Dados
  const carregarEmprestimos = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('emprestimos')
        .select('*')
        .order('data_saida', { ascending: false });

      if (error) throw error;
      setEmprestimos(data || []);
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Adicionar nova saída e já baixar o estoque
  const adicionarEmprestimo = async (novaSaida: Omit<Emprestimo, 'id' | 'status' | 'data_saida'>) => {
    try {
      // Registrar o empréstimo
      const { data: emprestimoCriado, error: errEmprestimo } = await supabase
        .from('emprestimos')
        .insert([{ 
          ...novaSaida, 
          status: 'Pendente' 
        }])
        .select()
        .single();

      if (errEmprestimo) throw errEmprestimo;

      // ATENÇÃO: Aqui fazemos a baixa no estoque automaticamente
      const { data: materialData } = await supabase
        .from('materiais')
        .select('quantidade')
        .eq('nome', novaSaida.material_nome)
        .single();

      if (materialData) {
        await supabase
          .from('materiais')
          .update({ quantidade: materialData.quantidade - novaSaida.quantidade })
          .eq('nome', novaSaida.material_nome);
      }

      await carregarEmprestimos();
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      throw error;
    }
  };

  // 3. Marcar como devolvido e devolver o item ao estoque
  const marcarComoDevolvido = async (emprestimo: Emprestimo) => {
    try {
      // Atualizar status no banco
      const { error: errUpdate } = await supabase
        .from('emprestimos')
        .update({ status: 'Devolvido' })
        .eq('id', emprestimo.id);

      if (errUpdate) throw errUpdate;

      // Buscar quantidade atual para somar a devolução
      const { data: materialData } = await supabase
        .from('materiais')
        .select('quantidade')
        .eq('nome', emprestimo.material_nome)
        .single();

      if (materialData) {
        await supabase
          .from('materiais')
          .update({ quantidade: materialData.quantidade + emprestimo.quantidade })
          .eq('nome', emprestimo.material_nome);
      }

      await carregarEmprestimos();
    } catch (error) {
      console.error('Erro ao devolver material:', error);
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
