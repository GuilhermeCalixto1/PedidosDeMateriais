import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Emprestimo } from '../../../types';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoTopItens({ emprestimos }: { emprestimos: Emprestimo[] }) {
  const dados = useMemo(() => {
    const contagem: Record<string, number> = {};
    emprestimos.forEach(e => {
      const item = e.materialSolicitado || 'Desconhecido';
      contagem[item] = (contagem[item] || 0) + (Number(e.quantidade) || 0);
    });
    return Object.entries(contagem).map(([nome, total]) => ({ nome, total })).sort((a,b) => b.total - a.total).slice(0, 10);
  }, [emprestimos]);

  return (
    <Card id="top-itens-graf" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><Package className="size-5 text-blue-600" /><CardTitle className="text-lg">Top 10 Ferramentas Mais Requisitadas</CardTitle></div>
        <AcoesGrafico elementId="top-itens-graf" titulo="Top 10 Ferramentas" dados={dados} />
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <XAxis dataKey="nome" tick={{fontSize: 10}} angle={-10} textAnchor="end" interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}