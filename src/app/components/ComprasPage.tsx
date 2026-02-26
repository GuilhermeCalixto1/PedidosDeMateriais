import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePedidos } from '../contexts/PedidosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Pedido } from '../contexts/PedidosContext';

export function ComprasPage() {
  const { user, logout } = useAuth();
  const { pedidos, aprovarPedido, rejeitarPedido } = usePedidos();
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'aprovado' | 'rejeitado'>('todos');

  const pedidosFiltrados = filtro === 'todos' 
    ? pedidos 
    : pedidos.filter(p => p.status === filtro);

  const contadores = {
    pendente: pedidos.filter(p => p.status === 'pendente').length,
    aprovado: pedidos.filter(p => p.status === 'aprovado').length,
    rejeitado: pedidos.filter(p => p.status === 'rejeitado').length,
  };

  const getStatusBadge = (status: Pedido['status']) => {
    const variants = {
      pendente: 'default',
      aprovado: 'default',
      rejeitado: 'destructive',
    } as const;

    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado',
    };

    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      aprovado: 'bg-green-100 text-green-800 hover:bg-green-100',
      rejeitado: '',
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Package className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Gestão de Compras</h1>
                <p className="text-sm text-gray-600">{user?.nome}</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="size-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl mb-2">Pedidos de Materiais</h2>
          <p className="text-gray-600">
            Visualize e gerencie todos os pedidos de materiais da empresa
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Pendentes</CardDescription>
                <Clock className="size-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{contadores.pendente}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Aprovados</CardDescription>
                <CheckCircle className="size-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{contadores.aprovado}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription>Rejeitados</CardDescription>
                <XCircle className="size-4 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl">{contadores.rejeitado}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos ({pedidos.length})</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes ({contadores.pendente})</TabsTrigger>
            <TabsTrigger value="aprovado">Aprovados ({contadores.aprovado})</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados ({contadores.rejeitado})</TabsTrigger>
          </TabsList>

          <TabsContent value={filtro} className="mt-0">
            {pedidosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="size-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600">
                    Não há pedidos {filtro !== 'todos' && `com status "${filtro}"`} no momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pedidosFiltrados.map((pedido) => (
                  <Card key={pedido.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle>{pedido.material}</CardTitle>
                            {getStatusBadge(pedido.status)}
                          </div>
                          <CardDescription>
                            Quantidade: {pedido.quantidade} • Solicitado por: {pedido.solicitante} • {new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        {pedido.status === 'pendente' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => aprovarPedido(pedido.id)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="size-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejeitarPedido(pedido.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircle className="size-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {pedido.descricao && (
                      <CardContent>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600">{pedido.descricao}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
