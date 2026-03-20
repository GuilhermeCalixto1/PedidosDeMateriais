import React, { useState, useMemo } from 'react';
import { Plus, Download, FileText, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useMateriais } from '../../contexts/MateriaisContext';
import { useEmprestimos } from '../../contexts/EmprestimosContext';
import { Button } from '../../components/ui/button';
import { FiltrosEstoque } from './components/FiltrosEstoque';
import { TabelaEstoque } from './components/TabelaEstoque';
import { ModalNovoMaterial } from './components/ModalNovoMaterial';
import { exportarParaExcel } from '../../utils/exportador';

export function GerenciamentoMateriais() {
  const { materiais, carregando, adicionarMaterial, excluirMaterial, atualizarQuantidade } = useMateriais();
  const { emprestimos } = useEmprestimos();
  
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

  // Juntamos a prateleira (materiais) com o que está na rua (emprestimos)
  const materiaisComTotais = useMemo(() => {
    return materiaisFiltrados.map(m => {
      const pendentes = emprestimos.filter(e => e.status === 'Pendente' && e.materialSolicitado === m.nome);
      const emUso = pendentes.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
      
      return {
        ...m,
        emUso: emUso,
        total: m.quantidade + emUso 
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

  const handleExportarExcel = () => {
    const colunas = {
      nome: 'Nome da Ferramenta',
      categoria: 'Categoria',
      total: 'Patrimônio Total (Unidades)',
      emUso: 'Em Uso na Empresa (Rua)',
      quantidade: 'Disponível na Prateleira'
    };

    exportarParaExcel(materiaisComTotais, 'Relatorio_Inventario', colunas);
    toast.success('Inventário exportado para Excel com sucesso!');
  };

  const handleEnviarEmail = () => {
    const preview = materiaisComTotais
      .slice(0, 20)
      .map((item) => `${item.nome} | ${item.categoria} | Total: ${item.total} | Em uso: ${item.emUso} | Disponível: ${item.quantidade}`)
      .join('\n');

    const corpo = [
      'Segue o resumo do inventario (com os filtros atuais):',
      '',
      preview || 'Sem dados para o filtro atual.',
      '',
      'Obs: para anexar arquivo, exporte em Excel e anexe manualmente no e-mail.'
    ].join('\n');

    const mailto = `mailto:?subject=${encodeURIComponent('Relatorio de Inventario')}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailto;
    toast.info('Cliente de e-mail aberto com o resumo.');
  };

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold">Inventário de Materiais</h2>
          <p className="text-gray-600 mt-1">Visão completa do patrimônio de ferramentas</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button onClick={() => window.print()} variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
            <FileText className="size-4 mr-2 text-red-600" /> 
            PDF / Imprimir
          </Button>
          
          <Button onClick={handleExportarExcel} variant="outline" className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300">
            <Download className="size-4 mr-2 text-green-600" /> 
            Excel
          </Button>

          <Button onClick={handleEnviarEmail} variant="outline" className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300">
            <Mail className="size-4 mr-2 text-blue-600" />
            E-mail
          </Button>

          <Button onClick={() => setMostrarDialogNovo(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="size-5 mr-2" /> Adicionar Ferramenta
          </Button>
        </div>
      </div>

      <div className="print:hidden">
        <FiltrosEstoque 
          buscaTexto={buscaTexto} setBuscaTexto={setBuscaTexto}
          filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
        />
      </div>

      <TabelaEstoque 
        materiais={materiaisComTotais} 
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