import React from 'react';
import { Card, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { CheckCircle, Clock, FileText, Zap, Wrench } from 'lucide-react';

// Definimos o que este componente precisa para funcionar
interface CartaoEmprestimoProps {
  emprestimo: any;
  onAbrirDevolucao: () => void;
  processando: boolean;
}

export function CartaoEmprestimo({ emprestimo, onAbrirDevolucao, processando }: CartaoEmprestimoProps) {
  
  // Funções visuais movidas para o seu devido lugar (Responsabilidade Única)
  const getStatusBadge = (status: 'Pendente' | 'Devolvido') => {
    if (status === 'Pendente') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="size-3 mr-1" /> Pendente</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="size-3 mr-1" /> Devolvido</Badge>;
  };

  const getCategoriaBadge = (categoria?: string) => {
    if (categoria === 'eletrico') {
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200"><Zap className="size-3 mr-1" /> Elétrico</Badge>;
    }
    if (categoria === 'mecanico') {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200"><Wrench className="size-3 mr-1" /> Mecânico</Badge>;
    }
    return null;
  };

  return (
    <Card className={emprestimo.status === 'Devolvido' ? 'bg-green-50/30' : ''}>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex-1">
            
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <CardTitle className="text-lg mr-1">{emprestimo.materialSolicitado}</CardTitle>
              {getCategoriaBadge(emprestimo.material_categoria)}
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {emprestimo.quantidade} unid.
              </Badge>
              {getStatusBadge(emprestimo.status)}
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><span className="font-semibold text-gray-700">Retirado por:</span> <span className="text-gray-900">{emprestimo.usuario}</span></div>
                <div>
                  <span className="font-semibold text-gray-700">Data de Saída:</span>{' '}
                  <span className="text-gray-900">{emprestimo.data_saida ? new Date(emprestimo.data_saida + 'T12:00:00Z').toLocaleDateString('pt-BR') : 'Sem data'}</span>
                </div>
                {emprestimo.gerencia && (
                  <div><span className="font-semibold text-gray-700">Gerência:</span> <span className="text-gray-900">{emprestimo.gerencia}</span></div>
                )}
                {emprestimo.status === 'Devolvido' && emprestimo.data_devolucao && (
                  <>
                    <div>
                      <span className="font-semibold text-gray-700">Data de Devolução:</span>{' '}
                      <span className="text-gray-900">{new Date(emprestimo.data_devolucao + 'T12:00:00Z').toLocaleDateString('pt-BR')}</span>
                    </div>
                    {emprestimo.responsavel_recebimento && (
                      <div className="sm:col-span-2">
                        <span className="font-semibold text-gray-700">Recebido por:</span>{' '}
                        <span className="text-gray-900">{emprestimo.responsavel_recebimento}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {emprestimo.observacao && (
                <div className="pt-2 border-t border-gray-200 mt-3">
                  <div className="font-semibold text-gray-700 mb-1 flex items-center"><FileText className="size-4 mr-1"/> Observação/Motivo:</div>
                  <div className="text-gray-900 italic">"{emprestimo.observacao}"</div>
                </div>
              )}
            </div>
          </div>

          {emprestimo.status === 'Pendente' && (
            <div className="flex items-start">
              <Button onClick={onAbrirDevolucao} size="lg" className="bg-green-600 hover:bg-green-700 w-full lg:w-auto" disabled={processando}>
                <CheckCircle className="size-5 mr-2" /> Marcar como Devolvido
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}