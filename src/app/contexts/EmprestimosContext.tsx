import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase/supabaseClient';

export interface Emprestimo {
  id: string;
  usuario: string; 
  material_nome: string;
  material_categoria: 'mecanico' | 'eletrico'; // Nova propriedade para categoria do material
  gerencia: string; // Nova propriedade para gerência
  quantidade: number;
  status: 'Pendente' | 'Devolvido';
  data_saida: string;
  observacao?: string;
}

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  carregando: boolean;
  adicionarEmprestimo: (novaSaida: Omit<Emprestimo, 'id' | 'status' | 'material_categoria'> & { material_categoria: 'mecanico' | 'eletrico' }, materialId?: string) => Promise<void>;
  marcarComoDevolvido: (emprestimo: Emprestimo) => Promise<void>;
  recarregarEmprestimos: () => Promise<void>;
}

const EmprestimosContext = createContext<EmprestimosContextType | undefined>(undefined);

export function EmprestimosProvider({ children }: { children: React.ReactNode }) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [carregando, setCarregando] = useState(true);

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

  const adicionarEmprestimo = async (novaSaida: Omit<Emprestimo, 'id' | 'status'>, materialId?: string) => {
    try {
      const { error: errEmprestimo } = await supabase
        .from('emprestimos')
        .insert([{ 
          ...novaSaida, 
          status: 'Pendente' 
        }]);

      if (errEmprestimo) throw errEmprestimo;

      const materialQuery = supabase
        .from('materiais')
        .select('id, quantidade');

      if (materialId) {
        materialQuery.eq('id', materialId);
      } else {
        materialQuery.ilike('nome', novaSaida.material_nome);
      }

      const { data: materialData, error: errMaterial } = await materialQuery.maybeSingle();

      if (errMaterial) {
        console.error('Erro ao buscar material para atualizar estoque:', errMaterial);
      } else if (materialData) {
        const novaQnt = Math.max(0, materialData.quantidade - novaSaida.quantidade);
        await supabase
          .from('materiais')
          .update({ quantidade: novaQnt })
          .eq('id', materialData.id);
      }

      await carregarEmprestimos();
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      throw error;
    }
  };

  const marcarComoDevolvido = async (emprestimo: Emprestimo) => {
    try {
      const { error: errUpdate } = await supabase
        .from('emprestimos')
        .update({ status: 'Devolvido' })
        .eq('id', emprestimo.id);

      if (errUpdate) throw errUpdate;

      const { data: materialData, error: errMaterial } = await supabase
        .from('materiais')
        .select('id, quantidade')
        .ilike('nome', emprestimo.material_nome)
        .maybeSingle();

      if (errMaterial) {
        console.error('Erro ao buscar material para devolver:', errMaterial);
      } else if (materialData) {
        const novaQnt = Math.max(0, materialData.quantidade + emprestimo.quantidade);
        await supabase
          .from('materiais')
          .update({ quantidade: novaQnt })
          .eq('id', materialData.id);
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
