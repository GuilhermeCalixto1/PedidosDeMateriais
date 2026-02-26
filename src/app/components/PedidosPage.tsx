import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePedidos } from '../contexts/PedidosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Plus, Pencil, Trash2, Package, Zap, Wrench } from 'lucide-react';
import { PedidoForm } from './PedidoForm';
import type { Pedido } from '../contexts/PedidosContext';

export function PedidosPage() {
  const { user, logout } = useAuth();
  const { pedidos, excluirPedido } = usePedidos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'pendente' | 'aprovado-nao-entregue' | 'entregue' | 'rejeitado'>('todos');

  // Filtrar apenas pedidos do usuário atual
  const meusPedidos = pedidos.filter(p => p.solicitanteId === user?.id);

  // Aplicar filtro de status
  const pedidosFiltrados = (() => {
    if (filtro === 'todos') return meusPedidos;
    if (filtro === 'aprovado-nao-entregue') return meusPedidos.filter(p => p.status === 'aprovado' && !p.entregue);
    if (filtro === 'entregue') return meusPedidos.filter(p => p.status === 'aprovado' && p.entregue);
    return meusPedidos.filter(p => p.status === filtro);
  })();

  const contadores = {
    pendente: meusPedidos.filter(p => p.status === 'pendente').length,
    aprovadoNaoEntregue: meusPedidos.filter(p => p.status === 'aprovado' && !p.entregue).length,
    entregue: meusPedidos.filter(p => p.status === 'aprovado' && p.entregue).length,
    rejeitado: meusPedidos.filter(p => p.status === 'rejeitado').length,
  };

  const handleEditar = (pedido: Pedido) => {
    setPedidoEditando(pedido);
    setMostrarFormulario(true);
  };

  const handleNovoPedido = () => {
    setPedidoEditando(null);
    setMostrarFormulario(true);
  };

  const handleFecharFormulario = () => {
    setMostrarFormulario(false);
    setPedidoEditando(null);
  };

  const getStatusBadge = (pedido: Pedido) => {
    if (pedido.status === 'aprovado' && pedido.entregue) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          Entregue
        </Badge>
      );
    }

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
      <Badge variant={variants[pedido.status]} className={colors[pedido.status]}>
        {labels[pedido.status]}
      </Badge>
    );
  };

  const getCategoriaBadge = (categoria: 'eletrico' | 'mecanico') => {
    const config = {
      eletrico: {
        icon: Zap,
        label: 'Elétrico',
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      },
      mecanico: {
        icon: Wrench,
        label: 'Mecânico',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      },
    };

    // Fallback para categoria inválida ou undefined
    const categoriaValida = categoria || 'mecanico';
    const { icon: Icon, label, className } = config[categoriaValida];

    return (
      <Badge variant="outline" className={className}>
        <Icon className="size-3 mr-1" />
        {label}
      </Badge>
    );
  };

  if (mostrarFormulario) {
    return (
      <PedidoForm
        pedido={pedidoEditando}
        onFechar={handleFecharFormulario}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl">Meus Pedidos</h1>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl">Pedidos de Materiais</h2>
            <p className="text-gray-600 mt-1">
              Gerencie seus pedidos de ferramentas e materiais
            </p>
          </div>
          <Button onClick={handleNovoPedido}>
            <Plus className="size-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as typeof filtro)} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos ({meusPedidos.length})</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes ({contadores.pendente})</TabsTrigger>
            <TabsTrigger value="aprovado-nao-entregue">Aprovados ({contadores.aprovadoNaoEntregue})</TabsTrigger>
            <TabsTrigger value="entregue">Entregues ({contadores.entregue})</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados ({contadores.rejeitado})</TabsTrigger>
          </TabsList>

          <TabsContent value={filtro} className="mt-0">
            {pedidosFiltrados.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="size-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600 mb-4">
                    {filtro === 'todos' 
                      ? 'Você ainda não criou nenhum pedido de material.'
                      : `Você não tem pedidos ${filtro === 'pendente' ? 'pendentes' : filtro === 'aprovado-nao-entregue' ? 'aprovados aguardando entrega' : filtro === 'entregue' ? 'entregues' : 'rejeitados'}.`
                    }
                  </p>
                  {filtro === 'todos' && (
                    <Button onClick={handleNovoPedido}>
                      <Plus className="size-4 mr-2" />
                      Criar Primeiro Pedido
                    </Button>
                  )}
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
                            {getStatusBadge(pedido)}
                            {getCategoriaBadge(pedido.categoria)}
                          </div>
                          <CardDescription>
                            Quantidade: {pedido.quantidade} • Pedido em: {new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        {pedido.status === 'pendente' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditar(pedido)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => excluirPedido(pedido.id)}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    {pedido.descricao && (
                      <CardContent>
                        <p className="text-sm text-gray-600">{pedido.descricao}</p>
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