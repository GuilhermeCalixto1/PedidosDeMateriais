import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Alert, AlertDescription } from '../../../components/ui/alert';

interface FormularioSaidaProps {
  onFechar: () => void;
}

export function FormularioSaida({ onFechar }: FormularioSaidaProps) {
  const { user } = useAuth();
  const { adicionarEmprestimo } = useEmprestimos();
  const { materiais } = useMateriais();

  const [materialSolicitado, setMaterialSolicitado] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [gerencia, setGerencia] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      const materialSelecionado = materiais.find(m => m.id === materialSolicitado);
      if (!materialSelecionado) {
        setErro('Por favor, selecione uma ferramenta válida.');
        setSalvando(false);
        return;
      }

      const qtd = parseInt(quantidade);
      if (isNaN(qtd) || qtd <= 0) {
        setErro('A quantidade deve ser maior que zero.');
        setSalvando(false);
        return;
      }

      if (qtd > materialSelecionado.quantidade) {
        setErro(`Quantidade indisponível. Temos apenas ${materialSelecionado.quantidade} em estoque.`);
        setSalvando(false);
        return;
      }

      // Chama a função do Contexto (que agora usa o Serviço por trás!)
      await adicionarEmprestimo({
        usuario: user?.nome || 'Usuário Desconhecido',
        materialSolicitado: materialSelecionado.nome,
        material_categoria: materialSelecionado.categoria,
        gerencia: gerencia,
        quantidade: qtd,
        data_saida: new Date().toISOString().split('T')[0], // Pega apenas a data YYYY-MM-DD
        observacao: observacao
      }, materialSelecionado.id);

      onFechar();
    } catch (error) {
      setErro('Erro ao registar a saída. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(val) => !val && onFechar()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registar Nova Saída</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registar o empréstimo de uma ferramenta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {erro && (
            <Alert variant="destructive">
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="ferramenta">Ferramenta Solicitada *</Label>
            <Select value={materialSolicitado} onValueChange={setMaterialSolicitado}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ferramenta..." />
              </SelectTrigger>
              <SelectContent>
                {materiais.filter(m => m.quantidade > 0).map(material => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.nome} (Estoque: {material.quantidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input 
                id="quantidade" 
                type="number" 
                min="1" 
                value={quantidade} 
                onChange={(e) => setQuantidade(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gerencia">Gerência Solicitante *</Label>
              <Input 
                id="gerencia" 
                placeholder="Ex: Manutenção, Produção..." 
                value={gerencia} 
                onChange={(e) => setGerencia(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação / Motivo</Label>
            <Input 
              id="observacao" 
              placeholder="Opcional. Ex: Reparo na máquina X..." 
              value={observacao} 
              onChange={(e) => setObservacao(e.target.value)} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onFechar} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={salvando || !materialSolicitado || !quantidade || !gerencia}>
              {salvando ? 'A registar...' : 'Registar Saída'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}