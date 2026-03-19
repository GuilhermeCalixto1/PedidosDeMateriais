import React from 'react';
import { CardsResumo } from './components/CardsResumo';
import { GraficoGerencia } from './components/GraficoGerencia';
import { GraficoRankingFuncionarios } from './components/GraficoRankingFuncionarios';
import { GraficoDevolucao } from './components/GraficoDevolucao';
import { GraficoEnvelhecimento } from './components/GraficoEnvelhecimento';
import { GraficoTopItens } from './components/GraficoTopItens';
import { PainelEstoqueCritico } from './components/PainelEstoqueCritico';
import { GraficoFluxoDiario } from './components/GraficoFluxoDiario';
import { GraficoMapaCalor } from './components/GraficoMapaCalor'; // <-- NOVO IMPORT

export function Dashboard() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-semibold">Visão Geral</h2>
        <p className="text-gray-600 mt-1">Indicadores de desempenho e controle de estoque</p>
      </div>

      <CardsResumo />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LINHA 1 */}
        <GraficoGerencia />
        <GraficoRankingFuncionarios />
        
        {/* LINHA 2 */}
        <GraficoDevolucao />
        <GraficoEnvelhecimento />
        
        {/* LINHA 3 */}
        <GraficoTopItens />
        <PainelEstoqueCritico />
        
        {/* LINHA 4 (Gráfico de Linha Esticado) */}
        <GraficoFluxoDiario />

        {/* LINHA 5 (Nova linha para o Mapa de Calor e o próximo gráfico) */}
        <GraficoMapaCalor /> {/* <-- COMPONENTE ENCAIXADO AQUI */}
        
        <div className="hidden lg:block">
          {/* Espaço reservado para fechar o Dashboard com a "Demanda Histórica por Categoria" */}
        </div>
      </div>
    </div>
  );
}