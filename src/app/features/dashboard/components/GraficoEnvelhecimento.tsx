import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Emprestimo } from '../../../types';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoEnvelhecimento({ emprestimos }: { emprestimos: Emprestimo[] }) {
  const dados = useMemo(() => {
    let ate3 = 0, de4a7 = 0, de8a15 = 0, mais15 = 0;
    const hoje = new Date().getTime();

    emprestimos.filter(e => e.status === 'Pendente').forEach(e => {
      if (!e.data_saida) return;
      const dias = Math.floor((hoje - new Date(e.data_saida).getTime()) / (1000 * 3600 * 24));
      const qtd = Number(e.quantidade) || 0;
      if (dias <= 3) ate3 += qtd;
      else if (dias <= 7) de4a7 += qtd;
      else if (dias <= 15) de8a15 += qtd;
      else mais15 += qtd;
    });

    return [
      { nome: '0-3 dias', valor: ate3, cor: '#10b981' },
      { nome: '4-7 dias', valor: de4a7, cor: '#f59e0b' },
      { nome: '8-15 dias', valor: de8a15, cor: '#f97316' },
      { nome: '+15 dias', valor: mais15, cor: '#ef4444' }
    ].filter(d => d.valor > 0);
  }, [emprestimos]);

  return (
    <Card id="envelhecimento-graf" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><Clock className="size-5 text-orange-600" /><CardTitle className="text-lg">Envelhecimento de Pendentes</CardTitle></div>
        <AcoesGrafico elementId="envelhecimento-graf" titulo="Envelhecimento de Pendentes" dados={dados} />
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {dados.map((entry, index) => <Cell key={index} fill={entry.cor} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}