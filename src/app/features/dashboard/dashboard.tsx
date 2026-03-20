import React from 'react';
import { Button } from '../../components/ui/button';
import { Mail, Printer, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { useEmprestimos } from '../../contexts/EmprestimosContext';
import { useMateriais } from '../../contexts/MateriaisContext';
import { enviarGraficoPorEmail, exportarGraficoExcel, gerarDadosConsolidadosDashboard } from './utils/dashboardExport';

// Importação dos seus 10 componentes especializados de Inteligência de Negócio
import { CardsResumo } from './components/CardsResumo';
import { GraficoGerencia } from './components/GraficoGerencia';
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            title="Imprimir dashboard completo"
          >
            <Printer className="size-4 mr-1" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              exportarGraficoExcel('Dashboard_Consolidado', dadosConsolidados);
              toast.success('Consolidado da dashboard exportado para Excel.');
            }}
            title="Exportar dashboard consolidado"
          >
            <Sheet className="size-4 mr-1" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              enviarGraficoPorEmail('Dashboard Consolidado', dadosConsolidados);
              toast.info('Cliente de e-mail aberto com resumo da dashboard.');
            }}
            title="Enviar resumo por e-mail"
          >
            <Mail className="size-4 mr-1" />
            E-mail
          </Button>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPAIS (Os 5 cartões do topo) */}
      <CardsResumo />

      {/* GRELHA DE INTELIGÊNCIA DE NEGÓCIO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LINHA 1: Análise de Pessoas e Setores */}
        <GraficoGerencia />
        <GraficoRankingFuncionarios />
        
        {/* LINHA 2: Análise de Retenção e Prazos */}
        <GraficoDevolucao />
        <GraficoEnvelhecimento />
        
        {/* LINHA 3: Análise de Materiais Mais Usados vs Faltas Críticas */}
        <GraficoTopItens />
        <PainelEstoqueCritico />
        
        {/* LINHA 4: Análise Temporal Contínua (Ocupa as 2 colunas) */}
        <GraficoFluxoDiario />

        {/* LINHA 5: Análise de Sazonalidade e Famílias de Materiais */}
        <GraficoMapaCalor />
        <GraficoCategoria />
        
      </div>
    </div>
  );
}