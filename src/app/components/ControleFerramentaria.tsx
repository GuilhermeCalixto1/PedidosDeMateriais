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
import { Plus, Package, CheckCircle, Clock, Search, Calendar, Filter, FileText, Printer, Wrench, Zap } from 'lucide-react';
import { FormularioSaida } from './FormularioSaida';

export function ControleFerramentaria() {
  const { user } = useAuth();
  const { emprestimos, marcarComoDevolvido, carregando } = useEmprestimos();
  const { recarregarMateriais } = useMateriais();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<'todos' | 'Pendente' | 'Devolvido'>('Pendente');
  const [processando, setProcessando] = useState(false);

  const getCategoriaBadge = (categoria: string) => {
    if (categoria === 'eletrico') {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          <Zap className="size-3 mr-1" /> Elétrico
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
        <Wrench className="size-3 mr-1" /> Mecânico
      </Badge>
    );
  };
  
  // Estados dos filtros
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  // Aplicar todos os filtros de forma hierárquica
  const emprestimosFiltrados = useMemo(() => {
    let resultado = emprestimos;

    // 1. Filtra pela aba (status - agora com Maiúscula)
    if (abaAtiva === 'Pendente') {
      resultado = resultado.filter(e => e.status === 'Pendente');
    } else if (abaAtiva === 'Devolvido') {
      resultado = resultado.filter(e => e.status === 'Devolvido');
    }

    // 2. Busca por texto (usuario OU material_nome)
    if (buscaTexto.trim() !== '') {
      const termoBusca = buscaTexto.toLowerCase();
      resultado = resultado.filter(e => 
        (e.usuario && e.usuario.toLowerCase().includes(termoBusca)) ||
        (e.material_nome && e.material_nome.toLowerCase().includes(termoBusca))
      );
    }

    // 3. Filtro de período de data de saída
    if (filtroDataInicio !== '' || filtroDataFim !== '') {
      resultado = resultado.filter(e => {
        if (!e.data_saida) {
          return false;
        }

        const dataBase = e.data_saida.split('T')[0];

        if (filtroDataInicio !== '' && filtroDataFim !== '') {
          return dataBase >= filtroDataInicio && dataBase <= filtroDataFim;
        }

        if (filtroDataInicio !== '') {
          return dataBase === filtroDataInicio;
        }

        if (filtroDataFim !== '') {
          return dataBase === filtroDataFim;
        }

        return true;
      });
    }

    return resultado;
  }, [emprestimos, abaAtiva, buscaTexto, filtroDataInicio, filtroDataFim]);

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

  // Ajustado: Passamos o objeto inteiro conforme esperado pelo novo Contexto
  const handleMarcarDevolvido = async (emprestimo: any) => {
    setProcessando(true);
    await marcarComoDevolvido(emprestimo);
    await recarregarMateriais();
    setProcessando(false);
  };

  const handleImprimirPendentes = () => {
    const pendentes = emprestimosFiltrados.filter(e => e.status === 'Pendente');

    if (pendentes.length === 0) {
      alert('Não há saídas pendentes para imprimir.');
      return;
    }

    const rows = pendentes.map((e) => `
      <tr>
        <td>${e.usuario}</td>
        <td>${e.material_nome}</td>
        <td>${e.quantidade}</td>
        <td>${formatDataParaExibir(e.data_saida)}</td>
        <td>${e.observacao || ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
      <head>
        <title>Saídas Pendentes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 1rem; }
          h1 { font-size: 1.25rem; margin-bottom: 1rem; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Saídas Pendentes</h1>
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Material</th>
              <th>Quantidade</th>
              <th>Data de Saída</th>
              <th>Observação</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Não foi possível abrir a janela de impressão. Verifique se bloqueadores de pop-up estão ativos.');
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    // Nota: Não fechar automaticamente se o usuário cancelar pode ser melhor UX
    // printWindow.close();
  };

  const formatDataParaExibir = (data: string) => {
    if (!data) return 'Sem data';

    // Campo pode vir no formato date-only (YYYY-MM-DD) ou ISO completo.
    const datePart = data.split('T')[0];
    const [year, month, day] = datePart.split('-');

    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }

    const parsed = new Date(data);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('pt-BR');
    }

    return data;
  };

  const getStatusBadge = (status: 'Pendente' | 'Devolvido') => {
    if (status === 'Pendente') {
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

  return (
    <div className="space-y-6">
      {/* Header com botão de nova saída */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Empréstimos de Ferramentas</h2>
          <p className="text-gray-600 mt-1">
            Gerencie saídas e devoluções de materiais
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {abaAtiva === 'Pendente' && (
            <Button variant="outline" size="lg" onClick={handleImprimirPendentes} className="w-full md:w-auto">
              <Printer className="size-5 mr-2" />
              Imprimir Pendentes
            </Button>
          )}
          <Button onClick={() => setMostrarFormulario(true)} size="lg" className="w-full md:w-auto">
            <Plus className="size-5 mr-2" />
            Nova Saída
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={abaAtiva} onValueChange={(v) => setAbaAtiva(v as typeof abaAtiva)} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="Pendente">
            Pendentes ({contadores.pendente})
          </TabsTrigger>
          <TabsTrigger value="Devolvido">
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
              Todos os filtros atuam apenas nos itens da aba atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="busca">Buscar por Funcionário, Matrícula ou Material</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="busca"
                    placeholder="Digite aqui..."
                    value={buscaTexto}
                    onChange={(e) => setBuscaTexto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataInicio">Filtrar por Período de Saída</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="dataInicio"
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Input
                      id="dataFim"
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">Selecionar apenas uma data retorna as saídas desse dia; usar intervalo retorna entre início e fim (inclusive).</p>
              </div>
            </div>

            {(buscaTexto !== '' || filtroDataInicio !== '' || filtroDataFim !== '') && (
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
                  Nenhum resultado para exibir com os filtros atuais.
                </p>
                {(buscaTexto || filtroDataInicio || filtroDataFim) && (
                  <Button variant="outline" onClick={limparFiltros}>
                    Limpar Filtros
                  </Button>
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
                          <CardTitle className="text-lg">{emprestimo.material_nome}</CardTitle>
                          {getCategoriaBadge(emprestimo.material_categoria)} {/* Exibe a categoria */}
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            {emprestimo.quantidade} unid.
                          </Badge>
                          {getStatusBadge(emprestimo.status)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <span className="font-semibold text-gray-700">Retirado por:</span>{' '}
                              <span className="text-gray-900">{emprestimo.usuario}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Gerência:</span>{' '}
                              <span className="text-gray-900">{emprestimo.gerencia}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-700">Data de Saída:</span>{' '}
                              <span className="text-gray-900">
                                {formatDataParaExibir(emprestimo.data_saida)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Exibir a observação se ela existir no banco de dados */}
                          {emprestimo.observacao && (
                            <div className="pt-2 border-t border-gray-200 mt-3">
                              <div className="font-semibold text-gray-700 mb-1 flex items-center">
                                <FileText className="size-4 mr-1"/> Observação/Motivo:
                              </div>
                              <div className="text-gray-900 italic">"{emprestimo.observacao}"</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {emprestimo.status === 'Pendente' && (
                        <div className="flex items-start">
                          <Button
                            onClick={() => handleMarcarDevolvido(emprestimo)}
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 w-full lg:w-auto"
                            disabled={processando}
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

      {/* Resumo de itens exibidos */}
      {emprestimosFiltrados.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Exibindo {emprestimosFiltrados.length} de {
            abaAtiva === 'todos' ? contadores.todos : 
            abaAtiva === 'Pendente' ? contadores.pendente : 
            contadores.devolvido
          } {emprestimosFiltrados.length === 1 ? 'item' : 'itens'}
        </div>
      )}

      {mostrarFormulario && (
        <FormularioSaida onFechar={() => setMostrarFormulario(false)} />
      )}
    </div>
  );
}