import React, { useState, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Printer, Sheet, CalendarDays } from 'lucide-react';
import { useEmprestimos } from '../../contexts/EmprestimosContext';
import { useMateriais } from '../../contexts/MateriaisContext';
import { exportarGraficoExcel, gerarDadosConsolidadosDashboard } from './utils/dashboardExport';

import { CardsResumo } from './components/CardsResumo';
import { GraficoGerencia } from './components/GraficoGerencia';
import { GraficoTotalPorGerencia } from './components/GraficoTotalPorGerencia';
import { GraficoRankingFuncionarios } from './components/GraficoRankingFuncionarios';
import { GraficoDevolucao } from './components/GraficoDevolucao';
import { GraficoEnvelhecimento } from './components/GraficoEnvelhecimento';
import { GraficoTopItens } from './components/GraficoTopItens';
import { PainelEstoqueCritico } from './components/PainelEstoqueCritico';
import { GraficoFluxoDiario } from './components/GraficoFluxoDiario';
import { GraficoMapaCalor } from './components/GraficoMapaCalor';
import { GraficoCategoria } from './components/GraficoCategoria';

export function Dashboard() {
  const { emprestimos } = useEmprestimos();
  const { materiais } = useMateriais();

  // 1. Estado atualizado apenas com as opções desejadas
  const [filtroTempo, setFiltroTempo] = useState<'todos' | '30dias' | '6meses' | '12meses'>('todos');

  // FUNÇÃO AUXILIAR: Verifica se uma data está no intervalo selecionado
  const estaNoIntervalo = (dataString: string | null | undefined, filtro: string) => {
    if (!dataString) return false;
    const data = new Date(dataString);
    const hoje = new Date();

    if (filtro === '30dias') {
      const limite = new Date();
      limite.setDate(hoje.getDate() - 30);
      return data >= limite;
    }
    if (filtro === '6meses') {
      const limite = new Date();
      limite.setMonth(hoje.getMonth() - 6);
      return data >= limite;
    }
    // 2. Nova lógica para os 12 meses (1 ano para trás)
    if (filtro === '12meses') {
      const limite = new Date();
      limite.setFullYear(hoje.getFullYear() - 1);
      return data >= limite;
    }
    return true; // Para 'todos'
  };

  const emprestimosFiltrados = useMemo(() => {
    if (filtroTempo === 'todos') return emprestimos;

    return emprestimos.filter(emp => {
      // O registro aparece se a SAÍDA foi no período OU a DEVOLUÇÃO foi no período
      const saiuNoPeriodo = estaNoIntervalo(emp.data_saida, filtroTempo);
      const devolveuNoPeriodo = estaNoIntervalo(emp.data_devolucao, filtroTempo);

      return saiuNoPeriodo || devolveuNoPeriodo;
    });
  }, [emprestimos, filtroTempo]);

  const dadosConsolidados = gerarDadosConsolidadosDashboard(emprestimosFiltrados, materiais);

  return (
    <div id="dashboard-completo" className="space-y-6 pb-12 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Painel de Controle</h2>
          <p className="text-gray-500 text-sm">Monitorização de estoque e movimentações</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <CalendarDays className="size-4 text-blue-600" />
            {/* 3. Menu limpo com as novas opções visuais */}
            <select 
              value={filtroTempo}
              onChange={(e) => setFiltroTempo(e.target.value as any)}
              className="bg-transparent border-none text-sm font-semibold focus:ring-0 outline-none cursor-pointer text-gray-700"
            >
              <option value="todos">Histórico Completo</option>
              <option value="30dias">Últimos 30 Dias</option>
              <option value="6meses">Últimos 6 Meses</option>
              <option value="12meses">Últimos 12 Meses</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="h-9">
            <Printer className="size-4 mr-2" /> Imprimir Tudo
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportarGraficoExcel('Relatorio_Geral', dadosConsolidados)} className="h-9 text-green-700 border-green-200 hover:bg-green-50">
            <Sheet className="size-4 mr-2" /> Excel Geral
          </Button>
        </div>
      </div>

      <CardsResumo emprestimosFiltrados={emprestimosFiltrados} emprestimosTotais={emprestimos} materiais={materiais} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoGerencia emprestimos={emprestimosFiltrados} />
        <GraficoTotalPorGerencia /> 
        
        <GraficoRankingFuncionarios emprestimos={emprestimosFiltrados} />
        <GraficoDevolucao emprestimos={emprestimosFiltrados} />
        
        <GraficoEnvelhecimento emprestimos={emprestimos} />
        <PainelEstoqueCritico /> 
        
        <div className="lg:col-span-2">
            <GraficoFluxoDiario emprestimos={emprestimosFiltrados} />
        </div>
        
        <div className="lg:col-span-2">
            <GraficoTopItens emprestimos={emprestimosFiltrados} />
        </div>
        
        <GraficoMapaCalor emprestimos={emprestimosFiltrados} />
        <GraficoCategoria emprestimos={emprestimosFiltrados} />
      </div>
    </div>
  );
}