import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Search, Calendar, Filter } from 'lucide-react';

// Aqui definimos tudo o que o componente pai precisa enviar para este filho
interface FiltrosEmprestimoProps {
  buscaTexto: string;
  setBuscaTexto: (texto: string) => void;
  filtroDataInicio: string;
  setFiltroDataInicio: (data: string) => void;
  filtroDataFim: string;
  setFiltroDataFim: (data: string) => void;
  filtroGerencia: string;
  setFiltroGerencia: (gerencia: string) => void;
  filtroCategoria: string;
  setFiltroCategoria: (categoria: string) => void;
  temFiltroAtivo: boolean;
  limparFiltros: () => void;
}

export function FiltrosEmprestimo({
  buscaTexto, setBuscaTexto,
  filtroDataInicio, setFiltroDataInicio,
  filtroDataFim, setFiltroDataFim,
  filtroGerencia, setFiltroGerencia,
  filtroCategoria, setFiltroCategoria,
  temFiltroAtivo, limparFiltros
}: FiltrosEmprestimoProps) {
  
  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Filter className="size-5 text-blue-600" />
          <CardTitle className="text-lg">Filtros de Busca</CardTitle>
        </div>
        <CardDescription>Refine a sua lista combinando os filtros abaixo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="busca">Funcionário, Matrícula ou Ferramenta</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input id="busca" placeholder="Digite aqui..." value={buscaTexto} onChange={(e) => setBuscaTexto(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Período de Saída</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="pl-10" />
              </div>
              <span className="text-sm font-medium text-gray-500">até</span>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="gerencia">Filtrar por Gerência</Label>
            <Input id="gerencia" placeholder="Ex: Manutenção, Produção..." value={filtroGerencia} onChange={(e) => setFiltroGerencia(e.target.value)} />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="categoria">Filtrar por Categoria</Label>
            <select
              id="categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="mecanico">Mecânico</option>
              <option value="eletrico">Elétrico</option>
            </select>
          </div>

        </div>

        {temFiltroAtivo && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={limparFiltros}>Limpar Todos os Filtros</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}