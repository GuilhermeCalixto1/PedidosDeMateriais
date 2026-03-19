import React, { useMemo } from 'react';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// COMPONENTE DO BALÃO PERSONALIZADO
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dados = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl min-w-[200px]">
        <p className="font-bold text-gray-900 text-base">{dados.nomeCurto}</p>
        <div className="mt-1 space-y-1">
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Matrícula:</span> {dados.matricula}
          </p>
          <p className="text-xs text-gray-600">
            <span className="font-semibold">Gerência:</span> {dados.gerencia}
          </p>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="font-bold text-red-600 text-sm">
            {dados.quantidade} unidades retidas
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function GraficoRankingFuncionarios() {
  const { emprestimos } = useEmprestimos();

  const dadosRanking = useMemo(() => {
    // Agora guardamos um objeto completo para cada utilizador
    const contagem: Record<string, { nomeCurto: string; matricula: string; gerencia: string; quantidade: number }> = {};
    
    emprestimos
      .filter(e => e.status === 'Pendente')
      .forEach(e => {
        // Separa o nome da matrícula a partir do texto "Nome (Mat: 12345)"
        const partesNome = e.usuario.split(' (Mat: ');
        const nomeCurto = partesNome[0];
        const matricula = partesNome[1] ? partesNome[1].replace(')', '') : 'N/A';
        const gerencia = e.gerencia || 'Não Informada';
        
        // Usamos a matrícula e o nome como chave única para não misturar pessoas com o mesmo nome
        const chaveUnica = `${matricula}-${nomeCurto}`;
        
        if (!contagem[chaveUnica]) {
          contagem[chaveUnica] = { nomeCurto, matricula, gerencia, quantidade: 0 };
        }
        
        contagem[chaveUnica].quantidade += (Number(e.quantidade) || 0);
      });
    
    return Object.values(contagem)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [emprestimos]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Users className="size-5 text-red-500" />
        <CardTitle className="text-lg">Ranking de Retenção (Acumuladores)</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {dadosRanking.length === 0 ? (
           <div className="h-full flex items-center justify-center text-gray-400 italic">Nenhum item retido no momento</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosRanking} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              
              {/* O Eixo Y volta a mostrar apenas o Nome Curto */}
              <YAxis 
                dataKey="nomeCurto" 
                type="category" 
                width={120} 
                tick={{ fontSize: 12 }} 
              />
              
              {/* Injetamos o nosso Balão Personalizado aqui */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              
              <Bar dataKey="quantidade" fill="#ef4444" radius={[0, 4, 4, 0]} name="Unidades" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}