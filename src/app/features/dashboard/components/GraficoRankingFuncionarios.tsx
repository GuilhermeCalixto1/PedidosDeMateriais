import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Emprestimo } from '../../../types';
import { AcoesGrafico } from './AcoesGrafico';

interface Props { emprestimos: Emprestimo[]; }

export function GraficoRankingFuncionarios({ emprestimos }: Props) {
  const dados = useMemo(() => {
    const contagem: Record<string, { total: number, matricula: string }> = {};
    
    // Filtra apenas o que está pendente hoje (Acumuladores)
    emprestimos.filter(e => e.status === 'Pendente').forEach(e => {
      const usuarioCompleto = e.usuario || 'Desconhecido';
      let nomeLimpo = usuarioCompleto;
      let matriculaStr = '---';

      if (usuarioCompleto.includes('(Mat:')) {
        const partes = usuarioCompleto.split('(Mat:');
        nomeLimpo = partes[0].trim();
        matriculaStr = partes[1].replace(')', '').trim();
      }

      if (!contagem[nomeLimpo]) contagem[nomeLimpo] = { total: 0, matricula: matriculaStr };
      contagem[nomeLimpo].total += (Number(e.quantidade) || 0);
    });

    return Object.entries(contagem)
      .map(([nome, info]) => ({ nome, total: info.total, matricula: info.matricula }))
      .sort((a, b) => b.total - a.total).slice(0, 5);
  }, [emprestimos]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-red-200 shadow-xl rounded-lg">
          <p className="font-bold text-gray-800">{d.nome}</p>
          <p className="text-xs text-red-600 font-mono">Matrícula: {d.matricula}</p>
          <p className="text-sm mt-1 font-semibold">{d.total} itens retidos</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card id="ranking-acumuladores" className="shadow-sm border-t-4 border-t-red-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-red-600" />
          <CardTitle className="text-lg text-red-700">Ranking de Acumuladores</CardTitle>
        </div>
        <AcoesGrafico elementId="ranking-acumuladores" titulo="Ranking de Acumuladores" dados={dados} />
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
            <XAxis type="number" hide />
            <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 11, fontWeight: 'bold' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" fill="#ef4444" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}