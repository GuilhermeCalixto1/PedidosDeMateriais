import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { useMateriais } from '../contexts/MateriaisContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { X, Search, Wrench, Zap, AlertCircle } from 'lucide-react';

interface FormularioSaidaProps {
  onFechar: () => void;
}

export function FormularioSaida({ onFechar }: FormularioSaidaProps) {
  const { user } = useAuth();
  const { adicionarEmprestimo } = useEmprestimos();
  const { materiais } = useMateriais();
  
  const [mostrarSeletorMaterial, setMostrarSeletorMaterial] = useState(true);
  const [materialSelecionado, setMaterialSelecionado] = useState<{
    id: string;
    nome: string;
    categoria: 'mecanico' | 'eletrico';
    quantidadeDisponivel: number;
  } | null>(null);
  
  const [quantidadeRetirada, setQuantidadeRetirada] = useState('1');
  const [buscaMaterial, setBuscaMaterial] = useState('');
  const [nomeFuncionario, setNomeFuncionario] = useState('');
  const [matricula, setMatricula] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const materiaisDisponiveis = materiais
    .filter(m => m.quantidade > 0)
    .filter(m => {
      if (!buscaMaterial.trim()) return true;
      return m.nome.toLowerCase().includes(buscaMaterial.toLowerCase());
    });

  const handleSelecionarMaterial = (material: any) => {
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
    setEnviando(true);

    if (!materialSelecionado) {
      setErro('Selecione um material');
      setEnviando(false);
      return;
    }

    const qtd = parseInt(quantidadeRetirada);
    if (isNaN(qtd) || qtd <= 0) {
      setErro('Quantidade deve ser maior que zero');
      setEnviando(false);
      return;
    }

    if (qtd > materialSelecionado.quantidadeDisponivel) {
      setErro(`Quantidade disponível em estoque: ${materialSelecionado.quantidadeDisponivel}`);
      setEnviando(false);
      return;
    }

    try {
      await adicionarEmprestimo({
        usuario: `${nomeFuncionario} (Mat: ${matricula})`,
        material_nome: materialSelecionado.nome,
        quantidade: qtd,
        observacao: observacao,
      });

      onFechar();
    } catch (error) {
      console.error('Erro ao processar saída:', error);
      setErro('Erro ao registrar saída no banco de dados.');
    } finally {
      setEnviando(false);
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Registrar Saída</CardTitle>
              <CardDescription>
                {mostrarSeletorMaterial ? 'Passo 1: Selecione a ferramenta' : 'Passo 2: Dados do funcionário e quantidade'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onFechar}>
              <X className="size-5" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {mostrarSeletorMaterial ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Buscar ferramenta no inventário..."
                  value={buscaMaterial}
                  onChange={(e) => setBuscaMaterial(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Ferramenta</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materiaisDisponiveis.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="font-medium">{m.nome}</div>
                          <div className="mt-1">{getCategoriaBadge(m.categoria)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-bold text-blue-600">{m.quantidade}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleSelecionarMaterial(m)}>
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {erro && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{erro}</AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                <div>
                  <Label className="text-xs text-blue-600 uppercase font-bold">Item Selecionado</Label>
                  <p className="text-lg font-bold text-blue-900">{materialSelecionado?.nome}</p>
                </div>
                <Button type="button" variant="link" onClick={handleVoltarSeletor} className="text-blue-600">
                  Trocar item
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade *</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    max={materialSelecionado?.quantidadeDisponivel}
                    value={quantidadeRetirada}
                    onChange={(e) => setQuantidadeRetirada(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 text-right flex flex-col justify-end">
                   <span className="text-sm text-gray-500">Máximo disponível: {materialSelecionado?.quantidadeDisponivel}</span>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeFuncionario">Nome do Funcionário *</Label>
                    <Input
                      id="nomeFuncionario"
                      placeholder="Quem está retirando?"
                      value={nomeFuncionario}
                      onChange={(e) => setNomeFuncionario(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula *</Label>
                    <Input
                      id="matricula"
                      placeholder="Ex: 1234"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacao">Observações / Motivo da Saída</Label>
                  <Textarea
                    id="observacao"
                    placeholder="Alguma observação sobre o estado da ferramenta ou motivo da retirada?"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleVoltarSeletor} className="flex-1" disabled={enviando}>
                  Voltar
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={enviando}>
                  {enviando ? 'Processando...' : 'Confirmar Saída'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}