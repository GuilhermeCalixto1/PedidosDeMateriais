import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Pedido {
  id: string;
  material: string;
  quantidade: number;
  descricao: string;
  solicitante: string;
  solicitanteId: string;
  dataPedido: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  entregue: boolean;
}

interface PedidosContextType {
  pedidos: Pedido[];
  adicionarPedido: (pedido: Omit<Pedido, 'id' | 'dataPedido' | 'status' | 'entregue'>) => void;
  atualizarPedido: (id: string, pedido: Partial<Pedido>) => void;
  excluirPedido: (id: string) => void;
  aprovarPedido: (id: string) => void;
  rejeitarPedido: (id: string) => void;
  marcarComoEntregue: (id: string) => void;
}

const PedidosContext = createContext<PedidosContextType | undefined>(undefined);

export function PedidosProvider({ children }: { children: React.ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    // Carregar pedidos do localStorage
    const savedPedidos = localStorage.getItem('pedidos');
    if (savedPedidos) {
      setPedidos(JSON.parse(savedPedidos));
    } else {
      // Pedidos de exemplo
      const pedidosIniciais: Pedido[] = [
        {
          id: '1',
          material: 'Martelo',
          quantidade: 2,
          descricao: 'Martelo de unha para carpintaria',
          solicitante: 'João Silva',
          solicitanteId: '1',
          dataPedido: '2026-02-20',
          status: 'pendente',
          entregue: false,
        },
        {
          id: '2',
          material: 'Chave de fenda',
          quantidade: 5,
          descricao: 'Jogo de chaves de fenda phillips',
          solicitante: 'Maria Santos',
          solicitanteId: '2',
          dataPedido: '2026-02-22',
          status: 'pendente',
          entregue: false,
        },
      ];
      setPedidos(pedidosIniciais);
      localStorage.setItem('pedidos', JSON.stringify(pedidosIniciais));
    }
  }, []);

  const salvarPedidos = (novosPedidos: Pedido[]) => {
    setPedidos(novosPedidos);
    localStorage.setItem('pedidos', JSON.stringify(novosPedidos));
  };

  const adicionarPedido = (pedido: Omit<Pedido, 'id' | 'dataPedido' | 'status' | 'entregue'>) => {
    const novoPedido: Pedido = {
      ...pedido,
      id: Date.now().toString(),
      dataPedido: new Date().toISOString().split('T')[0],
      status: 'pendente',
      entregue: false,
    };
    salvarPedidos([...pedidos, novoPedido]);
  };

  const atualizarPedido = (id: string, pedidoAtualizado: Partial<Pedido>) => {
    const novosPedidos = pedidos.map(p =>
      p.id === id ? { ...p, ...pedidoAtualizado } : p
    );
    salvarPedidos(novosPedidos);
  };

  const excluirPedido = (id: string) => {
    const novosPedidos = pedidos.filter(p => p.id !== id);
    salvarPedidos(novosPedidos);
  };

  const aprovarPedido = (id: string) => {
    atualizarPedido(id, { status: 'aprovado' });
  };

  const rejeitarPedido = (id: string) => {
    atualizarPedido(id, { status: 'rejeitado' });
  };

  const marcarComoEntregue = (id: string) => {
    atualizarPedido(id, { entregue: true });
  };

  return (
    <PedidosContext.Provider value={{
      pedidos,
      adicionarPedido,
      atualizarPedido,
      excluirPedido,
      aprovarPedido,
      rejeitarPedido,
      marcarComoEntregue,
    }}>
      {children}
    </PedidosContext.Provider>
  );
}

export function usePedidos() {
  const context = useContext(PedidosContext);
  if (context === undefined) {
    throw new Error('usePedidos deve ser usado dentro de um PedidosProvider');
  }
  return context;
}