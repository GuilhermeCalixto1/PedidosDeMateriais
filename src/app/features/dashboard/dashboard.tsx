import React from 'react';
import { Button } from '../../components/ui/button';
import { Mail, Printer, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { useEmprestimos } from '../../contexts/EmprestimosContext';
import { useMateriais } from '../../contexts/MateriaisContext';
import { enviarGraficoPorEmail, exportarGraficoExcel, gerarDadosConsolidadosDashboard } from './utils/dashboardExport';

// Importação dos componentes
import { CardsResumo } from './components/CardsResumo';
import { GraficoGerencia } from './components/GraficoGerencia';
import { GraficoTotalPorGerencia } from './components/GraficoTotalPorGerencia'; // <-- NOVO IMPORT
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

  const dadosConsolidados = gerarDadosConsolidadosDashboard(emprestimos, materiais);

  return (
    <div id="dashboard-completo" className="space-y-6 pb-12">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Visão Geral</h2>
          <p className="text-gray-600 mt-1">Indicadores de desempenho e controle de estoque</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()} title="Imprimir dashboard">
            <Printer className="size-4 mr-1" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
              exportarGraficoExcel('Dashboard_Consolidado', dadosConsolidados);
              toast.success('Consolidado da dashboard exportado.');
            }} title="Exportar dashboard">
            <Sheet className="size-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
              enviarGraficoPorEmail('Dashboard Consolidado', dadosConsolidados);
              toast.info('Cliente de e-mail aberto.');
            }}>
            <Mail className="size-4 mr-1" /> E-mail
          </Button>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS */}
      <CardsResumo />

      {/* GRELHA DE INTELIGÊNCIA DE NEGÓCIO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LINHA 1: Análise de Setores (Comparação de Ativos vs Histórico) */}
        <GraficoGerencia />
        <GraficoTotalPorGerencia />
        
        {/* LINHA 2: Análise de Pessoas e Retenção */}
        <GraficoRankingFuncionarios />
        <GraficoDevolucao />
        
        {/* LINHA 3: Prazos e Materiais Críticos */}
        <GraficoEnvelhecimento />
        <PainelEstoqueCritico />
        
        {/* LINHA 4: Top Itens (Ocupa 2 colunas para ficar maior) */}
        <div className="lg:col-span-2">
          <GraficoTopItens />
        </div>
        
        {/* LINHA 5: Análise Temporal Contínua (Ocupa as 2 colunas) */}
        <div className="lg:col-span-2">
          <GraficoFluxoDiario />
        </div>

        {/* LINHA 6: Análise de Sazonalidade e Famílias de Materiais */}
        <GraficoMapaCalor />
        <GraficoCategoria />
        
      </div>
    </div>
  );
}