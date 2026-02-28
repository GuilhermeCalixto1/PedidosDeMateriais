import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase/supabaseClient";

export interface Pedido {
  id: string;
  material: string;
  quantidade: number;
  descricao: string;
  categoria: "eletrico" | "mecanico";
  solicitante: string;
  solicitanteId: string;
  dataPedido: string;
  status: "pendente" | "aprovado" | "rejeitado";
  entregue: boolean;
}

interface PedidosContextType {
  pedidos: Pedido[];
  adicionarPedido: (
    pedido: Omit<Pedido, "id" | "dataPedido" | "status" | "entregue">,
  ) => void;
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
    const carregarPedidos = async () => {
      // Busca tudo da tabela 'pedidos'
      const { data, error } = await supabase.from("pedidos").select("*");

      if (error) {
        console.error("Erro ao buscar pedidos:", error);
      } else if (data) {
        setPedidos(data as Pedido[]);
      }
    };

    carregarPedidos();
  }, []);

  const salvarPedidos = (novosPedidos: Pedido[]) => {
    setPedidos(novosPedidos);
    localStorage.setItem("pedidos", JSON.stringify(novosPedidos));
  };

  const adicionarPedido = async (
    pedido: Omit<Pedido, "id" | "dataPedido" | "status" | "entregue">,
  ) => {
    const novoPedido: Pedido = {
      ...pedido,
      id: Date.now().toString(),
      dataPedido: new Date().toISOString().split("T")[0],
      status: "pendente",
      entregue: false,
    };

    // Envia para o Supabase
    const { error } = await supabase.from("pedidos").insert([novoPedido]);

    if (error) {
      console.error("Erro ao inserir pedido:", error);
    } else {
      // Atualiza a tela localmente apenas se der certo
      setPedidos([...pedidos, novoPedido]);
    }
  };

  const atualizarPedido = (id: string, pedidoAtualizado: Partial<Pedido>) => {
    const novosPedidos = pedidos.map((p) =>
      p.id === id ? { ...p, ...pedidoAtualizado } : p,
    );
    salvarPedidos(novosPedidos);
  };

  const excluirPedido = (id: string) => {
    const novosPedidos = pedidos.filter((p) => p.id !== id);
    salvarPedidos(novosPedidos);
  };

  const aprovarPedido = (id: string) => {
    atualizarPedido(id, { status: "aprovado" });
  };

  const rejeitarPedido = (id: string) => {
    atualizarPedido(id, { status: "rejeitado" });
  };

  const marcarComoEntregue = (id: string) => {
    atualizarPedido(id, { entregue: true });
  };

  return (
    <PedidosContext.Provider
      value={{
        pedidos,
        adicionarPedido,
        atualizarPedido,
        excluirPedido,
        aprovarPedido,
        rejeitarPedido,
        marcarComoEntregue,
      }}
    >
      {children}
    </PedidosContext.Provider>
  );
}

export function usePedidos() {
  const context = useContext(PedidosContext);
  if (context === undefined) {
    throw new Error("usePedidos deve ser usado dentro de um PedidosProvider");
  }
  return context;
}
