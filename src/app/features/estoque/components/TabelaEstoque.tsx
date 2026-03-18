import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Loader2, Package, Trash2, Plus, Minus, Wrench, Zap } from 'lucide-react';

interface TabelaEstoqueProps {
  materiais: any[];
  carregando: boolean;
  onAtualizarQuantidade: (id: string, novaQuantidade: number) => void;
  onExcluir: (id: string, nome: string) => void;
}

export function TabelaEstoque({ materiais, carregando, onAtualizarQuantidade, onExcluir }: TabelaEstoqueProps) {
  
  const getCategoriaBadge = (categoria: 'mecanico' | 'eletrico') => {
    if (categoria === 'eletrico') {
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          <Zap className="size-3 mr-1" /> Elétrico
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
        <Wrench className="size-3 mr-1" /> Mecânico
      </Badge>
    );
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-hidden">
        {carregando ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Sincronizando com banco de dados...</span>
          </div>
        ) : materiais.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Package className="size-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum material encontrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Nome da Ferramenta</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center w-[200px]">Ajuste de Estoque</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materiais.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.nome}</TableCell>
                  <TableCell>{getCategoriaBadge(material.categoria)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => onAtualizarQuantidade(material.id, material.quantidade - 1)}
                        disabled={material.quantidade <= 0}
                      >
                        <Minus className="size-4" />
                      </Button>
                      
                      <div className="min-w-[40px] text-center">
                        <span className={`text-lg font-bold ${material.quantidade === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                          {material.quantidade}
                        </span>
                      </div>

                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => onAtualizarQuantidade(material.id, material.quantidade + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onExcluir(material.id, material.nome)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}