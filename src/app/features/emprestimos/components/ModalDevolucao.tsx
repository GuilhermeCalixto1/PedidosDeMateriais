import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { DevolucaoSchema } from '../../../utils/validacoes';

interface ModalDevolucaoProps {
  emprestimo: any;
  dataDevolucao: string;
  setDataDevolucao: (data: string) => void;
  nomeRecebedor: string;
  matriculaRecebedor: string;
  setNomeRecebedor?: (nome: string) => void;
  setMatriculaRecebedor?: (mat: string) => void;
  processando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalDevolucao({
  emprestimo, 
  dataDevolucao, setDataDevolucao, 
  nomeRecebedor, setNomeRecebedor,
  matriculaRecebedor, setMatriculaRecebedor,
  processando, onConfirmar, onCancelar
}: ModalDevolucaoProps) {
  
  if (!emprestimo) return null;

  const handleConfirmar = () => {
    try {
      DevolucaoSchema.parse({
        nomeRecebedor,
        matriculaRecebedor,
      });

      onConfirmar();
      
    }  catch (error) {
      // Forçamos o TypeScript a aceitar a estrutura do erro do Zod
      const err = error as any;
      
      if (err.errors && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Erro ao validar os dados do recebedor.");
      }
    }
  };

  return (
    <Dialog open={!!emprestimo} onOpenChange={(open) => { if (!open) onCancelar(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Devolução</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 text-blue-900 p-3 rounded-md text-sm border border-blue-100">
            <p className="font-semibold mb-1">Detalhes da Ferramenta:</p>
            <p><strong>Item:</strong> {emprestimo.materialSolicitado}</p>
            <p><strong>Qtd a Devolver:</strong> {emprestimo.quantidade}</p>
            <p><strong>Retirado por:</strong> {emprestimo.usuario}</p>
          </div>

          <div className="space-y-2">
            <Label>Data da Devolução</Label>
            <Input 
              type="date" 
              value={dataDevolucao} 
              onChange={(e) => setDataDevolucao(e.target.value)} 
              disabled={processando} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Recebido por (Nome)</Label>
            <Input 
              value={nomeRecebedor} 
              onChange={(e) => setNomeRecebedor && setNomeRecebedor(e.target.value)} 
              disabled={processando}
              placeholder="Nome do almoxarife"
            />
          </div>

          <div className="space-y-2">
            <Label>Matrícula do Recebedor</Label>
            <Input 
              value={matriculaRecebedor} 
              onChange={(e) => setMatriculaRecebedor && setMatriculaRecebedor(e.target.value)} 
              disabled={processando}
              placeholder="Ex: 123456"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="outline" onClick={onCancelar} disabled={processando}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={processando} className="bg-blue-600 hover:bg-blue-700">
            {processando ? 'A processar...' : 'Confirmar Devolução'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}