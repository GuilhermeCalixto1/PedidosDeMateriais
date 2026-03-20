import React, { useMemo } from 'react';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { useConfiguracoes } from '../../../contexts/ConfiguracoesContext'; // <-- NOVO IMPORT
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Package, Wrench, AlertCircle, Clock } from 'lucide-react';

export function CardsResumo() {
  const { materiais } = useMateriais();
  const { emprestimos } = useEmprestimos();
  const { configuracoes } = useConfiguracoes(); // <-- PUXANDO OS LIMITES DAQUI

  const stats = useMemo(() => {
    const estoqueDisponivel = materiais.reduce((acc, curr) => acc + curr.quantidade, 0);
    const unidadesEmprestadas = emprestimos
      .filter(e => e.status === 'Pendente')
      .reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

    const estoqueTotal = estoqueDisponivel + unidadesEmprestadas;
    const emprestimosAtivos = emprestimos.filter(e => e.status === 'Pendente').length;

    return { estoqueDisponivel, unidadesEmprestadas, estoqueTotal, emprestimosAtivos };
  }, [materiais, emprestimos]);

  // Usamos a variável dinâmica em vez do número 15 fixo
  const emCargaAlta = stats.emprestimosAtivos >= configuracoes.limiteCargaAlta;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="bg-white shadow-sm border-t-4 border-t-blue-600">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Patrimônio Total</CardTitle>
          <Package className="size-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.estoqueTotal}</div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Na empresa</p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-t-4 border-t-green-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Estoque Disponível</CardTitle>
          <Package className="size-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{stats.estoqueDisponivel}</div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Pronto a usar</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm border-t-4 border-t-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Em Uso (Fora)</CardTitle>
          <Clock className="size-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{stats.unidadesEmprestadas}</div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Unidades emprestadas</p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Modelos de Itens</CardTitle>
          <Wrench className="size-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{materiais.length}</div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Cadastrados</p>
        </CardContent>
      </Card>

      {/* CARTÃO DINÂMICO DE FLUXO DE PEDIDOS */}
      <Card className={`shadow-sm ${emCargaAlta ? 'bg-red-50' : 'bg-white'}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Fluxo de Pedidos</CardTitle>
          <AlertCircle className={`size-4 ${emCargaAlta ? 'text-red-500' : 'text-gray-400'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${emCargaAlta ? 'text-red-700' : 'text-green-600'}`}>
            {emCargaAlta ? 'Carga Alta' : 'Estável'}
          </div>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">
            {stats.emprestimosAtivos} / {configuracoes.limiteCargaAlta} cartões
          </p>
        </CardContent>
      </Card>
    </div>
  );
}