import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { useMateriais } from '../contexts/MateriaisContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { X, Package, Search, Wrench, Zap, AlertCircle } from 'lucide-react';

interface FormularioSaidaProps {
  onFechar: () => void;
}

export function FormularioSaida({ onFechar }: FormularioSaidaProps) {
  const { user } = useAuth();
  const { adicionarEmprestimo } = useEmprestimos();
  const { materiais, atualizarQuantidade } = useMateriais();
  
  const [mostrarSeletorMaterial, setMostrarSeletorMaterial] = useState(true);
  const [materialSelecionado, setMaterialSelecionado] = useState<{
    id: string;
    nome: string;
    categoria: 'mecanico' | 'eletrico';
    quantidadeDisponivel: number;
  } | null>(null);
  const [quantidadeRetirada, setQuantidadeRetirada] = useState('1');
  const [buscaMaterial, setBuscaMaterial] = useState('');
  
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [matricula, setMatricula] = useState('');
  const [erro, setErro] = useState('');

  // Filtrar materiais com estoque disponível
  const materiaisDisponiveis = materiais
    .filter(m => m.quantidade > 0)
    .filter(m => {
      if (!buscaMaterial.trim()) return true;
      return m.nome.toLowerCase().includes(buscaMaterial.toLowerCase());
    });

  const handleSelecionarMaterial = (material: typeof materiais[0]) => {
    setMaterialSelecionado({
      id: material.id,
      nome: material.nome,
      categoria: material.categoria,
      quantidadeDisponivel: material.quantidade,
    });
    setQuantidadeRetirada('1');
    setMostrarSeletorMaterial(false);
  };

  const handleVoltarSeletor = () => {
    setMaterialSelecionado(null);
    setMostrarSeletorMaterial(true);
    setBuscaMaterial('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!materialSelecionado) {
      setErro('Selecione um material');
      return;
    }

    const qtd = parseInt(quantidadeRetirada);
    if (isNaN(qtd) || qtd <= 0) {
      setErro('Quantidade deve ser maior que zero');
      return;
    }

    if (qtd > materialSelecionado.quantidadeDisponivel) {
      setErro(`Quantidade disponível em estoque: ${materialSelecionado.quantidadeDisponivel}`);
      return;
    }

    try {
      // Primeiro atualiza o estoque
      const novaQuantidade = materialSelecionado.quantidadeDisponivel - qtd;
      await atualizarQuantidade(materialSelecionado.id, novaQuantidade);

      // Depois adiciona o empréstimo
      await adicionarEmprestimo({
        materialSolicitado: `${materialSelecionado.nome} (${qtd} ${qtd === 1 ? 'unidade' : 'unidades'})`,
        categoria: materialSelecionado.categoria,
        data,
        nomeFuncionario,
        matricula,
        responsavelEntrega: user!.nome,
        responsavelEntregaId: user!.id,
      });

      onFechar();
    } catch (error) {
      console.error('Erro ao processar saída:', error);
      setErro('Erro ao registrar saída. Tente novamente.');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Nova Saída de Ferramenta</CardTitle>
              <CardDescription>
                {mostrarSeletorMaterial
                  ? 'Selecione a ferramenta do inventário'
                  : 'Complete os dados da saída'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onFechar}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mostrarSeletorMaterial ? (
            // SELETOR DE MATERIAL
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buscaMaterial">Buscar Ferramenta</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="buscaMaterial"
                    placeholder="Digite o nome da ferramenta..."
                    value={buscaMaterial}
                    onChange={(e) => setBuscaMaterial(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {materiaisDisponiveis.length === 0 ? (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    {materiais.length === 0
                      ? 'Nenhum material cadastrado no inventário. Acesse a página de Gerenciamento de Materiais para adicionar.'
                      : materiais.every(m => m.quantidade === 0)
                      ? 'Todos os materiais estão sem estoque disponível.'
                      : 'Nenhuma ferramenta encontrada com a busca aplicada.'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ferramenta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Disponível</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materiaisDisponiveis.map((material) => (
                        <TableRow key={material.id}>
                          <TableCell className="font-medium">{material.nome}</TableCell>
                          <TableCell>{getCategoriaBadge(material.categoria)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">
                              {material.quantidade} {material.quantidade === 1 ? 'unidade' : 'unidades'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handleSelecionarMaterial(material)}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            // FORMULÁRIO DE DADOS
            <form onSubmit={handleSubmit} className="space-y-4">
              {erro && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              {/* Material Selecionado */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <Label className="text-sm text-blue-600">Material Selecionado</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-semibold text-lg">{materialSelecionado?.nome}</p>
                      {materialSelecionado && getCategoriaBadge(materialSelecionado.categoria)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Disponível: {materialSelecionado?.quantidadeDisponivel} {materialSelecionado?.quantidadeDisponivel === 1 ? 'unidade' : 'unidades'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVoltarSeletor}
                  >
                    Alterar
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="quantidadeRetirada">Quantidade a Retirar *</Label>
                  <Input
                    id="quantidadeRetirada"
                    type="number"
                    min="1"
                    max={materialSelecionado?.quantidadeDisponivel}
                    value={quantidadeRetirada}
                    onChange={(e) => setQuantidadeRetirada(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeFuncionario">Nome do Funcionário *</Label>
                  <Input
                    id="nomeFuncionario"
                    placeholder="Ex: João Silva"
                    value={nomeFuncionario}
                    onChange={(e) => setNomeFuncionario(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    placeholder="Ex: 1001"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm text-gray-600">Responsável pela Entrega</Label>
                <p className="mt-1 font-medium">{user?.nome}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleVoltarSeletor} className="flex-1">
                  Voltar
                </Button>
                <Button type="submit" className="flex-1">
                  Registrar Saída
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}