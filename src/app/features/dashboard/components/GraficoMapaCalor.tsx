import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Emprestimo } from '../../../types';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoMapaCalor({ emprestimos }: { emprestimos: Emprestimo[] }) {
  const dados = useMemo(() => {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const contagem = [0,0,0,0,0,0,0];
    emprestimos.forEach(e => {
      if (e.data_saida) {
        const d = new Date(e.data_saida + 'T12:00:00').getDay();
        contagem[d] += (Number(e.quantidade) || 0);
      }
    });
    return dias.map((dia, i) => ({ dia, total: contagem[i] }));
  }, [emprestimos]);

  return (
    <Card id="mapa-movimento" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><Calendar className="size-5 text-teal-600" /><CardTitle className="text-lg">Dias de Maior Movimento</CardTitle></div>
        <AcoesGrafico elementId="mapa-movimento" titulo="Movimento Semanal" dados={dados} />
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}