import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { DevolucaoSchema } from '../../../utils/validacoes';

interface ModalDevolucaoProps {
  emprestimo: any;
  dataDevolucao: string;
  setDataDevolucao: (data: string) => void;
  nomeRecebedor: string;
  matriculaRecebedor: string;
  setNomeRecebedor: (nome: string) => void;
  setMatriculaRecebedor: (mat: string) => void;
  emPerfeitasCondicoes: boolean;
  setEmPerfeitasCondicoes: (valor: boolean) => void;
  observacaoAvaria: string;
  setObservacaoAvaria: (valor: string) => void;
  processando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalDevolucao({
  emprestimo, 
  dataDevolucao, setDataDevolucao, 
  nomeRecebedor, setNomeRecebedor,
  matriculaRecebedor, setMatriculaRecebedor,
  emPerfeitasCondicoes,
  setEmPerfeitasCondicoes,
  observacaoAvaria,
  setObservacaoAvaria,
  processando, onConfirmar, onCancelar
}: ModalDevolucaoProps) {
  
  if (!emprestimo) return null;

  const handleConfirmar = () => {
    try {
      DevolucaoSchema.parse({
        nomeRecebedor,
        matriculaRecebedor,
      });

      if (!emPerfeitasCondicoes && !observacaoAvaria.trim()) {
        toast.error('Descreva o que aconteceu com o material avariado.');
        return;
      }

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
              onChange={(e) => setNomeRecebedor(e.target.value)} 
              disabled={processando}
              placeholder="Nome do almoxarife"
            />
          </div>

          <div className="space-y-2">
            <Label>Matrícula do Recebedor</Label>
            <Input 
              value={matriculaRecebedor} 
              onChange={(e) => setMatriculaRecebedor(e.target.value)} 
              disabled={processando}
              placeholder="Ex: 123456"
            />
          </div>

          <div className="space-y-2">
            <Label>Item(s) em perfeitas condições?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={emPerfeitasCondicoes ? 'default' : 'outline'}
                className={emPerfeitasCondicoes ? 'bg-green-600 hover:bg-green-700' : ''}
                disabled={processando}
                onClick={() => {
                  setEmPerfeitasCondicoes(true);
                  setObservacaoAvaria('');
                }}
              >
                Sim
              </Button>
              <Button
                type="button"
                variant={!emPerfeitasCondicoes ? 'default' : 'outline'}
                className={!emPerfeitasCondicoes ? 'bg-red-600 hover:bg-red-700' : ''}
                disabled={processando}
                onClick={() => setEmPerfeitasCondicoes(false)}
              >
                Não
              </Button>
            </div>
          </div>

          {!emPerfeitasCondicoes && (
            <div className="space-y-2">
              <Label>Observação da Avaria</Label>
              <Textarea
                value={observacaoAvaria}
                onChange={(e) => setObservacaoAvaria(e.target.value)}
                disabled={processando}
                placeholder="Descreva o dano, defeito ou problema encontrado no material"
                rows={4}
              />
            </div>
          )}
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