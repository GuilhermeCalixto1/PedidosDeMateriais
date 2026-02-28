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
  ) => Promise<void>;
  atualizarPedido: (id: string, pedido: Partial<Pedido>) => Promise<void>;
  excluirPedido: (id: string) => Promise<void>;
  aprovarPedido: (id: string) => Promise<void>;
  rejeitarPedido: (id: string) => Promise<void>;
  marcarComoEntregue: (id: string) => Promise<void>;
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

  const atualizarPedido = async (
    id: string,
    pedidoAtualizado: Partial<Pedido>,
  ) => {
    // Envia a atualização para o Supabase
    const { error } = await supabase
      .from("pedidos")
      .update(pedidoAtualizado)
      .eq("id", id); // O .eq() garante que vai atualizar só o pedido com este ID

    if (error) {
      console.error("Erro ao atualizar pedido:", error);
    } else {
      // Se deu certo no banco, atualiza a tela
      setPedidos(
        pedidos.map((p) => (p.id === id ? { ...p, ...pedidoAtualizado } : p)),
      );
    }
  };

  const excluirPedido = async (id: string) => {
    // Deleta do Supabase
    const { error } = await supabase.from("pedidos").delete().eq("id", id);

    if (error) {
      console.error("Erro ao excluir pedido:", error);
    } else {
      // Se deu certo no banco, remove da tela
      setPedidos(pedidos.filter((p) => p.id !== id));
    }
  };

  const aprovarPedido = async (id: string) => {
    await atualizarPedido(id, { status: "aprovado" });
  };

  const rejeitarPedido = async (id: string) => {
    await atualizarPedido(id, { status: "rejeitado" });
  };

  const marcarComoEntregue = async (id: string) => {
    await atualizarPedido(id, { entregue: true });
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
