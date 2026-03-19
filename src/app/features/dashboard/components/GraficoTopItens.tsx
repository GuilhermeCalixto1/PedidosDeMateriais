import React, { useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficoTopItens() {
  const { emprestimos } = useEmprestimos();

  const dadosTopEmprestimos = useMemo(() => {
    const contagem: Record<string, number> = {};
    emprestimos.forEach(e => {
      const qtd = Number(e.quantidade) || 0;
      contagem[e.materialSolicitado] = (contagem[e.materialSolicitado] || 0) + qtd;
    });
    
    return Object.entries(contagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [emprestimos]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Top 5: Mais Emprestados (Geral)</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {dadosTopEmprestimos.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 italic">Sem dados de movimentação</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosTopEmprestimos} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} unidades`, 'Total Saídas']} />
              <Bar dataKey="quantidade" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}