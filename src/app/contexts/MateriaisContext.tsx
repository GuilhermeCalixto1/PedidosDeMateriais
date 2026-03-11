import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface Material {
  id: string;
  nome: string;
  categoria: 'mecanico' | 'eletrico';
  quantidade: number;
  dataRegistro: string;
}

interface MateriaisContextType {
  materiais: Material[];
  carregando: boolean;
  adicionarMaterial: (material: Omit<Material, 'id' | 'dataRegistro'>) => Promise<void>;
  atualizarQuantidade: (id: string, novaQuantidade: number) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  recarregarMateriais: () => Promise<void>;
}

const MateriaisContext = createContext<MateriaisContextType | undefined>(undefined);

export function MateriaisProvider({ children }: { children: React.ReactNode }) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarMateriais = async () => {
    setCarregando(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/materiais`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar materiais');
      }

      const data = await response.json();
      setMateriais(data);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      setMateriais([]);
    } finally {
      setCarregando(false);
    }
  };

  const adicionarMaterial = async (material: Omit<Material, 'id' | 'dataRegistro'>) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/materiais`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(material),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao adicionar material');
      }

      await carregarMateriais();
    } catch (error) {
      console.error('Erro ao adicionar material:', error);
      throw error;
    }
  };

  const atualizarQuantidade = async (id: string, novaQuantidade: number) => {
    try {
      console.log('Atualizando quantidade - ID:', id, 'Nova quantidade:', novaQuantidade);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/materiais/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantidade: novaQuantidade }),
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro na resposta:', errorData);
        throw new Error(`Erro ao atualizar quantidade: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Material atualizado com sucesso:', result);
      
      await carregarMateriais();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  };

  const excluirMaterial = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e214d17d/materiais/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao excluir material');
      }

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