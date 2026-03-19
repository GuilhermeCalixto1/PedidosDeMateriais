import React, { useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function GraficoGerencia() {
  const { emprestimos } = useEmprestimos();

  const dadosPorGerencia = useMemo(() => {
    const distribuicao: Record<string, number> = {};
    emprestimos
      .filter(e => e.status === 'Pendente')
      .forEach(e => {
        const g = e.gerencia || 'Não Informada';
        const qtd = Number(e.quantidade) || 0;
        distribuicao[g] = (distribuicao[g] || 0) + qtd;
      });
    
    return Object.entries(distribuicao)
      .map(([nome, unidades]) => ({ nome, unidades }))
      .sort((a, b) => b.unidades - a.unidades);
  }, [emprestimos]);

  return (
    <Card className="shadow-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-center gap-2">
        <Building2 className="size-5 text-emerald-600" />
        <CardTitle className="text-lg">Materiais em Posse por Gerência (Ativos)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {dadosPorGerencia.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 italic">Nenhum material emprestado no momento</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosPorGerencia} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value) => [`${value} unidades`, 'Atualmente com a Gerência']} />
              <Bar dataKey="unidades" fill="#10b981" radius={[4, 4, 0, 0]} name="Unidades" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}