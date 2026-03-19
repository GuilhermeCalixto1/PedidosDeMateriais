import React, { useMemo, useState } from 'react';
import { useMateriais } from '../../contexts/MateriaisContext';
import { useEmprestimos } from '../../contexts/EmprestimosContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Package, Wrench, AlertCircle, Clock, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export function Dashboard() {
  const { materiais } = useMateriais();
  const { emprestimos } = useEmprestimos();

  const [periodoStatus, setPeriodoStatus] = useState('total');

  // 1. Cálculos de Estoque Corrigidos
  const stats = useMemo(() => {
    // 1.1. Estoque Disponível: A soma do que está fisicamente nas prateleiras
    const estoqueDisponivel = materiais.reduce((acc, curr) => acc + curr.quantidade, 0);

    // 1.2. Unidades Emprestadas: A soma das quantidades que estão em posse dos funcionários
    const unidadesEmprestadas = emprestimos
      .filter(e => e.status === 'Pendente')
      .reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

    // 1.3. Patrimônio Total: O que a empresa possui no total (Prateleira + Fora)
    const estoqueTotal = estoqueDisponivel + unidadesEmprestadas;

    // Outros dados mantidos
    const emprestimosAtivos = emprestimos.filter(e => e.status === 'Pendente').length;
    const ferramentasEletricas = materiais.filter(m => m.categoria === 'eletrico').length;
    const ferramentasMecanicas = materiais.filter(m => m.categoria === 'mecanico').length;

    return { 
      estoqueDisponivel, 
      unidadesEmprestadas, 
      estoqueTotal, 
      emprestimosAtivos, 
      ferramentasEletricas, 
      ferramentasMecanicas 
    };
  }, [materiais, emprestimos]);

  // 2. Dados: Materiais em Posse por Gerência (Ativos)
  const dadosPorGerencia = useMemo(() => {
    const distribuicao: Record<string, number> = {};
    emprestimos
      .filter(e => e.status === 'Pendente')
      .forEach(e => {
        const g = e.gerencia || 'Não Informada';
        const qtd = Number(e.quantidade) || 0;
        distribuicao[g] = (distribuicao[g] || 0) + qtd;
      });
    
    return Object.entries(distribuicao)
      .map(([nome, unidades]) => ({ nome, unidades }))
      .sort((a, b) => b.unidades - a.unidades);
  }, [emprestimos]);

  // 3. DADOS COM FILTRO: Pendentes vs Devolvidos (Unidades)
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

  // 4. Dados: Top 5 Itens Mais Retirados (Soma de unidades históricas)
  const dadosTopEmprestimos = useMemo(() => {
    const contagem: Record<string, number> = {};
    emprestimos.forEach(e => {
      const qtd = Number(e.quantidade) || 0;
      contagem[e.materialSolicitado] = (contagem[e.materialSolicitado] || 0) + qtd;
    });
    
    return Object.entries(contagem)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [emprestimos]);

  // 5. Dados: Distribuição por Categoria
  const dadosCategorias = [
    { name: 'Mecânico', value: stats.ferramentasMecanicas },
    { name: 'Elétrico', value: stats.ferramentasEletricas }
  ];
  const CORES_CATEGORIAS = ['#f97316', '#a855f7'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Visão Geral</h2>
        <p className="text-gray-600 mt-1">Indicadores de desempenho e controle de estoque</p>
      </div>

      {/* CARDS DE RESUMO - Agora com 5 colunas para separar os dados */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* NOVO: PATRIMÔNIO TOTAL */}
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

        {/* CORRIGIDO: ESTOQUE DISPONÍVEL */}
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
        
        {/* NOVO: EM USO (FORA) */}
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

        {/* MODELOS CADASTRADOS */}
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

        {/* STATUS OPERACIONAL */}
        <Card className={`shadow-sm ${stats.emprestimosAtivos > 15 ? 'bg-red-50' : 'bg-white'}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fluxo de Pedidos</CardTitle>
            <AlertCircle className={`size-4 ${stats.emprestimosAtivos > 15 ? 'text-red-500' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.emprestimosAtivos > 15 ? 'text-red-700' : 'text-green-600'}`}>
              {stats.emprestimosAtivos > 15 ? 'Carga Alta' : 'Estável'}
            </div>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">{stats.emprestimosAtivos} cartões abertos</p>
          </CardContent>
        </Card>
      </div>

      {/* ÁREA DOS GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. MATERIAIS COM A GERÊNCIA (PENDENTES) */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="size-5 text-emerald-600" />
            <CardTitle className="text-lg">Materiais em Posse por Gerência (Ativos)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {dadosPorGerencia.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 italic">Nenhum material emprestado no momento</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosPorGerencia} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value) => [`${value} unidades`, 'Atualmente com a Gerência']} />
                  <Bar dataKey="unidades" fill="#10b981" radius={[4, 4, 0, 0]} name="Unidades" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 2. GRÁFICO: STATUS DE DEVOLUÇÕES COM FILTRO */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-start sm:items-center justify-between gap-2 pb-2">
            <CardTitle className="text-lg">Taxa de Devolução (Unidades)</CardTitle>
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
          </CardHeader>
          <CardContent className="h-80">
            {dadosStatus.every(d => d.value === 0) ? (
              <div className="h-full flex items-center justify-center text-gray-400 italic">Sem registros de saída neste período</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_STATUS[index % CORES_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Quantidade']} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 3. TOP 5 UNIDADES HISTÓRICAS */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top 5: Mais Emprestados (Geral)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {dadosTopEmprestimos.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 italic">Sem dados de movimentação</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosTopEmprestimos} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} unidades`, 'Total Saídas']} />
                  <Bar dataKey="quantidade" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}