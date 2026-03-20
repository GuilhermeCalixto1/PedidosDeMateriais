import React, { useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { useConfiguracoes } from '../../../contexts/ConfiguracoesContext'; // <-- NOVO IMPORT
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AcoesGrafico } from './AcoesGrafico';

export function GraficoEnvelhecimento() {
  const { emprestimos } = useEmprestimos();
  const { configuracoes } = useConfiguracoes(); // <-- PUXANDO OS LIMITES

  const dadosEnvelhecimento = useMemo(() => {
    let normal = 0;
    let atencao = 0;
    let critico = 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    emprestimos
      .filter(e => e.status === 'Pendente')
      .forEach(e => {
        if (!e.data_saida) return;
        
        const partes = e.data_saida.split('-');
        if (partes.length !== 3) return;
        
        const dataSaida = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
        dataSaida.setHours(0, 0, 0, 0);

        const diffTempo = hoje.getTime() - dataSaida.getTime();
        const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
        const qtd = Number(e.quantidade) || 0;

        // LÓGICA DINÂMICA
        if (diffDias < 3) {
          normal += qtd;
        } else if (diffDias >= 3 && diffDias < configuracoes.diasAlertaPerda) {
          atencao += qtd;
        } else {
          critico += qtd;
        }
      });

    return [
      { name: '< 3 dias', value: normal, color: '#22c55e' },
      { name: `3 a ${configuracoes.diasAlertaPerda - 1} dias`, value: atencao, color: '#eab308' },
      { name: `> ${configuracoes.diasAlertaPerda} dias (Crítico)`, value: critico, color: '#ef4444' }
    ];
  }, [emprestimos, configuracoes.diasAlertaPerda]);

  const dadosValidos = dadosEnvelhecimento.filter(d => d.value > 0);

  return (
    <Card id="grafico-envelhecimento" className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-orange-500" />
          <CardTitle className="text-lg">Envelhecimento na Rua</CardTitle>
        </div>
        <AcoesGrafico elementId="grafico-envelhecimento" titulo="Envelhecimento de Ferramentas" dados={dadosValidos.map(d => ({ Status: d.name, Quantidade: d.value }))} />
      </CardHeader>
      <CardContent className="h-80">
        {dadosValidos.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 italic">Nenhuma ferramenta pendente</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosValidos} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none" labelLine={true}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {dadosValidos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} unidades`, 'Quantidade Retida']} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}