import React, { useMemo } from 'react';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { useConfiguracoes } from '../../../contexts/ConfiguracoesContext'; // <-- NOVO IMPORT
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

export function PainelEstoqueCritico() {
  const { materiais } = useMateriais();
  const { configuracoes } = useConfiguracoes(); // <-- PUXANDO OS LIMITES

  const itensCriticos = useMemo(() => {
    return materiais
      // AGORA A RUPTURA DEPENDE DO QUE ESTIVER CONFIGURADO
      .filter(m => m.quantidade <= configuracoes.estoqueMinimoRuptura) 
      .sort((a, b) => a.quantidade - b.quantidade)
      .slice(0, 5);
  }, [materiais, configuracoes.estoqueMinimoRuptura]);

  return (
    <Card className="shadow-sm border-t-4 border-t-red-500">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertTriangle className="size-5 text-red-600" />
        <CardTitle className="text-lg">Alerta de Ruptura (≤ {configuracoes.estoqueMinimoRuptura})</CardTitle>
      </CardHeader>
      <CardContent className="h-80 overflow-y-auto pt-4">
        {itensCriticos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-green-50 rounded-full">
              <AlertTriangle className="size-6 text-green-500 opacity-50" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Estoque Saudável!</p>
            <p className="text-gray-400 text-xs">Nenhuma ferramenta em nível crítico.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itensCriticos.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 border rounded-lg transition-all hover:shadow-md ${
                  item.quantidade === 0 
                    ? 'bg-red-50/80 border-red-100' 
                    : 'bg-orange-50/50 border-orange-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.quantidade === 0 ? (
                    <AlertOctagon className="size-5 text-red-600 animate-pulse" />
                  ) : (
                    <AlertTriangle className="size-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.nome}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{item.categoria}</p>
                  </div>
                </div>
                
                <Badge 
                  className={`font-bold px-3 py-1 ${
                    item.quantidade === 0 
                      ? 'bg-red-100 text-red-700 border-red-200' 
                      : 'bg-orange-100 text-orange-700 border-orange-200'
                  }`}
                >
                  {item.quantidade} disp.
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}