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
      return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200"><Zap className="size-3 mr-1" /> Elétrico</Badge>;
    }
    return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200"><Wrench className="size-3 mr-1" /> Mecânico</Badge>;
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
                {/* 3 NOVAS COLUNAS CLARAS */}
                <TableHead className="text-center bg-gray-100/50">Patrimônio Total</TableHead>
                <TableHead className="text-center bg-yellow-50/50">Em Uso (Fora)</TableHead>
                <TableHead className="text-center bg-green-50/50">Disponível (Prateleira)</TableHead>
                
                <TableHead className="text-center w-[180px] print:hidden">Ajuste Disponível</TableHead>
                <TableHead className="text-right print:hidden">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materiais.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.nome}</TableCell>
                  <TableCell>{getCategoriaBadge(material.categoria)}</TableCell>
                  
                  {/* COLUNA: TOTAL */}
                  <TableCell className="text-center font-bold text-gray-700 bg-gray-50/30">
                    {material.total}
                  </TableCell>
                  
                  {/* COLUNA: EM USO */}
                  <TableCell className="text-center font-bold text-yellow-600 bg-yellow-50/30">
                    {material.emUso > 0 ? material.emUso : '-'}
                  </TableCell>

                  {/* COLUNA: DISPONIVEL (Prateleira) */}
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`text-sm px-3 py-1 ${material.quantidade === 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                      {material.quantidade}
                    </Badge>
                  </TableCell>

                  {/* AJUSTE MANUAL (Apenas do Disponível) */}
                  <TableCell className="print:hidden">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" size="icon" className="h-7 w-7 rounded-full text-red-600 hover:bg-red-50"
                        onClick={() => onAtualizarQuantidade(material.id, material.quantidade - 1)}
                        disabled={material.quantidade <= 0}
                      >
                        <Minus className="size-3" />
                      </Button>
                      
                      <Button 
                        variant="outline" size="icon" className="h-7 w-7 rounded-full text-blue-600 hover:bg-blue-50"
                        onClick={() => onAtualizarQuantidade(material.id, material.quantidade + 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right print:hidden">
                    <Button variant="ghost" size="icon" onClick={() => onExcluir(material.id, material.nome)} className="hover:bg-red-50">
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