import React, { useMemo, useState } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoCategoria() {
  const { emprestimos } = useEmprestimos();
  const [periodoCategoria, setPeriodoCategoria] = useState('total');

  const dadosCategoria = useMemo(() => {
    let filtrados = emprestimos;

    if (periodoCategoria !== 'total') {
      const dias = parseInt(periodoCategoria);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);

      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - dias);
      dataLimite.setHours(0, 0, 0, 0);

      filtrados = emprestimos.filter(emp => {
        if (!emp.data_saida) return false;
        const partes = emp.data_saida.split('-');
        if (partes.length !== 3) return false;

        const dataEmprestimo = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        return dataEmprestimo >= dataLimite && dataEmprestimo <= hoje;
      });
    }

    let mecanico = 0;
    let eletrico = 0;

    filtrados.forEach(emp => {
      const qtd = Number(emp.quantidade) || 0;
      if (emp.material_categoria === 'mecanico') {
        mecanico += qtd;
      } else if (emp.material_categoria === 'eletrico') {
        eletrico += qtd;
      }
    });

    return [
      { name: 'Mecânica', value: mecanico, color: '#f97316' }, // Laranja
      { name: 'Elétrica', value: eletrico, color: '#a855f7' }  // Roxo
    ];
  }, [emprestimos, periodoCategoria]);

  const dadosValidos = dadosCategoria.filter(d => d.value > 0);
  const descricaoPeriodo = periodoCategoria === 'total' ? 'Geral' : `Últimos ${periodoCategoria} dias`;

  return (
    <Card id="grafico-categoria" className="shadow-sm">
      <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="size-5 text-gray-700" />
          <CardTitle className="text-lg">Demanda por Categoria ({descricaoPeriodo})</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Select value={periodoCategoria} onValueChange={setPeriodoCategoria}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Geral</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
            </SelectContent>
          </Select>
          <AcoesGrafico
            elementId="grafico-categoria"
            titulo={`Demanda por Categoria (${descricaoPeriodo})`}
            dados={dadosCategoria.map((item) => ({ categoria: item.name, total: item.value }))}
          />
        </div>
      </CardHeader>
      <CardContent className="h-72">
        {dadosValidos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">
            Sem dados de movimentação
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosValidos}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                labelLine={true}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {dadosValidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} unidades`, `Total de saídas (${descricaoPeriodo})`]} 
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}