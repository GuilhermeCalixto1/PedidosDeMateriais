import React, { useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Package, Wrench, AlertTriangle, Layers } from 'lucide-react';
import { Emprestimo, Material } from '../../../types';

interface CardsResumoProps {
  emprestimosFiltrados: Emprestimo[];
  emprestimosTotais: Emprestimo[];
  materiais: Material[];
}

export function CardsResumo({ emprestimosFiltrados, emprestimosTotais, materiais }: CardsResumoProps) {
  
  const metricas = useMemo(() => {
    // Pegamos TUDO o que está pendente hoje, independentemente da data de saída
    const pendentesGerais = emprestimosTotais.filter(e => e.status === 'Pendente');
    
    // 1. Ferramentas que estão na Rua
    let ferramentasNaRua = 0;
    pendentesGerais.forEach(e => ferramentasNaRua += (Number(e.quantidade) || 0));

    // 2. Patrimônio Total (Prateleira + Rua)
    let ferramentasNaPrateleira = 0;
    materiais.forEach(m => ferramentasNaPrateleira += (Number(m.quantidade) || 0));
    const patrimonioTotal = ferramentasNaPrateleira + ferramentasNaRua;

    // 3. Alertas de Atraso (>7 dias na rua)
    const atrasados = pendentesGerais.filter(e => {
      if (!e.data_saida) return false;
      const dias = (new Date().getTime() - new Date(e.data_saida).getTime()) / (1000 * 3600 * 24);
      return dias > 7;
    });

    // 4. Devoluções do Período (Aqui sim usamos o filtro da "Máquina do Tempo")
    const devolvidosNoPeriodo = emprestimosFiltrados.filter(e => e.status === 'Devolvido').length;

    return {
      patrimonioTotal,
      ferramentasNaRua,
      devolucoesConcluidas: devolvidosNoPeriodo,
      alertasAtraso: atrasados.length
    };
  }, [emprestimosFiltrados, emprestimosTotais, materiais]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: O Patrimônio Total que tinha sumido! */}
      <Card className="bg-white border-l-4 border-l-blue-600 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Patrimônio Total (Unid.)</p>
            <h3 className="text-2xl font-bold text-gray-900">{metricas.patrimonioTotal}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full"><Layers className="size-5 text-blue-600" /></div>
        </CardContent>
      </Card>

      {/* CARD 2: Ferramentas na Rua */}
      <Card className="bg-white border-l-4 border-l-orange-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Na Rua Agora</p>
            <h3 className="text-2xl font-bold text-gray-900">{metricas.ferramentasNaRua}</h3>
          </div>
          <div className="p-3 bg-orange-50 rounded-full"><Wrench className="size-5 text-orange-600" /></div>
        </CardContent>
      </Card>

      {/* CARD 3: Devoluções no Período Filtrado */}
      <Card className="bg-white border-l-4 border-l-emerald-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Devoluções (Período)</p>
            <h3 className="text-2xl font-bold text-gray-900">{metricas.devolucoesConcluidas}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full"><Package className="size-5 text-emerald-600" /></div>
        </CardContent>
      </Card>

      {/* CARD 4: Alertas */}
      <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Alertas de Atraso (&gt;7 dias)</p>
            <h3 className="text-2xl font-bold text-gray-900">{metricas.alertasAtraso}</h3>
          </div>
          <div className="p-3 bg-red-50 rounded-full"><AlertTriangle className="size-5 text-red-600" /></div>
        </CardContent>
      </Card>
    </div>
  );
}