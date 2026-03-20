import React, { useMemo } from 'react';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertTriangle, AlertOctagon } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { AcoesGrafico } from './AcoesGrafico';

export function PainelEstoqueCritico() {
  const { materiais } = useMateriais();

  const itensCriticos = useMemo(() => {
    return materiais
      // O ALERTA DISPARA PARA FERRAMENTAS COM 2 OU MENOS UNIDADES NA PRATELEIRA
      .filter(m => m.quantidade <= 5) 
      .sort((a, b) => a.quantidade - b.quantidade)
      .slice(0, 5); // Mostra no máximo o Top 5 mais urgente para não quebrar o layout
  }, [materiais]);

  return (
    <Card id="painel-estoque-critico" className="shadow-sm border-t-4 border-t-red-500">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-red-600" />
          <CardTitle className="text-lg">Alerta de Ruptura (Estoque Crítico)</CardTitle>
        </div>
        <AcoesGrafico
          elementId="painel-estoque-critico"
          titulo="Alerta de Ruptura (Estoque Critico)"
          dados={itensCriticos.map((item) => ({
            material: item.nome,
            categoria: item.categoria,
            disponivel: item.quantidade
          }))}
        />
      </CardHeader>
      <CardContent className="h-80 overflow-y-auto pt-4">
        {itensCriticos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-3 bg-green-50 rounded-full">
              <AlertTriangle className="size-6 text-green-500 opacity-50" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Estoque Saudável!</p>
            <p className="text-gray-400 text-xs">Nenhuma ferramenta em falta no momento.</p>
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
                      ? 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200'
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