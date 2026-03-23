import React, { useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoTotalPorGerencia() {
  const { emprestimos } = useEmprestimos();

  const dadosTotaisPorGerencia = useMemo(() => {
    const distribuicao: Record<string, number> = {};
    
    // Sem filtro de status: conta TODOS os registos (Histórico Completo)
    emprestimos.forEach(e => {
      const g = e.gerencia || 'Não Informada';
      const qtd = Number(e.quantidade) || 0;
      distribuicao[g] = (distribuicao[g] || 0) + qtd;
    });
    
    return Object.entries(distribuicao)
      .map(([nome, unidades]) => ({ nome, unidades }))
      .sort((a, b) => b.unidades - a.unidades); // Ordena do maior para o menor
  }, [emprestimos]);

  return (
    <Card id="grafico-total-gerencia" className="shadow-sm border-t-4 border-t-blue-600">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-blue-600" />
          <CardTitle className="text-lg">Histórico Total por Gerência (Todas as Saídas)</CardTitle>
        </div>
        <AcoesGrafico
          elementId="grafico-total-gerencia"
          titulo="Historico Total por Gerencia"
          dados={dadosTotaisPorGerencia}
        />
      </CardHeader>
      <CardContent className="h-64">
        {dadosTotaisPorGerencia.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 italic">Nenhum registo no histórico</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosTotaisPorGerencia} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                formatter={(value) => [`${value} unidades`, 'Total de ferramentas retiradas']} 
              />
              {/* Barra em azul para diferenciar do gráfico de ativos */}
              <Bar dataKey="unidades" fill="#2563eb" radius={[4, 4, 0, 0]} name="Unidades Retiradas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}