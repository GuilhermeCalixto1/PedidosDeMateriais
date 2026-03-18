import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { materiaisService } from '../services/materiaisService';
import { Material, MaterialDTO } from '../types';

interface MateriaisContextType {
  materiais: Material[];
  carregando: boolean;
  adicionarMaterial: (novo: MaterialDTO) => Promise<void>;
  atualizarQuantidade: (id: string, novaQuantidade: number) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  recarregarMateriais: () => Promise<void>;
}

const MateriaisContext = createContext<MateriaisContextType | undefined>(undefined);

export function MateriaisProvider({ children }: { children: React.ReactNode }) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregarMateriais = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await materiaisService.obterTodos();
      setMateriais(dados as Material[]);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }, []);

  const adicionarMaterial = async (novoMaterial: MaterialDTO) => {
    try {
      await materiaisService.criar(novoMaterial);
      await carregarMateriais(); 
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const atualizarQuantidade = async (id: string, novaQuantidade: number) => {
    setMateriais(prev => prev.map(m => m.id === id ? { ...m, quantidade: novaQuantidade } : m));
    
    try {
      await materiaisService.atualizarQuantidade(id, novaQuantidade);
    } catch (error) {
      console.error(error);
      await carregarMateriais();
    }
  };

  const excluirMaterial = async (id: string) => {
    try {
      await materiaisService.excluir(id);
      setMateriais(prev => prev.filter(m => m.id !== id)); 
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    carregarMateriais();
  }, [carregarMateriais]);

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
    throw new Error('useMateriais deve ser usado dentro de um MateriaisProvider');
  }
  return context;
}