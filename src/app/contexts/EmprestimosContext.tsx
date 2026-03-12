import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase/supabaseClient';

export interface Emprestimo {
  id: string;
  usuario: string; 
  materialSolicitado: string;
  material_categoria: 'mecanico' | 'eletrico';
  gerencia: string;
  quantidade: number;
  status: 'Pendente' | 'Devolvido';
  data_saida: string;
  observacao?: string;
}

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  carregando: boolean;
  adicionarEmprestimo: (novaSaida: Omit<Emprestimo, 'id' | 'status'>, materialId?: string) => Promise<void>;
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
      setEmprestimos(data as Emprestimo[] || []);
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
          status: 'Pendente',
          materialSolicitado: novaSaida.materialSolicitado, 
          material_categoria: novaSaida.material_categoria, 
          gerencia: novaSaida.gerencia, 
        }]);

      if (errEmprestimo) throw errEmprestimo;

      const materialQuery = supabase
        .from('materiais')
        .select('id, quantidade');

      if (materialId) {
        materialQuery.eq('id', materialId);
      } else {
        materialQuery.ilike('nome', novaSaida.materialSolicitado);
      }

      const { data: materialData, error: errMaterial } = await materialQuery.maybeSingle();

      if (errMaterial) {
        console.error('Erro ao buscar material para atualizar estoque:', errMaterial);
      } else if (materialData) {
        // GARANTIA: Usamos Number() para garantir que é matemática (ex: 5 - 1 = 4)
        const novaQnt = Math.max(0, Number(materialData.quantidade) - Number(novaSaida.quantidade));
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
        .ilike('nome', emprestimo.materialSolicitado)
        .maybeSingle();

      if (errMaterial) {
        console.error('Erro ao buscar material para devolver:', errMaterial);
      } else if (materialData) {
        // GARANTIA: Usamos Number() para não juntar as strings (ex: evitar que 5 + 1 vire 51)
        const novaQnt = Math.max(0, Number(materialData.quantidade) + Number(emprestimo.quantidade));
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