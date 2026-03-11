import React, { createContext, useContext, useState, useEffect } from 'react';
// Importamos o cliente que já tem a sua URL e Chave Anon
import { supabase } from '../../../utils/supabase/supabaseClient';

export interface Material {
  id: string;
  nome: string;
  categoria: 'mecanico' | 'eletrico';
  quantidade: number;
  data_registro?: string; // Ajustado para o padrão do banco (snake_case)
}

interface MateriaisContextType {
  materiais: Material[];
  carregando: boolean;
  adicionarMaterial: (material: Omit<Material, 'id' | 'data_registro'>) => Promise<void>;
  atualizarQuantidade: (id: string, novaQuantidade: number) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  recarregarMateriais: () => Promise<void>;
}

const MateriaisContext = createContext<MateriaisContextType | undefined>(undefined);

export function MateriaisProvider({ children }: { children: React.ReactNode }) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);

  // 1. Carregar materiais do Banco de Dados
  const carregarMateriais = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setMateriais(data || []);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
    } finally {
      setCarregando(false);
    }
  };

  // 2. Adicionar novo material no banco
  const adicionarMaterial = async (material: Omit<Material, 'id' | 'data_registro'>) => {
    try {
      const { error } = await supabase
        .from('materiais')
        .insert([material]);

      if (error) throw error;
      await carregarMateriais();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      throw error;
    }
  };

  // 3. Atualizar a quantidade (usado no + / - e nas baixas de estoque)
  const atualizarQuantidade = async (id: string, novaQuantidade: number) => {
    try {
      const { error } = await supabase
        .from('materiais')
        .update({ quantidade: novaQuantidade })
        .eq('id', id);
        
      if (error) throw error;
      
      // Atualiza o estado local para a UI refletir na hora
      setMateriais(prev => prev.map(m => m.id === id ? { ...m, quantidade: novaQuantidade } : m));
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  // 4. Excluir material do banco
  const excluirMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('materiais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await carregarMateriais();
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      throw error;
    }
  };

  useEffect(() => {
    carregarMateriais();
  }, []);

  return (
    <MateriaisContext.Provider
      value={{
        materiais,
        carregando,
        adicionarMaterial,
        atualizarQuantidade,
        excluirMaterial,
        recarregarMateriais: carregarMateriais,
      }}
    >
      {children}
    </MateriaisContext.Provider>
  );
}

export function useMateriais() {
  const context = useContext(MateriaisContext);
  if (context === undefined) {
    throw new Error('useMateriais deve ser usado dentro de MateriaisProvider');
  }
  return context;
}