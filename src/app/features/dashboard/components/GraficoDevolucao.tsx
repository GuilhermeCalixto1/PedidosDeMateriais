import React, { useMemo, useState } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoDevolucao() {
  const { emprestimos } = useEmprestimos();
  const [periodoStatus, setPeriodoStatus] = useState('total');

  const dadosStatus = useMemo(() => {
    let filtrados = emprestimos;
    
    if (periodoStatus !== 'total') {
      const dias = parseInt(periodoStatus);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);
      
      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - dias);
      dataLimite.setHours(0, 0, 0, 0);

      filtrados = emprestimos.filter(e => {
        if (!e.data_saida) return false;
        const partes = e.data_saida.split('-');
        if (partes.length !== 3) return false;
        const dataEmprestimo = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        return dataEmprestimo >= dataLimite && dataEmprestimo <= hoje;
      });
    }

    let pendentes = 0;
    let devolvidos = 0;

    filtrados.forEach(e => {
      const qtd = Number(e.quantidade) || 0;
      if (e.status === 'Pendente') pendentes += qtd;
      if (e.status === 'Devolvido') devolvidos += qtd;
    });

    return [
      { name: 'Pendentes', value: pendentes },
      { name: 'Devolvidos', value: devolvidos }
    ];
  }, [emprestimos, periodoStatus]);

  const CORES_STATUS = ['#eab308', '#22c55e'];

  return (
    <Card id="grafico-devolucao" className="shadow-sm">
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">Taxa de Devolução (%)</CardTitle>
        <div className="flex items-center gap-1">
          <Select value={periodoStatus} onValueChange={setPeriodoStatus}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Todo o Período</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <AcoesGrafico
            elementId="grafico-devolucao"
            titulo="Taxa de Devolucao"
            dados={dadosStatus.map((item) => ({ status: item.name, total: item.value }))}
          />
        </div>
      </CardHeader>
      <CardContent className="h-80">
        {dadosStatus.every(d => d.value === 0) ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">Sem registros neste período</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" labelLine={true}
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