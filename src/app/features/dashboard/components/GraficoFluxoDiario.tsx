import React, { useMemo, useState } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoFluxoDiario() {
  const { emprestimos } = useEmprestimos();
  const [periodoFluxo, setPeriodoFluxo] = useState('14');

  const dadosFluxoDiario = useMemo(() => {
    const dias = parseInt(periodoFluxo);
    const mapaDatas: Record<string, { dataExibicao: string; saidas: number; devolucoes: number }> = {};
    
    for (let i = dias - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dataIso = d.toISOString().split('T')[0];
      const dataFormatada = `${dataIso.split('-')[2]}/${dataIso.split('-')[1]}`;
      mapaDatas[dataIso] = { dataExibicao: dataFormatada, saidas: 0, devolucoes: 0 };
    }

    emprestimos.forEach(emp => {
      const qtd = Number(emp.quantidade) || 0;
      if (emp.data_saida && mapaDatas[emp.data_saida]) {
        mapaDatas[emp.data_saida].saidas += qtd;
      }
      if (emp.status === 'Devolvido' && emp.data_devolucao && mapaDatas[emp.data_devolucao]) {
        mapaDatas[emp.data_devolucao].devolucoes += qtd;
      }
    });

    return Object.values(mapaDatas);
  }, [emprestimos, periodoFluxo]);

  return (
    <Card id="grafico-fluxo-diario" className="shadow-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-blue-600" />
          <CardTitle className="text-lg">Fluxo Diário: Saídas vs Devoluções</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Select value={periodoFluxo} onValueChange={setPeriodoFluxo}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
            </SelectContent>
          </Select>
          <AcoesGrafico
            elementId="grafico-fluxo-diario"
            titulo="Fluxo Diario Saidas x Devolucoes"
            dados={dadosFluxoDiario}
          />
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosFluxoDiario} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="dataExibicao" tick={{ fontSize: 12 }} tickMargin={10} minTickGap={20} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value, name) => [`${value} unidades`, name === 'saidas' ? 'Saídas' : 'Devoluções']}
              labelFormatter={(label) => `Data: ${label}`}
            />
            <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-sm font-medium ml-1">{value === 'saidas' ? 'Saídas' : 'Devoluções'}</span>} />
            <Line type="monotone" dataKey="saidas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="saidas" />
            <Line type="monotone" dataKey="devolucoes" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="devolucoes" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}