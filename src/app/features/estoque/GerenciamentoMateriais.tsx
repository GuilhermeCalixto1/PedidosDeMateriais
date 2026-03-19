import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useMateriais } from '../../contexts/MateriaisContext';
import { useEmprestimos } from '../../contexts/EmprestimosContext'; // IMPORTAMOS OS EMPRESTIMOS
import { Button } from '../../components/ui/button';
import { FiltrosEstoque } from './components/FiltrosEstoque';
import { TabelaEstoque } from './components/TabelaEstoque';
import { ModalNovoMaterial } from './components/ModalNovoMaterial';

export function GerenciamentoMateriais() {
  const { materiais, carregando, adicionarMaterial, excluirMaterial, atualizarQuantidade } = useMateriais();
  const { emprestimos } = useEmprestimos(); // PUXAMOS OS DADOS DE EMPRÉSTIMO
  
  const [mostrarDialogNovo, setMostrarDialogNovo] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | 'mecanico' | 'eletrico'>('todas');

  const materiaisFiltrados = useMemo(() => {
    let resultado = materiais;
    if (buscaTexto.trim() !== '') {
      resultado = resultado.filter(m => m.nome.toLowerCase().includes(buscaTexto.toLowerCase()));
    }
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(m => m.categoria === filtroCategoria);
    }
    return resultado;
  }, [materiais, buscaTexto, filtroCategoria]);

  // MÁGICA: Juntamos a prateleira (materiais) com o que está na rua (emprestimos)
  const materiaisComTotais = useMemo(() => {
    return materiaisFiltrados.map(m => {
      // Procura todos os empréstimos pendentes desta ferramenta
      const pendentes = emprestimos.filter(e => e.status === 'Pendente' && e.materialSolicitado === m.nome);
      // Soma quantas unidades estão na rua
      const emUso = pendentes.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
      
      return {
        ...m,
        emUso: emUso,
        total: m.quantidade + emUso // Disponível na Prateleira + Em Uso na Rua
      };
    });
  }, [materiaisFiltrados, emprestimos]);

  const handleExcluir = async (id: string, nome: string) => {
    if (confirm(`Deseja realmente excluir "${nome}"?`)) {
      try {
        await excluirMaterial(id);
        toast.success(`"${nome}" foi removido.`);
      } catch (error) {
        toast.error(`Erro ao remover "${nome}".`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Inventário de Materiais</h2>
          <p className="text-gray-600 mt-1">Visão completa do patrimônio de ferramentas</p>
        </div>
        <Button onClick={() => setMostrarDialogNovo(true)} size="lg">
          <Plus className="size-5 mr-2" />
          Adicionar Ferramenta
        </Button>
      </div>

      <FiltrosEstoque 
        buscaTexto={buscaTexto} setBuscaTexto={setBuscaTexto}
        filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
      />

      <TabelaEstoque 
        materiais={materiaisComTotais} // Passamos a lista NOVA COM OS TOTAIS
        carregando={carregando}
        onAtualizarQuantidade={atualizarQuantidade}
        onExcluir={handleExcluir}
      />

      <ModalNovoMaterial 
        aberto={mostrarDialogNovo} onFechar={() => setMostrarDialogNovo(false)}
        adicionarMaterial={adicionarMaterial}
      />
    </div>
  );
}