import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner'; // <-- IMPORT DO TOAST

interface ModalNovoMaterialProps {
  aberto: boolean;
  onFechar: () => void;
  adicionarMaterial: (material: any) => Promise<void>;
}

export function ModalNovoMaterial({ aberto, onFechar, adicionarMaterial }: ModalNovoMaterialProps) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<'mecanico' | 'eletrico'>('mecanico');
  const [quantidade, setQuantidade] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const qtd = parseInt(quantidade);
      if (isNaN(qtd) || qtd < 0) {
        toast.warning('A quantidade deve ser um número válido.'); // ALERTA AMARELO
        setSalvando(false);
        return;
      }

      await adicionarMaterial({
        nome: nome.trim(),
        categoria,
        quantidade: qtd,
      });

      // ALERTA VERDE DE SUCESSO!
      toast.success('Ferramenta adicionada ao estoque com sucesso!');

      setNome('');
      setCategoria('mecanico');
      setQuantidade('');
      onFechar();
    } catch (error) {
      // ALERTA VERMELHO DE ERRO!
      toast.error('Erro de conexão ao adicionar material. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(val) => !val && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Ferramenta</DialogTitle>
          <DialogDescription>Adicione um novo item ao catálogo de inventário.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required disabled={salvando} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v as any)} disabled={salvando}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mecanico">Mecânico</SelectItem>
                  <SelectItem value="eletrico">Elétrico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidadeForm">Qtd. Inicial *</Label>
              <Input id="quantidadeForm" type="number" min="0" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required disabled={salvando} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onFechar} disabled={salvando}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? 'A guardar...' : 'Cadastrar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}