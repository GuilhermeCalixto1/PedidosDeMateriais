// src/app/features/dashboard/components/GraficoDevolucao.tsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoDevolucao({ emprestimos }: { emprestimos: any[] }) {
  const dados = useMemo(() => {
    // Contagem direta por status
    const devolvidos = emprestimos.filter(e => e.status === 'Devolvido').length;
    const pendentes = emprestimos.filter(e => e.status === 'Pendente').length;
    
    const total = devolvidos + pendentes;
    if (total === 0) return [];

    return [
      { 
        name: 'Devolvidos', 
        value: devolvidos, 
        color: '#10b981', 
        percent: ((devolvidos / total) * 100).toFixed(1) 
      },
      { 
        name: 'Pendentes', 
        value: pendentes, 
        color: '#f59e0b', 
        percent: ((pendentes / total) * 100).toFixed(1) 
      }
    ].filter(d => d.value > 0);
  }, [emprestimos]);

  return (
    <Card id="graf-devolucao-final" className="shadow-sm overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <PieIcon className="size-5 text-indigo-600" />
          <CardTitle className="text-lg">Taxa de Devolução (%)</CardTitle>
        </div>
        <AcoesGrafico elementId="graf-devolucao-final" titulo="Taxa de Devolução" dados={dados} />
      </CardHeader>
      <CardContent className="h-64">
        {dados.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">Sem dados</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={dados} 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
                // Padrão Categoria: Porcentagem fora com linha
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                labelLine={true}
              >
                {dados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any, props: any) => [
                  `${value} itens (${props.payload.percent}%)`, 
                  name
                ]} 
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}