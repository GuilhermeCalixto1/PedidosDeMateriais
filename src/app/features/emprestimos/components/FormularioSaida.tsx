import React, { useState, useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { Search, Wrench, Zap, Check } from 'lucide-react';

interface FormularioSaidaProps {
  onFechar: () => void;
}

export function FormularioSaida({ onFechar }: FormularioSaidaProps) {
  const { adicionarEmprestimo } = useEmprestimos();
  const { materiais } = useMateriais();

  // Estados do formulário
  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [matriculaSolicitante, setMatriculaSolicitante] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [gerencia, setGerencia] = useState('');
  const [observacao, setObservacao] = useState('');
  
  // Estados para o Modal de Seleção
  const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
  const [buscaFerramenta, setBuscaFerramenta] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Encontra o objeto da ferramenta selecionada para mostrar no formulário
  const ferramentaSelecionada = useMemo(() => 
    materiais.find(m => m.id === materialId), 
  [materiais, materialId]);

  // Filtra as ferramentas disponíveis para o modal de seleção
  const ferramentasFiltradas = useMemo(() => {
    return materiais
      .filter(m => m.quantidade > 0)
      .filter(m => m.nome.toLowerCase().includes(buscaFerramenta.toLowerCase()));
  }, [materiais, buscaFerramenta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ferramentaSelecionada) return;

    setSalvando(true);
    try {
      const qtd = parseInt(quantidade);
      if (qtd > ferramentaSelecionada.quantidade) {
        toast.error(`Quantidade indisponível. Estoque: ${ferramentaSelecionada.quantidade}`);
        setSalvando(false);
        return;
      }

      await adicionarEmprestimo({
        usuario: `${nomeSolicitante} (Mat: ${matriculaSolicitante})`,
        materialSolicitado: ferramentaSelecionada.nome,
        material_categoria: ferramentaSelecionada.categoria,
        gerencia: gerencia,
        quantidade: qtd,
        data_saida: new Date().toISOString().split('T')[0],
        observacao: observacao
      }, ferramentaSelecionada.id);

      toast.success('Saída registrada com sucesso!');
      onFechar();
    } catch (error) {
      toast.error('Erro ao registrar a saída.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      {/* MODAL PRINCIPAL DO FORMULÁRIO */}
      <Dialog open={true} onOpenChange={(val) => !val && onFechar()}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Registrar Nova Saída</DialogTitle>
            <DialogDescription>Preencha os dados do solicitante e selecione a ferramenta.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* SOLICITANTE */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-2">
                <Label>Nome do Solicitante *</Label>
                <Input placeholder="Nome" value={nomeSolicitante} onChange={e => setNomeSolicitante(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Matrícula *</Label>
                <Input placeholder="Ex: 12345" value={matriculaSolicitante} onChange={e => setMatriculaSolicitante(e.target.value)} required />
              </div>
            </div>

            {/* SELEÇÃO DE FERRAMENTA (O BOTÃO QUE ABRE O SEGUNDO MODAL) */}
            <div className="space-y-2">
              <Label>Ferramenta Solicitada *</Label>
              <div 
                onClick={() => setModalSelecaoAberto(true)}
                className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${
                  ferramentaSelecionada ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {ferramentaSelecionada ? (
                  <div className="flex items-center gap-3">
                    {ferramentaSelecionada.categoria === 'mecanico' ? <Wrench className="size-5 text-orange-500" /> : <Zap className="size-5 text-purple-500" />}
                    <div>
                      <p className="font-medium text-blue-900">{ferramentaSelecionada.nome}</p>
                      <p className="text-xs text-blue-700">Disponível: {ferramentaSelecionada.quantidade}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Clique para selecionar uma ferramenta...</span>
                )}
                <Button type="button" variant="ghost" size="sm" className="text-blue-600">
                  {ferramentaSelecionada ? 'Trocar' : 'Selecionar'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input type="number" min="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Gerência Solicitante *</Label>
                <Input placeholder="Ex: Manutenção" value={gerencia} onChange={e => setGerencia(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observação / Motivo</Label>
              <Input placeholder="Opcional" value={observacao} onChange={e => setObservacao(e.target.value)} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onFechar} disabled={salvando}>Cancelar</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={salvando || !ferramentaSelecionada || !nomeSolicitante}>
                Confirmar Saída
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SEGUNDO MODAL: LISTA DE FERRAMENTAS PARA SELEÇÃO */}
      <Dialog open={modalSelecaoAberto} onOpenChange={setModalSelecaoAberto}>
        <DialogContent className="sm:max-w-[450px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar Ferramenta</DialogTitle>
            <DialogDescription>Escolha um item disponível no estoque.</DialogDescription>
          </DialogHeader>
          
          <div className="relative my-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input 
              placeholder="Buscar ferramenta..." 
              className="pl-10" 
              value={buscaFerramenta}
              onChange={e => setBuscaFerramenta(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {ferramentasFiltradas.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Nenhuma ferramenta encontrada.</p>
            ) : (
              ferramentasFiltradas.map((f) => (
                <div 
                  key={f.id}
                  onClick={() => { setMaterialId(f.id); setModalSelecaoAberto(false); }}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    materialId === f.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${f.categoria === 'mecanico' ? 'bg-orange-100' : 'bg-purple-100'}`}>
                      {f.categoria === 'mecanico' ? <Wrench className="size-4 text-orange-600" /> : <Zap className="size-4 text-purple-600" />}
                    </div>
                    <div>
                      <p className="font-medium">{f.nome}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">{f.categoria}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{f.quantidade}</p>
                    <p className="text-[10px] text-gray-500">em estoque</p>
                    {materialId === f.id && <Check className="size-4 text-blue-600 mt-1 ml-auto" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}