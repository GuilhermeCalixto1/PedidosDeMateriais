import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Emprestimo } from '../../../types';
import { AcoesGrafico } from './AcoesGrafico';

interface Props { emprestimos: Emprestimo[]; }

export function GraficoFluxoDiario({ emprestimos }: Props) {
  const dados = useMemo(() => {
    const mapa: Record<string, { data: string, saidas: number, devolucoes: number }> = {};
    
    emprestimos.forEach(e => {
      // Contabilizar Saídas
      if (e.data_saida) {
        const dSaida = e.data_saida.split('T')[0];
        if (!mapa[dSaida]) mapa[dSaida] = { data: dSaida, saidas: 0, devolucoes: 0 };
        mapa[dSaida].saidas += (Number(e.quantidade) || 0);
      }
      // Contabilizar Devoluções
      if (e.status === 'Devolvido' && e.data_devolucao) {
        const dDev = e.data_devolucao.split('T')[0];
        if (!mapa[dDev]) mapa[dDev] = { data: dDev, saidas: 0, devolucoes: 0 };
        mapa[dDev].devolucoes += (Number(e.quantidade) || 0);
      }
    });

    return Object.values(mapa).sort((a, b) => a.data.localeCompare(b.data));
  }, [emprestimos]);

  return (
    <Card id="fluxo-comparativo" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-purple-600" />
          <CardTitle className="text-lg">Fluxo de Movimentação (Saídas vs Devoluções)</CardTitle>
        </div>
        {/* BOTÃO DE IMPRESSÃO INDIVIDUAL AQUI */}
        <AcoesGrafico elementId="fluxo-comparativo" titulo="Fluxo Saídas vs Devoluções" dados={dados} />
      </CardHeader>
      <CardContent className="h-80">
        {dados.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">Sem movimentação no período</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="data" 
                tick={{fontSize: 10}} 
                tickFormatter={(str) => str.split('-').reverse().slice(0,2).join('/')} 
              />
              <YAxis tick={{fontSize: 10}} />
              <Tooltip labelFormatter={(label) => `Data: ${label.split('-').reverse().join('/')}`} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} name="Saídas" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="devolucoes" stroke="#10b981" strokeWidth={2} name="Devoluções" dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}