import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// 1. Contextos (voltamos 2 pastas: features -> app -> contexts)
import { useMateriais } from '../../contexts/MateriaisContext';

// 2. Componentes UI Genéricos (voltamos 2 pastas: features -> app -> components/ui)
import { Button } from '../../components/ui/button';

// 3. Componentes Locais desta Feature
import { FiltrosEstoque } from './components/FiltrosEstoque';
import { TabelaEstoque } from './components/TabelaEstoque';
import { ModalNovoMaterial } from './components/ModalNovoMaterial';

export function GerenciamentoMateriais() {
  const { materiais, carregando, adicionarMaterial, excluirMaterial, atualizarQuantidade } = useMateriais();
  
  // Estados partilhados
  const [mostrarDialogNovo, setMostrarDialogNovo] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | 'mecanico' | 'eletrico'>('todas');

  // Lógica de negócio: Filtrar materiais
  const materiaisFiltrados = useMemo(() => {
    let resultado = materiais;

    if (buscaTexto.trim() !== '') {
      const termo = buscaTexto.toLowerCase();
      resultado = resultado.filter(m => m.nome.toLowerCase().includes(termo));
    }

    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(m => m.categoria === filtroCategoria);
    }

    return resultado;
  }, [materiais, buscaTexto, filtroCategoria]);

  // Lógica de negócio: Excluir
 const handleExcluir = async (id: string, nome: string) => {
    if (confirm(`Deseja realmente excluir "${nome}"?`)) {
      try {
        await excluirMaterial(id);
        toast.success(`"${nome}" foi removido do estoque.`); // SUCESSO!
      } catch (error) {
        toast.error(`Não foi possível remover "${nome}". Verifique a conexão.`); // ERRO!
      }
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Inventário de Materiais</h2>
          <p className="text-gray-600 mt-1">Gerencie o estoque de ferramentas</p>
        </div>
        <Button onClick={() => setMostrarDialogNovo(true)} size="lg">
          <Plus className="size-5 mr-2" />
          Adicionar Ferramenta
        </Button>
      </div>

      <FiltrosEstoque 
        buscaTexto={buscaTexto}
        setBuscaTexto={setBuscaTexto}
        filtroCategoria={filtroCategoria}
        setFiltroCategoria={setFiltroCategoria}
      />

      <TabelaEstoque 
        materiais={materiaisFiltrados}
        carregando={carregando}
        onAtualizarQuantidade={atualizarQuantidade}
        onExcluir={handleExcluir}
      />

      <ModalNovoMaterial 
        aberto={mostrarDialogNovo}
        onFechar={() => setMostrarDialogNovo(false)}
        adicionarMaterial={adicionarMaterial}
      />
    </div>
  );
}