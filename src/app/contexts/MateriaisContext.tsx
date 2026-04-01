import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { materiaisService } from '../services/materiaisService';
import { Material, MaterialDTO } from '../types';
import { useAuditoria } from './AuditoriaContext'; // <-- IMPORT DO ESPIÃO

interface MateriaisContextType {
  materiais: Material[];
  carregando: boolean;
  adicionarMaterial: (novo: MaterialDTO) => Promise<void>;
  atualizarQuantidade: (id: string, novaQuantidade: number, novasAvariadas?: number) => Promise<void>;
  excluirMaterial: (id: string) => Promise<void>;
  recarregarMateriais: () => Promise<void>;
}

const MateriaisContext = createContext<MateriaisContextType | undefined>(undefined);

export function MateriaisProvider({ children }: { children: React.ReactNode }) {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Ligamos a Auditoria
  const { registrarLog } = useAuditoria();

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
      
      // REGISTO DE AUDITORIA
      registrarLog('Inventário', 'Adicionar Material', `Cadastrou ${novoMaterial.quantidade}x ${novoMaterial.nome} (${novoMaterial.categoria})`);
      
      await carregarMateriais(); 
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const atualizarQuantidade = async (id: string, novaQuantidade: number, novasAvariadas?: number) => {
    // Guarda o material antigo para saber o que mudou
    const materialAntigo = materiais.find(m => m.id === id);
    
    setMateriais(prev => prev.map(m => m.id === id ? { ...m, quantidade: novaQuantidade, avariadas: novasAvariadas !== undefined ? novasAvariadas : m.avariadas } : m));
    
    try {
      await materiaisService.atualizarQuantidade(id, novaQuantidade, novasAvariadas);
      
      // REGISTO DE AUDITORIA
      if (materialAntigo && materialAntigo.quantidade !== novaQuantidade) {
        registrarLog('Inventário', 'Atualizar Quantidade', `Alterou o stock de "${materialAntigo.nome}" de ${materialAntigo.quantidade} para ${novaQuantidade}`);
      }
      if (materialAntigo && novasAvariadas !== undefined && materialAntigo.avariadas !== novasAvariadas) {
        registrarLog('Inventário', 'Atualizar Avariadas', `Alterou as ferramentas avariadas de "${materialAntigo.nome}" de ${materialAntigo.avariadas || 0} para ${novasAvariadas}`);
      }
    } catch (error) {
      console.error(error);
      await carregarMateriais();
    }
  };

  const excluirMaterial = async (id: string) => {
    const materialExcluido = materiais.find(m => m.id === id);
    try {
      await materiaisService.excluir(id);
      
      // REGISTO DE AUDITORIA
      if (materialExcluido) {
        registrarLog('Inventário', 'Excluir Material', `Removeu a ferramenta "${materialExcluido.nome}" do sistema`);
      }
      
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