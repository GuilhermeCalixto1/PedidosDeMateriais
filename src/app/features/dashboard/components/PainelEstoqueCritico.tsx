import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { AcoesGrafico } from './AcoesGrafico';

export function PainelEstoqueCritico() {
  const { materiais } = useMateriais();
  const criticos = materiais.filter(m => m.quantidade <= 2);

  return (
    <Card id="estoque-critico-painel" className="shadow-sm border-l-4 border-l-red-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><AlertTriangle className="size-5 text-red-600" /><CardTitle className="text-lg">Alerta de Ruptura (≤ 2)</CardTitle></div>
        <AcoesGrafico elementId="estoque-critico-painel" titulo="Alerta de Ruptura" dados={criticos} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticos.length === 0 ? <p className="text-gray-400 italic text-center py-4">Estoque saudável</p> : 
            criticos.map(m => (
              <div key={m.id} className="flex justify-between items-center p-2 bg-red-50 rounded-md border border-red-100">
                <span className="font-medium text-gray-800">{m.nome}</span>
                <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">{m.quantidade} un</span>
              </div>
            ))
          }
        </div>
      </CardContent>
    </Card>
  );
}