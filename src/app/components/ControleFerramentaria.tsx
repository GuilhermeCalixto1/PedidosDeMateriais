import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { useMateriais } from '../contexts/MateriaisContext'; 
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Package, CheckCircle, Clock, Search, Calendar, Filter, FileText, Printer, Zap, Wrench } from 'lucide-react';
import { FormularioSaida } from './FormularioSaida';

export function ControleFerramentaria() {
  const { user } = useAuth();
  const { emprestimos, marcarComoDevolvido, carregando } = useEmprestimos();
  const { recarregarMateriais } = useMateriais();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'Pendente' | 'Devolvido'>('Pendente');
  const [processando, setProcessando] = useState(false);
  
  // Estados dos Filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroGerencia, setFiltroGerencia] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Estados para o Modal de Devolução
  const [emprestimoParaDevolver, setEmprestimoParaDevolver] = useState<any>(null);
  const [dataDevolucao, setDataDevolucao] = useState(() => new Date().toISOString().split('T')[0]);
  const [nomeRecebedor, setNomeRecebedor] = useState('');
  const [matriculaRecebedor, setMatriculaRecebedor] = useState('');

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

  // AQUI FOI A MUDANÇA: Agora ele pega da lista "emprestimosFiltrados" ao invés de "emprestimos" gerais
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
    
    await marcarComoDevolvido(emprestimoParaDevolver, {
      data_devolucao: dataDevolucao,
      responsavel_recebimento: responsavel
    });
    
    if (recarregarMateriais) {
      await recarregarMateriais();
    }
    
    setEmprestimoParaDevolver(null);
    setNomeRecebedor('');
    setMatriculaRecebedor('');
    setProcessando(false);
  };

  const handleImprimir = () => {
    window.print();
  };

  const getStatusBadge = (status: 'Pendente' | 'Devolvido') => {
    if (status === 'Pendente') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="size-3 mr-1" /> Pendente</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="size-3 mr-1" /> Devolvido</Badge>;
  };

  const getCategoriaBadge = (categoria?: string) => {
    if (categoria === 'eletrico') {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200"><Zap className="size-3 mr-1" /> Elétrico</Badge>;
    }
    if (categoria === 'mecanico') {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200"><Wrench className="size-3 mr-1" /> Mecânico</Badge>;
    }
    return null;
  };

  const temFiltroAtivo = buscaTexto !== '' || filtroDataInicio !== '' || filtroDataFim !== '' || filtroGerencia !== '' || filtroCategoria !== 'todas';

  return (
    <>
      <div className="space-y-6 print:hidden">
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

        <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as typeof abaAtiva)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="Pendente">Pendentes ({contadores.pendente})</TabsTrigger>
            <TabsTrigger value="Devolvido">Devolvidos ({contadores.devolvido})</TabsTrigger>
            <TabsTrigger value="todos">Todos ({contadores.todos})</TabsTrigger>
          </TabsList>

          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="size-5 text-blue-600" />
                <CardTitle className="text-lg">Filtros de Busca</CardTitle>
              </div>
              <CardDescription>Refine a sua lista combinando os filtros abaixo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="busca">Funcionário, Matrícula ou Ferramenta</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input id="busca" placeholder="Digite aqui..." value={buscaTexto} onChange={(e) => setBuscaTexto(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label>Período de Saída</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                      <Input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="pl-10" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">até</span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                      <Input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="pl-10" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="gerencia">Filtrar por Gerência</Label>
                  <Input id="gerencia" placeholder="Ex: Manutenção, Produção..." value={filtroGerencia} onChange={(e) => setFiltroGerencia(e.target.value)} />
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="categoria">Filtrar por Categoria</Label>
                  <select
                    id="categoria"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="todas">Todas as Categorias</option>
                    <option value="mecanico">Mecânico</option>
                    <option value="eletrico">Elétrico</option>
                  </select>
                </div>

              </div>

              {temFiltroAtivo && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={limparFiltros}>Limpar Todos os Filtros</Button>
                </div>
              )}
            </CardContent>
          </Card>

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
                  <Card key={emprestimo.id} className={emprestimo.status === 'Devolvido' ? 'bg-green-50/30' : ''}>
                    <CardHeader>
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex-1">
                          
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <CardTitle className="text-lg mr-1">{emprestimo.materialSolicitado}</CardTitle>
                            
                            {getCategoriaBadge(emprestimo.material_categoria)}
                            
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              {emprestimo.quantidade} unid.
                            </Badge>
                            {getStatusBadge(emprestimo.status)}
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div><span className="font-semibold text-gray-700">Retirado por:</span> <span className="text-gray-900">{emprestimo.usuario}</span></div>
                              <div>
                                <span className="font-semibold text-gray-700">Data de Saída:</span>{' '}
                                <span className="text-gray-900">{emprestimo.data_saida ? new Date(emprestimo.data_saida + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'Sem data'}</span>
                              </div>
                              {emprestimo.gerencia && (
                                <div><span className="font-semibold text-gray-700">Gerência:</span> <span className="text-gray-900">{emprestimo.gerencia}</span></div>
                              )}
                              {emprestimo.status === 'Devolvido' && emprestimo.data_devolucao && (
                                <>
                                  <div>
                                    <span className="font-semibold text-gray-700">Data de Devolução:</span>{' '}
                                    <span className="text-gray-900">{new Date(emprestimo.data_devolucao + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
                                  </div>
                                  {emprestimo.responsavel_recebimento && (
                                    <div className="sm:col-span-2">
                                      <span className="font-semibold text-gray-700">Recebido por:</span>{' '}
                                      <span className="text-gray-900">{emprestimo.responsavel_recebimento}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            
                            {emprestimo.observacao && (
                              <div className="pt-2 border-t border-gray-200 mt-3">
                                <div className="font-semibold text-gray-700 mb-1 flex items-center"><FileText className="size-4 mr-1"/> Observação/Motivo:</div>
                                <div className="text-gray-900 italic">"{emprestimo.observacao}"</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {emprestimo.status === 'Pendente' && (
                          <div className="flex items-start">
                            <Button onClick={() => abrirModalDevolucao(emprestimo)} size="lg" className="bg-green-600 hover:bg-green-700 w-full lg:w-auto" disabled={processando}>
                              <CheckCircle className="size-5 mr-2" /> Marcar como Devolvido
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
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

        {mostrarFormulario && <FormularioSaida onFechar={() => setMostrarFormulario(false)} />}
      </div>

      {/* MODAL DE DEVOLUÇÃO */}
      {emprestimoParaDevolver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Confirmar Devolução</CardTitle>
              <CardDescription>
                Ferramenta: <strong className="text-gray-800">{emprestimoParaDevolver.materialSolicitado}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data da Devolução *</Label>
                <Input type="date" value={dataDevolucao} onChange={e => setDataDevolucao(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label>Nome de quem está recebendo</Label>
                <Input 
                  value={nomeRecebedor} 
                  readOnly 
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" 
                  title="Preenchido automaticamente com o usuário logado"
                />
              </div>
              <div className="space-y-2">
                <Label>Matrícula de quem está recebendo</Label>
                <Input 
                  value={matriculaRecebedor} 
                  readOnly 
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" 
                  title="Preenchido automaticamente com o usuário logado"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setEmprestimoParaDevolver(null)} disabled={processando}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={confirmarDevolucao} disabled={processando || !nomeRecebedor || !matriculaRecebedor}>
                  {processando ? 'Salvando...' : 'Confirmar Recebimento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ÁREA DE IMPRESSÃO */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-8">
        <div className="mb-6 border-b-2 border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Ferramentas Pendentes</h1>
          <p className="text-gray-600">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          {temFiltroAtivo && (
            <p className="text-sm font-semibold text-blue-600 mt-2">
              (Imprimindo com filtros ativos aplicados)
            </p>
          )}
        </div>

        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th className="py-2 px-2 font-bold text-gray-800">Ferramenta</th>
              <th className="py-2 px-2 font-bold text-gray-800">Cat.</th>
              <th className="py-2 px-2 font-bold text-gray-800 text-center">Qtd</th>
              <th className="py-2 px-2 font-bold text-gray-800">Retirado por (Func. / Gerência)</th>
              <th className="py-2 px-2 font-bold text-gray-800">Data</th>
              <th className="py-2 px-2 font-bold text-gray-800">Observação</th>
            </tr>
          </thead>
          <tbody>
            {pendentesParaImprimir.length === 0 ? (
              <tr><td colSpan={6} className="py-4 text-center text-gray-500 italic">Nenhuma saída pendente com esses filtros no momento.</td></tr>
            ) : (
              pendentesParaImprimir.map((emprestimo, index) => (
                <tr key={emprestimo.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-2 font-medium">{emprestimo.materialSolicitado}</td>
                  <td className="py-2 px-2">
                    {emprestimo.material_categoria === 'eletrico' ? 'Elétrico' : emprestimo.material_categoria === 'mecanico' ? 'Mecânico' : '-'}
                  </td>
                  <td className="py-2 px-2 font-bold text-center">{emprestimo.quantidade}</td>
                  <td className="py-2 px-2">
                    {emprestimo.usuario}
                    {emprestimo.gerencia && <span className="block text-xs text-gray-500">{emprestimo.gerencia}</span>}
                  </td>
                  <td className="py-2 px-2">{emprestimo.data_saida ? new Date(emprestimo.data_saida + 'T12:00:00Z').toLocaleDateString('pt-BR') : '-'}</td>
                  <td className="py-2 px-2 italic text-gray-600 max-w-xs break-words">{emprestimo.observacao || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}