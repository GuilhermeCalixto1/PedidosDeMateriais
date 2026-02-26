import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePedidos } from '../contexts/PedidosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { LogOut, Plus, Pencil, Trash2, Package } from 'lucide-react';
import { PedidoForm } from './PedidoForm';
import type { Pedido } from '../contexts/PedidosContext';

export function PedidosPage() {
  const { user, logout } = useAuth();
  const { pedidos, excluirPedido } = usePedidos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState<Pedido | null>(null);

  // Filtrar apenas pedidos do usuário atual
  const meusPedidos = pedidos.filter(p => p.solicitanteId === user?.id);

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

        {meusPedidos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="size-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg mb-2">Nenhum pedido encontrado</h3>
              <p className="text-gray-600 mb-4">
                Você ainda não criou nenhum pedido de material.
              </p>
              <Button onClick={handleNovoPedido}>
                <Plus className="size-4 mr-2" />
                Criar Primeiro Pedido
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {meusPedidos.map((pedido) => (
              <Card key={pedido.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{pedido.material}</CardTitle>
                        {getStatusBadge(pedido)}
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
      </div>
    </div>
  );
}