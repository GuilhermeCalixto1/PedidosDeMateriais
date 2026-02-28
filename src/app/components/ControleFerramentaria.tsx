import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LogOut, Plus, Package, CheckCircle, Clock, Search, Zap, Wrench, Calendar, Filter } from 'lucide-react';
import { FormularioSaida } from './FormularioSaida';
import type { Emprestimo } from '../contexts/EmprestimosContext';

export function ControleFerramentaria() {
  const { user, logout } = useAuth();
  const { emprestimos, marcarComoDevolvido } = useEmprestimos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'pendente' | 'devolvido'>('pendente');
  
  // Estados dos filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | 'mecanico' | 'eletrico'>('todas');

  // Aplicar todos os filtros de forma hierárquica
  const emprestimosFiltrados = useMemo(() => {
    let resultado = emprestimos;

    // 1. Primeiro filtra pela aba (status)
    if (abaAtiva === 'pendente') {
      resultado = resultado.filter(e => e.status === 'pendente');
    } else if (abaAtiva === 'devolvido') {
      resultado = resultado.filter(e => e.status === 'devolvido');
    }
    // Se for 'todos', não filtra por status

    // 2. Depois aplica busca por texto (matrícula OU material OU nome do funcionário)
    if (buscaTexto.trim() !== '') {
      const termoBusca = buscaTexto.toLowerCase();
      resultado = resultado.filter(e => 
        e.matricula.toLowerCase().includes(termoBusca) ||
        e.materialSolicitado.toLowerCase().includes(termoBusca) ||
        e.nomeFuncionario.toLowerCase().includes(termoBusca)
      );
    }

    // 3. Depois aplica filtro de data
    if (filtroData !== '') {
      resultado = resultado.filter(e => e.data === filtroData);
    }

    // 4. Por último aplica filtro de categoria
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(e => e.categoria === filtroCategoria);
    }

    return resultado;
  }, [emprestimos, abaAtiva, buscaTexto, filtroData, filtroCategoria]);

  const contadores = useMemo(() => ({
    todos: emprestimos.length,
    pendente: emprestimos.filter(e => e.status === 'pendente').length,
    devolvido: emprestimos.filter(e => e.status === 'devolvido').length,
  }), [emprestimos]);

  const limparFiltros = () => {
    setBuscaTexto('');
    setFiltroData('');
    setFiltroCategoria('todas');
  };

  const handleMarcarDevolvido = (id: string) => {
    marcarComoDevolvido(id, user!.nome, user!.id);
  };

  const getStatusBadge = (status: 'pendente' | 'devolvido') => {
    if (status === 'pendente') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="size-3 mr-1" />
          Pendente
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="size-3 mr-1" />
        Devolvido
      </Badge>
    );
  };

  const getCategoriaBadge = (categoria: 'mecanico' | 'eletrico') => {
    if (categoria === 'eletrico') {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Zap className="size-3 mr-1" />
          Elétrico
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <Wrench className="size-3 mr-1" />
        Mecânico
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Controle de Materiais</h1>
                <p className="text-sm text-gray-600">{user?.nome}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="size-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com botão de nova saída */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Empréstimos de Ferramentas</h2>
            <p className="text-gray-600 mt-1">
              Gerencie saídas e devoluções de materiais
            </p>
          </div>
          <Button onClick={() => setMostrarFormulario(true)} size="lg" className="w-full md:w-auto">
            <Plus className="size-5 mr-2" />
            Nova Saída
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as typeof abaAtiva)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="pendente">
              Pendentes ({contadores.pendente})
            </TabsTrigger>
            <TabsTrigger value="devolvido">
              Devolvidos ({contadores.devolvido})
            </TabsTrigger>
            <TabsTrigger value="todos">
              Todos ({contadores.todos})
            </TabsTrigger>
          </TabsList>

          {/* Painel de Filtros */}
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="size-5 text-blue-600" />
                <CardTitle className="text-lg">Filtros de Busca</CardTitle>
              </div>
              <CardDescription>
                Todos os filtros atuam apenas nos itens da aba "{abaAtiva === 'pendente' ? 'Pendentes' : abaAtiva === 'devolvido' ? 'Devolvidos' : 'Todos'}"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca por Texto */}
                <div className="space-y-2">
                  <Label htmlFor="busca">Buscar por Matrícula ou Material</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="busca"
                      placeholder="Digite matrícula ou nome..."
                      value={buscaTexto}
                      onChange={(e) => setBuscaTexto(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro de Data */}
                <div className="space-y-2">
                  <Label htmlFor="data">Filtrar por Data</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="data"
                      type="date"
                      value={filtroData}
                      onChange={(e) => setFiltroData(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Filtro de Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Filtrar por Categoria</Label>
                  <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v as typeof filtroCategoria)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Categorias</SelectItem>
                      <SelectItem value="mecanico">
                        <div className="flex items-center">
                          <Wrench className="size-4 mr-2 text-orange-600" />
                          Mecânico
                        </div>
                      </SelectItem>
                      <SelectItem value="eletrico">
                        <div className="flex items-center">
                          <Zap className="size-4 mr-2 text-purple-600" />
                          Elétrico
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botão de limpar filtros */}
              {(buscaTexto !== '' || filtroData !== '' || filtroCategoria !== 'todas') && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={limparFiltros}>
                    Limpar Filtros
                  </Button>
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
                  <p className="text-gray-600 mb-4">
                    {buscaTexto || filtroData || filtroCategoria !== 'todas'
                      ? 'Nenhum resultado encontrado com os filtros aplicados.'
                      : abaAtiva === 'todos'
                      ? 'Nenhum empréstimo registrado ainda.'
                      : `Nenhum empréstimo ${abaAtiva === 'pendente' ? 'pendente' : 'devolvido'}.`
                    }
                  </p>
                  {(buscaTexto || filtroData || filtroCategoria !== 'todas') && (
                    <Button variant="outline" onClick={limparFiltros}>
                      Limpar Filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {emprestimosFiltrados.map((emprestimo) => (
                  <Card key={emprestimo.id} className={emprestimo.status === 'devolvido' ? 'bg-green-50/30' : ''}>
                    <CardHeader>
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <CardTitle className="text-lg">{emprestimo.materialSolicitado}</CardTitle>
                            {getStatusBadge(emprestimo.status)}
                            {getCategoriaBadge(emprestimo.categoria)}
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <span className="font-semibold text-gray-700">Funcionário:</span>{' '}
                                <span className="text-gray-900">{emprestimo.nomeFuncionario}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-700">Matrícula:</span>{' '}
                                <span className="text-gray-900">{emprestimo.matricula}</span>
                              </div>
                              <div className="sm:col-span-2">
                                <span className="font-semibold text-gray-700">Data de Saída:</span>{' '}
                                <span className="text-gray-900">{new Date(emprestimo.data).toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                            
                            <div className="pt-2 border-t border-gray-200">
                              <div className="font-semibold text-gray-700 mb-1">📦 Responsável pela Entrega:</div>
                              <div className="text-gray-900">{emprestimo.responsavelEntrega}</div>
                            </div>

                            {emprestimo.status === 'devolvido' && emprestimo.responsavelDevolucao && (
                              <div className="pt-2 border-t border-green-200">
                                <div className="font-semibold text-green-700 mb-1">✅ Responsável por receber a devolução:</div>
                                <div className="text-green-900">{emprestimo.responsavelDevolucao}</div>
                                {emprestimo.dataDevolucao && (
                                  <div className="text-sm text-green-700 mt-1">
                                    Devolvido em: {new Date(emprestimo.dataDevolucao).toLocaleDateString('pt-BR')} às {new Date(emprestimo.dataDevolucao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {emprestimo.status === 'pendente' && (
                          <div className="flex items-start">
                            <Button
                              onClick={() => handleMarcarDevolvido(emprestimo.id)}
                              size="lg"
                              className="bg-green-600 hover:bg-green-700 w-full lg:w-auto"
                            >
                              <CheckCircle className="size-5 mr-2" />
                              Marcar como Devolvido
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

        {/* Contador de resultados */}
        {emprestimosFiltrados.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Exibindo {emprestimosFiltrados.length} de {
              abaAtiva === 'todos' ? contadores.todos : 
              abaAtiva === 'pendente' ? contadores.pendente : 
              contadores.devolvido
            } {emprestimosFiltrados.length === 1 ? 'item' : 'itens'}
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {mostrarFormulario && (
        <FormularioSaida onFechar={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
}