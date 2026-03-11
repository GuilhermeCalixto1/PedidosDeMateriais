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
// Adicionada a iconografia Minus para o botão de diminuir
import { Plus, Minus, Search, Trash2, Wrench, Zap, Loader2, Package } from 'lucide-react';

export function GerenciamentoMateriais() {
  // Agora importamos também a função atualizarQuantidade
  const { materiais, carregando, adicionarMaterial, excluirMaterial, atualizarQuantidade } = useMateriais();
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

    if (buscaTexto.trim() !== '') {
      const termo = buscaTexto.toLowerCase();
      resultado = resultado.filter(m => m.nome.toLowerCase().includes(termo));
    }

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
                  placeholder="Ex: Alicate, Furadeira..."
                  value={buscaTexto}
                  onChange={(e) => setBuscaTexto(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Filtrar por Categoria</Label>
              <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  <SelectItem value="mecanico">Mecânico</SelectItem>
                  <SelectItem value="eletrico">Elétrico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-hidden">
          {carregando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Sincronizando com banco de dados...</span>
            </div>
          ) : materiaisFiltrados.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Package className="size-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum material encontrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Nome da Ferramenta</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center w-[200px]">Ajuste de Estoque</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiaisFiltrados.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.nome}</TableCell>
                    <TableCell>{getCategoriaBadge(material.categoria)}</TableCell>
                    <TableCell>
                      {/* BOTÕES DE AJUSTE RÁPIDO */}
                      <div className="flex items-center justify-center gap-3">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => atualizarQuantidade(material.id, material.quantidade - 1)}
                          disabled={material.quantidade <= 0}
                        >
                          <Minus className="size-4" />
                        </Button>
                        
                        <div className="min-w-[40px] text-center">
                          <span className={`text-lg font-bold ${material.quantidade === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                            {material.quantidade}
                          </span>
                        </div>

                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => atualizarQuantidade(material.id, material.quantidade + 1)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleExcluir(material.id, material.nome)}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={mostrarDialogNovo} onOpenChange={setMostrarDialogNovo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Ferramenta</DialogTitle>
            <DialogDescription>Adicione um novo item ao catálogo de inventário.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {erro && <Alert variant="destructive"><AlertDescription>{erro}</AlertDescription></Alert>}

            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={categoria} onValueChange={(v) => setCategoria(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mecanico">Mecânico</SelectItem>
                    <SelectItem value="eletrico">Elétrico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidadeForm">Qtd. Inicial *</Label>
                <Input id="quantidadeForm" type="number" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setMostrarDialogNovo(false)}>Cancelar</Button>
              <Button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Cadastrar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
