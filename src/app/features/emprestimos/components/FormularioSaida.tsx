import React, { useState, useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Search, Wrench, Zap, Check, Plus, Trash2 } from 'lucide-react';

interface FormularioSaidaProps {
  onFechar: () => void;
}

interface ItemCarrinho {
  id: string;
  nome: string;
  categoria: 'mecanico' | 'eletrico';
  quantidade: number;
  estoque: number;
}

export function FormularioSaida({ onFechar }: FormularioSaidaProps) {
  const { adicionarEmprestimo } = useEmprestimos();
  const { materiais, atualizarQuantidade } = useMateriais();

  const dataHoje = new Date().toISOString().split('T')[0];

  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [matriculaSolicitante, setMatriculaSolicitante] = useState(''); // <-- VOLTOU
  const [gerencia, setGerencia] = useState('');
  const [dataSaida, setDataSaida] = useState(dataHoje); // <-- VOLTOU
  const [observacao, setObservacao] = useState(''); // <-- VOLTOU
  
  const [itensCarrinho, setItensCarrinho] = useState<ItemCarrinho[]>([]);
  const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
  const [buscaFerramenta, setBuscaFerramenta] = useState('');
  const [salvando, setSalvando] = useState(false);

  const ferramentasFiltradas = useMemo(() => {
    return materiais
      .filter(m => m.quantidade > 0)
      .filter(m => m.nome.toLowerCase().includes(buscaFerramenta.toLowerCase()));
  }, [materiais, buscaFerramenta]);

  const handleSelecionarFerramenta = (ferramenta: any) => {
    if (itensCarrinho.some(item => item.id === ferramenta.id)) {
      toast.info(`A ferramenta "${ferramenta.nome}" já está na lista.`);
      setModalSelecaoAberto(false);
      return;
    }

    setItensCarrinho([
      ...itensCarrinho, 
      {
        id: ferramenta.id,
        nome: ferramenta.nome,
        categoria: ferramenta.categoria,
        quantidade: 1,
        estoque: ferramenta.quantidade
      }
    ]);
    setModalSelecaoAberto(false);
    setBuscaFerramenta(''); 
  };

  const atualizarQuantidadeCarrinho = (id: string, novaQtd: string) => {
    const qtdFormatada = parseInt(novaQtd) || 0;
    setItensCarrinho(itensCarrinho.map(item => 
      item.id === id ? { ...item, quantidade: qtdFormatada } : item
    ));
  };

  const removerDoCarrinho = (id: string) => {
    setItensCarrinho(itensCarrinho.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (itensCarrinho.length === 0) return toast.warning('Adicione ferramentas à lista.');
    if (!dataSaida) return toast.warning('Preencha a data.');
    if (dataSaida > dataHoje) return toast.error('Data futura não permitida.');

    for (const item of itensCarrinho) {
      if (item.quantidade <= 0) return toast.warning(`Quantidade inválida para "${item.nome}".`);
      if (item.quantidade > item.estoque) return toast.error(`Estoque insuficiente para "${item.nome}".`);
    }

    setSalvando(true);
    try {
      const usuarioFormatado = `${nomeSolicitante} (Mat: ${matriculaSolicitante})`;

      for (const item of itensCarrinho) {
        await adicionarEmprestimo({
          usuario: usuarioFormatado,
          materialSolicitado: item.nome,
          material_categoria: item.categoria,
          gerencia: gerencia,
          quantidade: item.quantidade,
          data_saida: dataSaida, // <-- ENVIANDO PARA O BANCO
          observacao: observacao, // <-- ENVIANDO PARA O BANCO
        }, item.id);
        
        await atualizarQuantidade(item.id, item.estoque - item.quantidade);
      }

      toast.success('Saída registada e estoque atualizado!');
      onFechar();
    } catch (error) {
      toast.error('Erro ao registar saídas.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={(val) => !val && onFechar()}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0">
          <div className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">Registar Saída Múltipla</DialogTitle>
            <DialogDescription>Registe várias ferramentas de uma só vez para o mesmo solicitante.</DialogDescription>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Dados da Saída</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input value={nomeSolicitante} onChange={e => setNomeSolicitante(e.target.value)} required disabled={salvando} />
                </div>
                {/* CAMPO VOLTOU AQUI */}
                <div className="space-y-2">
                  <Label>Matrícula *</Label>
                  <Input value={matriculaSolicitante} onChange={e => setMatriculaSolicitante(e.target.value)} required disabled={salvando} />
                </div>
                <div className="space-y-2">
                  <Label>Gerência / Setor *</Label>
                  <Input value={gerencia} onChange={e => setGerencia(e.target.value)} required disabled={salvando} />
                </div>
                {/* CAMPO VOLTOU AQUI */}
                <div className="space-y-2">
                  <Label>Data de Saída *</Label>
                  <Input type="date" max={dataHoje} value={dataSaida} onChange={e => setDataSaida(e.target.value)} required disabled={salvando} />
                </div>
                {/* CAMPO VOLTOU AQUI */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Observação (Geral)</Label>
                  <Input value={observacao} onChange={e => setObservacao(e.target.value)} disabled={salvando} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ferramentas ({itensCarrinho.length})</h3>
                <Button type="button" size="sm" onClick={() => setModalSelecaoAberto(true)} className="bg-gray-900 hover:bg-gray-800" disabled={salvando}>
                  <Plus className="size-4 mr-1" /> Adicionar Ferramenta
                </Button>
              </div>

              {itensCarrinho.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <Wrench className="size-8 mx-auto text-gray-400 mb-2 opacity-50" />
                  <p className="text-sm text-gray-500">Nenhuma ferramenta adicionada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itensCarrinho.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-md ${item.categoria === 'mecanico' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                          {item.categoria === 'mecanico' ? <Wrench className="size-4 text-orange-600" /> : <Zap className="size-4 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{item.nome}</p>
                          <p className="text-xs text-gray-500">Estoque disp: {item.estoque}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500">Qtd:</Label>
                          <Input type="number" min="1" max={item.estoque} value={item.quantidade} onChange={(e) => atualizarQuantidadeCarrinho(item.id, e.target.value)} className="w-20 h-8 text-center" disabled={salvando} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removerDoCarrinho(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8" disabled={salvando}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
            <Button type="button" variant="outline" onClick={onFechar} disabled={salvando}>Cancelar</Button>
            <Button type="submit" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700" disabled={salvando || itensCarrinho.length === 0 || !nomeSolicitante}>
              {salvando ? 'A registar...' : 'Confirmar Saída'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalSelecaoAberto} onOpenChange={setModalSelecaoAberto}>
        <DialogContent className="sm:max-w-[450px] max-h-[80vh] flex flex-col p-0">
          <div className="px-6 py-4 border-b">
            <DialogTitle>Catálogo de Ferramentas</DialogTitle>
          </div>
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input placeholder="Buscar por nome..." className="pl-10 bg-white" value={buscaFerramenta} onChange={e => setBuscaFerramenta(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {ferramentasFiltradas.length === 0 ? (
              <div className="text-center py-8"><p className="text-gray-500">Nenhuma ferramenta encontrada.</p></div>
            ) : (
              ferramentasFiltradas.map((f) => {
                const jaAdicionada = itensCarrinho.some(item => item.id === f.id);
                return (
                  <div key={f.id} onClick={() => !jaAdicionada && handleSelecionarFerramenta(f)} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${jaAdicionada ? 'opacity-60 bg-gray-50 cursor-not-allowed border-gray-200' : 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${f.categoria === 'mecanico' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                        {f.categoria === 'mecanico' ? <Wrench className="size-4 text-orange-600" /> : <Zap className="size-4 text-purple-600" />}
                      </div>
                      <div>
                        <p className={`font-medium text-sm ${jaAdicionada ? 'text-gray-500' : 'text-gray-900'}`}>{f.nome}</p>
                        <Badge variant="outline" className="text-[10px] uppercase mt-1">{f.categoria}</Badge>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      {jaAdicionada ? <span className="text-xs font-medium text-green-600 flex items-center gap-1"><Check className="size-3" /> Adicionada</span> : <><p className="text-sm font-bold text-gray-700">{f.quantidade}</p><p className="text-[10px] text-gray-500">em estoque</p></>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}