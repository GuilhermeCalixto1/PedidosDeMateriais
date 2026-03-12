import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Package, CheckCircle, Clock, Search, Calendar, Filter, FileText, Printer } from 'lucide-react';
import { FormularioSaida } from './FormularioSaida';

export function ControleFerramentaria() {
  const { user } = useAuth();
  const { emprestimos, marcarComoDevolvido, carregando } = useEmprestimos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'Pendente' | 'Devolvido'>('Pendente');
  const [processando, setProcessando] = useState(false);
  
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

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
        // AQUI ESTAVA O ERRO: mudamos para materialSolicitado
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

    return resultado;
  }, [emprestimos, abaAtiva, buscaTexto, filtroDataInicio, filtroDataFim]);

  const pendentesParaImprimir = useMemo(() => {
    return emprestimos.filter(e => e.status === 'Pendente');
  }, [emprestimos]);

  const contadores = useMemo(() => ({
    todos: emprestimos.length,
    pendente: emprestimos.filter(e => e.status === 'Pendente').length,
    devolvido: emprestimos.filter(e => e.status === 'Devolvido').length,
  }), [emprestimos]);

  const limparFiltros = () => {
    setBuscaTexto('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
  };

  const handleMarcarDevolvido = async (emprestimo: any) => {
    setProcessando(true);
    await marcarComoDevolvido(emprestimo);
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
              <Printer className="size-4 mr-2" /> Imprimir Pendentes
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
              <CardDescription>Todos os filtros atuam apenas nos itens da aba atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="busca">Buscar por Funcionário, Matrícula ou Material</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input id="busca" placeholder="Digite aqui..." value={buscaTexto} onChange={(e) => setBuscaTexto(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filtrar por Período de Saída</Label>
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
              </div>

              {(buscaTexto !== '' || filtroDataInicio !== '' || filtroDataFim !== '') && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={limparFiltros}>Limpar Filtros</Button>
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
                  {(buscaTexto || filtroDataInicio || filtroDataFim) && (
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
                            {/* AQUI MUDOU: materialSolicitado */}
                            <CardTitle className="text-lg">{emprestimo.materialSolicitado}</CardTitle>
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
                            <Button onClick={() => handleMarcarDevolvido(emprestimo)} size="lg" className="bg-green-600 hover:bg-green-700 w-full lg:w-auto" disabled={processando}>
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

      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-8">
        <div className="mb-6 border-b-2 border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Ferramentas Pendentes</h1>
          <p className="text-gray-600">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-400">
              <th className="py-2 px-2 font-bold text-gray-800">Ferramenta</th>
              <th className="py-2 px-2 font-bold text-gray-800">Qtd</th>
              <th className="py-2 px-2 font-bold text-gray-800">Retirado por (Funcionário / Matrícula)</th>
              <th className="py-2 px-2 font-bold text-gray-800">Data da Saída</th>
              <th className="py-2 px-2 font-bold text-gray-800">Observação</th>
            </tr>
          </thead>
          <tbody>
            {pendentesParaImprimir.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-500 italic">Nenhuma saída pendente no momento.</td></tr>
            ) : (
              pendentesParaImprimir.map((emprestimo, index) => (
                <tr key={emprestimo.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  {/* AQUI MUDOU: materialSolicitado */}
                  <td className="py-2 px-2 font-medium">{emprestimo.materialSolicitado}</td>
                  <td className="py-2 px-2 font-bold text-center">{emprestimo.quantidade}</td>
                  <td className="py-2 px-2">{emprestimo.usuario}</td>
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