import React, { useState, useMemo } from 'react';
import { useMateriais } from '../contexts/MateriaisContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Search, Trash2, Wrench, Zap, Loader2, Package } from 'lucide-react';

export function GerenciamentoMateriais() {
  const { materiais, carregando, adicionarMaterial, excluirMaterial } = useMateriais();
  const [mostrarDialogNovo, setMostrarDialogNovo] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<'todas' | 'mecanico' | 'eletrico'>('todas');
  
  // Estados do formulário
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<'mecanico' | 'eletrico'>('mecanico');
  const [quantidade, setQuantidade] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Filtrar materiais
  const materiaisFiltrados = useMemo(() => {
    let resultado = materiais;

    // Filtro de texto (busca por nome)
    if (buscaTexto.trim() !== '') {
      const termo = buscaTexto.toLowerCase();
      resultado = resultado.filter(m => m.nome.toLowerCase().includes(termo));
    }

    // Filtro de categoria
    if (filtroCategoria !== 'todas') {
      resultado = resultado.filter(m => m.categoria === filtroCategoria);
    }

    return resultado;
  }, [materiais, buscaTexto, filtroCategoria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      const qtd = parseInt(quantidade);
      if (isNaN(qtd) || qtd < 0) {
        setErro('Quantidade deve ser um número válido');
        setSalvando(false);
        return;
      }

      await adicionarMaterial({
        nome: nome.trim(),
        categoria,
        quantidade: qtd,
      });

      // Limpar formulário e fechar dialog
      setNome('');
      setCategoria('mecanico');
      setQuantidade('');
      setMostrarDialogNovo(false);
    } catch (error) {
      setErro('Erro ao adicionar material. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (confirm(`Deseja realmente excluir "${nome}"?`)) {
      try {
        await excluirMaterial(id);
      } catch (error) {
        alert('Erro ao excluir material');
      }
    }
  };

  const getCategoriaBadge = (categoria: 'mecanico' | 'eletrico') => {
    if (categoria === 'eletrico') {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          <Zap className="size-3 mr-1" />
          Elétrico
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800">
        <Wrench className="size-3 mr-1" />
        Mecânico
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="busca">Buscar por Nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="busca"
                  placeholder="Digite o nome da ferramenta..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

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
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Carregando materiais...</span>
            </div>
          ) : materiaisFiltrados.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="size-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum material encontrado</h3>
              <p className="text-gray-600">
                {buscaTexto || filtroCategoria !== 'todas'
                  ? 'Nenhum resultado encontrado com os filtros aplicados.'
                  : 'Adicione o primeiro material ao inventário.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Quantidade em Estoque</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiaisFiltrados.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.nome}</TableCell>
                    <TableCell>{getCategoriaBadge(material.categoria)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={material.quantidade === 0 ? 'destructive' : 'secondary'}>
                        {material.quantidade} {material.quantidade === 1 ? 'unidade' : 'unidades'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExcluir(material.id, material.nome)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Total de materiais */}
      {materiaisFiltrados.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Exibindo {materiaisFiltrados.length} de {materiais.length} {materiaisFiltrados.length === 1 ? 'item' : 'itens'}
        </div>
      )}

      {/* Dialog de Novo Material */}
      <Dialog open={mostrarDialogNovo} onOpenChange={setMostrarDialogNovo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Ferramenta</DialogTitle>
            <DialogDescription>
              Preencha os dados da ferramenta para adicionar ao inventário
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {erro && (
                <Alert variant="destructive">
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Ferramenta *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Alicate de Corte"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoriaForm">Categoria *</Label>
                <Select value={categoria} onValueChange={(v) => setCategoria(v as 'mecanico' | 'eletrico')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

              <div className="space-y-2">
                <Label htmlFor="quantidadeForm">Quantidade Inicial *</Label>
                <Input
                  id="quantidadeForm"
                  type="number"
                  min="0"
                  placeholder="Ex: 5"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setMostrarDialogNovo(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Adicionar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
