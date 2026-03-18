import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';

// Definimos o que o Modal precisa para ser desenhado e funcionar
interface ModalDevolucaoProps {
  emprestimo: any;
  dataDevolucao: string;
  setDataDevolucao: (data: string) => void;
  nomeRecebedor: string;
  matriculaRecebedor: string;
  processando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalDevolucao({
  emprestimo,
  dataDevolucao,
  setDataDevolucao,
  nomeRecebedor,
  matriculaRecebedor,
  processando,
  onConfirmar,
  onCancelar
}: ModalDevolucaoProps) {
  
  // Se não houver empréstimo selecionado, não desenhamos nada
  if (!emprestimo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Confirmar Devolução</CardTitle>
          <CardDescription>
            Ferramenta: <strong className="text-gray-800">{emprestimo.materialSolicitado}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Data da Devolução *</Label>
            <Input type="date" value={dataDevolucao} onChange={e => setDataDevolucao(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Nome de quem está a receber</Label>
            <Input 
              value={nomeRecebedor} 
              readOnly 
              className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" 
              title="Preenchido automaticamente com o utilizador autenticado" 
            />
          </div>
          <div className="space-y-2">
            <Label>Matrícula de quem está a receber</Label>
            <Input 
              value={matriculaRecebedor} 
              readOnly 
              className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" 
              title="Preenchido automaticamente com o utilizador autenticado" 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onCancelar} disabled={processando}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
              onClick={onConfirmar} 
              disabled={processando || !nomeRecebedor || !matriculaRecebedor}
            >
              {processando ? 'A guardar...' : 'Confirmar Recebimento'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}