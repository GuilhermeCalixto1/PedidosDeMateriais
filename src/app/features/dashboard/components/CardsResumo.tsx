import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Package, AlertTriangle, ClipboardList, Boxes, Wallet } from 'lucide-react';

interface CardsResumoProps {
  emprestimosFiltrados: any[];
  emprestimosTotais: any[];
  materiais: any[];
}

export function CardsResumo({ emprestimosFiltrados, emprestimosTotais, materiais }: CardsResumoProps) {
  
  const stats = useMemo(() => {
    // 1. Empréstimos Ativos (Unidades que estão na rua agora)
    const ativos = emprestimosTotais
      .filter(e => e.status === 'Pendente')
      .reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

    // 2. Estoque Disponível (Soma de todas as unidades físicas em prateleira)
    const disponivel = materiais.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

    // 3. Patrimônio Total (Tudo o que a empresa possui: Disponível + Emprestado)
    const patrimonioTotal = disponivel + ativos;

    // 4. Materiais Cadastrados (Quantidade de modelos/tipos diferentes no inventário)
    const totalTipos = materiais.length;

    // 5. Itens em Alerta (Estoque abaixo do mínimo)
    const alertas = materiais.filter(m => m.quantidade <= (m.quantidade_minima || 5)).length;

    return { ativos, disponivel, patrimonioTotal, totalTipos, alertas };
  }, [emprestimosTotais, materiais]);

  return (
    // Ajustei a grid para suportar 5 colunas em telas grandes (lg:grid-cols-5)
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      
      {/* CARD 1: Patrimônio Total (NOVO) */}
      <Card className="shadow-sm border-l-4 border-l-black bg-orange-50/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Patrimônio Total</CardTitle>
          <Wallet className="size-4 text-black" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">{stats.patrimonioTotal}</div>
          <p className="text-xs text-gray-500 mt-1">Total de ativos da empresa</p>
        </CardContent>
      </Card>

      {/* CARD 2: Estoque Disponível */}
      <Card className="shadow-sm border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Disponível</CardTitle>
          <Boxes className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.disponivel}</div>
          <p className="text-xs text-gray-500 mt-1">Unidades em prateleira</p>
        </CardContent>
      </Card>

      {/* CARD 3: Empréstimos Ativos */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
          <ClipboardList className="size-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ativos}</div>
          <p className="text-xs text-gray-500 mt-1">Unidades em uso externo</p>
        </CardContent>
      </Card>

      {/* CARD 4: Itens no Inventário */}
      <Card className="shadow-sm border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Modelos no Catálogo</CardTitle>
          <Package className="size-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTipos}</div>
          <p className="text-xs text-gray-500 mt-1">Tipos de ferramentas</p>
        </CardContent>
      </Card>

      {/* CARD 5: Itens em Alerta */}
      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atenção ao Estoque</CardTitle>
          <AlertTriangle className="size-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.alertas}</div>
          <p className="text-xs text-gray-500 mt-1">Abaixo do nível mínimo</p>
        </CardContent>
      </Card>

    </div>
  );
}