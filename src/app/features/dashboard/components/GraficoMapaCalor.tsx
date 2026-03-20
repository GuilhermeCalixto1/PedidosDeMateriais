import React, { useMemo, useState } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

export function GraficoMapaCalor() {
  const { emprestimos } = useEmprestimos();
  const [periodoMapaCalor, setPeriodoMapaCalor] = useState<'total' | '30'>('total');

  const dadosDias = useMemo(() => {
    // Array para guardar os 7 dias da semana (Domingo é o índice 0 no JavaScript)
    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const contagem = [0, 0, 0, 0, 0, 0, 0];

    let filtrados = emprestimos;
    if (periodoMapaCalor === '30') {
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);

      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - 30);
      dataLimite.setHours(0, 0, 0, 0);

      filtrados = emprestimos.filter((emp) => {
        if (!emp.data_saida) return false;
        const partes = emp.data_saida.split('-');
        if (partes.length !== 3) return false;
        const dataEmprestimo = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        return dataEmprestimo >= dataLimite && dataEmprestimo <= hoje;
      });
    }

    filtrados.forEach(emp => {
      if (!emp.data_saida) return;
      
      // Converte a string de data com precisão para não haver erros de fuso horário
      const partes = emp.data_saida.split('-');
      if (partes.length !== 3) return;
      
      const data = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      const diaSemana = data.getDay(); // Retorna de 0 a 6
      
      const qtd = Number(emp.quantidade) || 0;
      contagem[diaSemana] += qtd; // Soma a quantidade ao dia correto
    });

    // Formata os dados para o Recharts ler facilmente
    return diasSemana.map((nome, index) => ({
      dia: nome.substring(0, 3), // Mostra só "Dom", "Seg", "Ter" no eixo do gráfico
      nomeCompleto: nome,
      quantidade: contagem[index]
    }));
  }, [emprestimos, periodoMapaCalor]);

  const descricaoPeriodo = periodoMapaCalor === 'total' ? 'Geral' : 'Últimos 30 dias';

  return (
    <Card id="grafico-mapa-calor" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-purple-500" />
          <CardTitle className="text-lg">Picos de Trabalho ({descricaoPeriodo})</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Select value={periodoMapaCalor} onValueChange={(value) => setPeriodoMapaCalor(value as 'total' | '30')}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-gray-50">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Geral</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <AcoesGrafico
            elementId="grafico-mapa-calor"
            titulo={`Picos de Trabalho por Dia da Semana (${descricaoPeriodo})`}
            dados={dadosDias}
          />
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosDias} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              formatter={(value) => [`${value} ferramentas`, `Saídas (${descricaoPeriodo})`]}
              labelFormatter={(label) => {
                // Ao passar o rato, mostra o nome completo "Segunda-feira" em vez de só "Seg"
                const item = dadosDias.find(d => d.dia === label);
                return item ? item.nomeCompleto : label;
              }}
            />
            {/* Barra roxa para representar o volume de trabalho */}
            <Bar dataKey="quantidade" fill="#a855f7" radius={[4, 4, 0, 0]} name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}