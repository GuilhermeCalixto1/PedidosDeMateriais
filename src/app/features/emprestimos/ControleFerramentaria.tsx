import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useEmprestimos } from '../../contexts/EmprestimosContext';
import { useMateriais } from '../../contexts/MateriaisContext'; 
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, Package, Printer } from 'lucide-react';
import { toast } from 'sonner';

// Os nossos componentes refatorados!
import { FormularioSaida } from './components/FormularioSaida';
import { CartaoEmprestimo } from './components/CartaoEmprestimo'; 
import { TabelaImpressao } from './components/TabelaImpressao'; 
import { FiltrosEmprestimo } from './components/FiltrosEmprestimo';
import { ModalDevolucao } from './components/ModalDevolucao'; // IMPORTÁMOS O MODAL

export function ControleFerramentaria() {
  const { user } = useAuth();
  const { emprestimos, marcarComoDevolvido, carregando } = useEmprestimos();
  const { recarregarMateriais } = useMateriais();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'Pendente' | 'Devolvido'>('Pendente');
  const [processando, setProcessando] = useState(false);
  
  // Estados partilhados para os Filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroGerencia, setFiltroGerencia] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Estados partilhados para a Devolução
  const [emprestimoParaDevolver, setEmprestimoParaDevolver] = useState<any>(null);
  const [dataDevolucao, setDataDevolucao] = useState(() => new Date().toISOString().split('T')[0]);
  const [nomeRecebedor, setNomeRecebedor] = useState('');
  const [matriculaRecebedor, setMatriculaRecebedor] = useState('');

  // Lógica de filtragem dos dados
  const emprestimosFiltrados = useMemo(() => {
    let resultado = emprestimos;

    if (abaAtiva === 'Pendente') {
      resultado = resultado.filter(e => e.status === 'Pendente');
    } else if (abaAtiva === 'Devolvido') {
      resultado = resultado.filter(e => e.status === 'Devolvido');
    }

    if (buscaTexto.trim() !== '') {
      const termoBusca = buscaTexto.toLowerCase();
      resultado = resultado.filter(e => 
        (e.usuario && e.usuario.toLowerCase().includes(termoBusca)) ||
        (e.materialSolicitado && e.materialSolicitado.toLowerCase().includes(termoBusca)) 
      );
    }

    if (filtroDataInicio !== '' || filtroDataFim !== '') {
      resultado = resultado.filter(e => {
        if (!e.data_saida) return false;
        const dataEmprestimo = e.data_saida.split('T')[0];

        if (filtroDataInicio !== '' && filtroDataFim !== '') {
          return dataEmprestimo >= filtroDataInicio && dataEmprestimo <= filtroDataFim;
        } else if (filtroDataInicio !== '') {
          return dataEmprestimo === filtroDataInicio;
        } else if (filtroDataFim !== '') {
          return dataEmprestimo === filtroDataFim;
        }
        return true;
      });
    }

    if (filtroGerencia.trim() !== '') {
      const termoGerencia = filtroGerencia.toLowerCase();
      resultado = resultado.filter(e => 
        e.gerencia && e.gerencia.toLowerCase().includes(termoGerencia)
      );
    }

    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(e => e.material_categoria === filtroCategoria);
    }

    return resultado;
  }, [emprestimos, abaAtiva, buscaTexto, filtroDataInicio, filtroDataFim, filtroGerencia, filtroCategoria]);

  const pendentesParaImprimir = useMemo(() => {
    return emprestimosFiltrados.filter(e => e.status === 'Pendente');
  }, [emprestimosFiltrados]);

  const contadores = useMemo(() => ({
    todos: emprestimos.length,
    pendente: emprestimos.filter(e => e.status === 'Pendente').length,
    devolvido: emprestimos.filter(e => e.status === 'Devolvido').length,
  }), [emprestimos]);

  const limparFiltros = () => {
    setBuscaTexto('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltroGerencia('');
    setFiltroCategoria('todas');
  };

  const abrirModalDevolucao = (emprestimo: any) => {
    setEmprestimoParaDevolver(emprestimo);
    if (user) {
      setNomeRecebedor(user.nome);
      setMatriculaRecebedor(user.matricula);
    }
    setDataDevolucao(new Date().toISOString().split('T')[0]);
  };

 const confirmarDevolucao = async () => {
    if (!emprestimoParaDevolver || !nomeRecebedor || !matriculaRecebedor) return;
    
    setProcessando(true);
    const responsavel = `${nomeRecebedor} (Mat: ${matriculaRecebedor})`;
    
    try {
      await marcarComoDevolvido(emprestimoParaDevolver, {
        data_devolucao: dataDevolucao,
        responsavel_recebimento: responsavel
      });
      
      if (recarregarMateriais) {
        await recarregarMateriais();
      }
      
      // SUCESSO!
      toast.success(`A ferramenta "${emprestimoParaDevolver.materialSolicitado}" foi devolvida com sucesso!`);
      
      setEmprestimoParaDevolver(null);
      setNomeRecebedor('');
      setMatriculaRecebedor('');
    } catch (error) {
      // ERRO!
      toast.error('Ocorreu um erro ao tentar registar a devolução. Verifique a sua ligação.');
    } finally {
      setProcessando(false);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const temFiltroAtivo = buscaTexto !== '' || filtroDataInicio !== '' || filtroDataFim !== '' || filtroGerencia !== '' || filtroCategoria !== 'todas';

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Empréstimos de Ferramentas</h2>
            <p className="text-gray-600 mt-1">Gerencie saídas e devoluções de materiais</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button onClick={handleImprimir} variant="outline" className="w-full sm:w-auto">
              <Printer className="size-4 mr-2" /> Imprimir Pendentes Filtrados
            </Button>
            <Button onClick={() => setMostrarFormulario(true)} size="default" className="w-full sm:w-auto">
              <Plus className="size-5 mr-2" /> Nova Saída
            </Button>
          </div>
        </div>

        {/* Corpo Principal (Abas) */}
        <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as typeof abaAtiva)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="Pendente">Pendentes ({contadores.pendente})</TabsTrigger>
            <TabsTrigger value="Devolvido">Devolvidos ({contadores.devolvido})</TabsTrigger>
            <TabsTrigger value="todos">Todos ({contadores.todos})</TabsTrigger>
          </TabsList>

          <FiltrosEmprestimo 
            buscaTexto={buscaTexto} setBuscaTexto={setBuscaTexto}
            filtroDataInicio={filtroDataInicio} setFiltroDataInicio={setFiltroDataInicio}
            filtroDataFim={filtroDataFim} setFiltroDataFim={setFiltroDataFim}
            filtroGerencia={filtroGerencia} setFiltroGerencia={setFiltroGerencia}
            filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
            temFiltroAtivo={temFiltroAtivo} limparFiltros={limparFiltros}
          />

          <TabsContent value={abaAtiva} className="mt-0">
            {emprestimosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="size-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum empréstimo encontrado</h3>
                  <p className="text-gray-600 mb-4">Nenhum resultado para exibir com os filtros atuais.</p>
                  {temFiltroAtivo && (
                    <Button variant="outline" onClick={limparFiltros}>Limpar Filtros</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {emprestimosFiltrados.map((emprestimo) => (
                  <CartaoEmprestimo 
                    key={emprestimo.id} 
                    emprestimo={emprestimo} 
                    onAbrirDevolucao={() => abrirModalDevolucao(emprestimo)} 
                    processando={processando} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {emprestimosFiltrados.length > 0 && (
          <div className="text-center text-sm text-gray-600">
            Exibindo {emprestimosFiltrados.length} itens
          </div>
        )}

        {/* Componentes Flutuantes (Modais) */}
        {mostrarFormulario && <FormularioSaida onFechar={() => setMostrarFormulario(false)} />}
      </div>

      <ModalDevolucao 
        emprestimo={emprestimoParaDevolver}
        dataDevolucao={dataDevolucao}
        setDataDevolucao={setDataDevolucao}
        nomeRecebedor={nomeRecebedor}
        matriculaRecebedor={matriculaRecebedor}
        processando={processando}
        onConfirmar={confirmarDevolucao}
        onCancelar={() => setEmprestimoParaDevolver(null)}
      />

      {/* Tabela Escondida (Apenas para Impressão) */}
      <TabelaImpressao pendentes={pendentesParaImprimir} temFiltroAtivo={temFiltroAtivo} />
    </>
  );
}