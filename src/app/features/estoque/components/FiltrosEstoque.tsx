import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Search } from 'lucide-react';

interface FiltrosEstoqueProps {
  buscaTexto: string;
  setBuscaTexto: (texto: string) => void;
  filtroCategoria: 'todas' | 'mecanico' | 'eletrico';
  setFiltroCategoria: (categoria: 'todas' | 'mecanico' | 'eletrico') => void;
}

export function FiltrosEstoque({
  buscaTexto,
  setBuscaTexto,
  filtroCategoria,
  setFiltroCategoria
}: FiltrosEstoqueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="busca">Buscar por Nome</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                id="busca"
                placeholder="Ex: Alicate, Furadeira..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Filtrar por Categoria</Label>
            <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Categorias</SelectItem>
                <SelectItem value="mecanico">Mecânico</SelectItem>
                <SelectItem value="eletrico">Elétrico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}