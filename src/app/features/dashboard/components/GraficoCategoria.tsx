import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tags } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Emprestimo } from '../../../types';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoCategoria({ emprestimos }: { emprestimos: Emprestimo[] }) {
  const dados = useMemo(() => {
    let mec = 0, ele = 0;
    emprestimos.forEach(e => {
      const q = Number(e.quantidade) || 0;
      if (e.material_categoria === 'mecanico') mec += q;
      else if (e.material_categoria === 'eletrico') ele += q;
    });
    const total = mec + ele;
    return [
      { name: 'Mecânico', value: mec, percent: total > 0 ? ((mec/total)*100).toFixed(1) : 0, color: '#f97316' },
      { name: 'Elétrico', value: ele, percent: total > 0 ? ((ele/total)*100).toFixed(1) : 0, color: '#8b5cf6' }
    ].filter(d => d.value > 0);
  }, [emprestimos]);

  return (
    <Card id="categoria-dist" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2"><Tags className="size-5 text-gray-600" /><CardTitle className="text-lg">Distribuição por Categoria (%)</CardTitle></div>
        <AcoesGrafico elementId="categoria-dist" titulo="Porcentagem por Categoria" dados={dados} />
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dados} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name}: ${percent}%`}>
              {dados.map((entry, index) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${value} un (${props.payload.percent}%)`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}