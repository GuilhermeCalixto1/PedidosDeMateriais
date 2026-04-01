import React, { useState, useEffect } from 'react';
import { Material } from '../../../types';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';

interface ModalEditarMaterialProps {
  material: Material | null;
  onFechar: () => void;
}

export function ModalEditarMaterial({ material, onFechar }: ModalEditarMaterialProps) {
  const { atualizarQuantidade } = useMateriais();
  const [quantidade, setQuantidade] = useState('');
  const [avariadas, setAvariadas] = useState('');
  const [processando, setProcessando] = useState(false);

  // Quando o modal abre, preenche os inputs com os valores atuais da ferramenta
  useEffect(() => {
    if (material) {
      setQuantidade(material.quantidade.toString());
      setAvariadas((material.avariadas || 0).toString());
    }
  }, [material]);

  const handleSalvar = async () => {
    if (!material) return;
    
    const novaQtd = Number(quantidade);
    const novasAvariadas = Number(avariadas);
    
    if (isNaN(novaQtd) || novaQtd < 0) {
      toast.error('Por favor, insira uma quantidade válida.');
      return;
    }
    
    if (isNaN(novasAvariadas) || novasAvariadas < 0) {
      toast.error('Por favor, insira uma quantidade válida para avariadas.');
      return;
    }

    setProcessando(true);
    try {
      await atualizarQuantidade(material.id, novaQtd, novasAvariadas);
      toast.success(`Estoque de "${material.nome}" atualizado com sucesso!`);
      onFechar();
    } catch (error) {
      toast.error('Erro ao atualizar a quantidade do material.');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Dialog open={!!material} onOpenChange={(open) => !open && onFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Quantidade em Estoque</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ferramenta Selecionada</Label>
            {/* Input desativado apenas para mostrar o nome */}
            <Input value={material?.nome || ''} disabled className="bg-gray-50 text-gray-500 font-medium" />
          </div>
          
          <div className="space-y-2">
            <Label>Quantidade na Prateleira</Label>
            <Input 
              type="number" 
              min="0" 
              value={quantidade} 
              onChange={(e) => setQuantidade(e.target.value)}
              className="text-lg font-bold"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              O sistema calculará o património total somando esta quantidade, as emprestadas e as avariadas.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Quantidade de Ferramentas Avariadas em Estoque</Label>
            <Input 
              type="number" 
              min="0" 
              value={avariadas} 
              onChange={(e) => setAvariadas(e.target.value)}
              className="text-lg font-bold"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total de ferramentas danificadas armazenadas no estoque.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onFechar} disabled={processando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={processando} className="bg-blue-600 hover:bg-blue-700">
            {processando ? 'A Salvar...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}