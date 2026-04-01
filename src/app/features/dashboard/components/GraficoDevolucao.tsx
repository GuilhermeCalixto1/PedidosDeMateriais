import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

// Agora recebe os "emprestimos" como propriedade (vindos do Dashboard)
export function GraficoDevolucao({ emprestimos }: { emprestimos: any[] }) {
  
  const dadosStatus = useMemo(() => {
    let pendentes = 0;
    let devolvidos = 0;

    // Calcula baseado no que o Dashboard filtrou e mandou
    emprestimos.forEach(e => {
      const qtd = Number(e.quantidade) || 0;
      if (e.status === 'Pendente') pendentes += qtd;
      if (e.status === 'Devolvido') devolvidos += qtd;
    });

    if (pendentes === 0 && devolvidos === 0) return [];

    return [
      { name: 'Pendentes', value: pendentes },
      { name: 'Devolvidos', value: devolvidos }
    ];
  }, [emprestimos]);

  // Pendente = Amarelo, Devolvido = Verde
  const CORES_STATUS = ['#f59e0b', '#10b981']; 

  return (
    <Card id="grafico-devolucao" className="shadow-sm overflow-visible">
      
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-2 space-y-0 relative z-20">
        <CardTitle className="text-lg">Taxa de Devolução (%)</CardTitle>
        <div className="flex items-center gap-1">
          {/* Removido o <Select> interno. O controle agora é do Dashboard */}
          
          <AcoesGrafico
            elementId="grafico-devolucao"
            titulo="Taxa de Devolução"
            dados={dadosStatus.map((item) => ({ status: item.name, total: item.value }))}
          />
        </div>
      </CardHeader>
      
      <CardContent className="h-80 relative z-10">
        {dadosStatus.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Sem registros neste período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosStatus} 
                cx="50%" 
                cy="50%" 
                innerRadius={60} 
                outerRadius={90} 
                paddingAngle={3} 
                dataKey="value" 
                stroke="none" 
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {dadosStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CORES_STATUS[index % CORES_STATUS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => {
                const total = dadosStatus.reduce((acc, curr) => acc + curr.value, 0);
                const perc = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return [`${perc}% (${value} unid.)`, 'Proporção'];
              }} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}