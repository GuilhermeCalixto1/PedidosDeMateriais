import React from 'react';
import { CardsResumo } from './components/CardsResumo';
import { GraficoGerencia } from './components/GraficoGerencia';
import { GraficoDevolucao } from './components/GraficoDevolucao';
import { GraficoTopItens } from './components/GraficoTopItens';
import { GraficoFluxoDiario } from './components/GraficoFluxoDiario';

export function Dashboard() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-semibold">Visão Geral</h2>
        <p className="text-gray-600 mt-1">Indicadores de desempenho e controle de estoque</p>
      </div>

      {/* Os 5 Cartões do Topo */}
      <CardsResumo />

      {/* Grelha de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoGerencia />
        <GraficoDevolucao />
        <GraficoTopItens />
        <GraficoFluxoDiario />
      </div>
    </div>
  );
}