import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';
import { Emprestimo } from '../../../types';

interface GraficoGerenciaProps {
  emprestimos: Emprestimo[];
}

export function GraficoGerencia({ emprestimos }: GraficoGerenciaProps) {
  
  const dadosGerencia = useMemo(() => {
    const distribuicao: Record<string, number> = {};
    
    // Filtramos apenas os pendentes DENTRO da lista que já foi cortada pela data
    emprestimos
      .filter(e => e.status === 'Pendente')
      .forEach(e => {
        const g = e.gerencia || 'Não Informada';
        const qtd = Number(e.quantidade) || 0;
        distribuicao[g] = (distribuicao[g] || 0) + qtd;
      });
    
    return Object.entries(distribuicao)
      .map(([nome, ativos]) => ({ nome, ativos }))
      .sort((a, b) => b.ativos - a.ativos);
  }, [emprestimos]);

  return (
    <Card id="grafico-gerencia" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-emerald-600" />
          <CardTitle className="text-lg">Equipamentos Retidos por Gerência</CardTitle>
        </div>
        <AcoesGrafico elementId="grafico-gerencia" titulo="Retidos por Gerencia" dados={dadosGerencia} />
      </CardHeader>
      <CardContent className="h-64">
        {dadosGerencia.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 italic">Nenhum equipamento retido no período selecionado</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGerencia} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="ativos" fill="#10b981" radius={[4, 4, 0, 0]} name="Itens Retidos" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}