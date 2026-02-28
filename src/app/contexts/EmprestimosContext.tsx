import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase/supabaseClient";

export interface Emprestimo {
  id: string;
  materialSolicitado: string;
  categoria: "mecanico" | "eletrico";
  data: string;
  nomeFuncionario: string;
  matricula: string;
  responsavelEntrega: string;
  responsavelEntregaId: string;
  status: "pendente" | "devolvido";
  dataRegistro: string;
  dataDevolucao?: string;
  responsavelDevolucao?: string;
  responsavelDevolucaoId?: string;
}

interface EmprestimosContextType {
  emprestimos: Emprestimo[];
  adicionarEmprestimo: (
    emprestimo: Omit<Emprestimo, "id" | "dataRegistro" | "status">,
  ) => Promise<void>;
  marcarComoDevolvido: (
    id: string,
    responsavelDevolucao: string,
    responsavelDevolucaoId: string,
  ) => Promise<void>;
}

const EmprestimosContext = createContext<EmprestimosContextType | undefined>(
  undefined,
);

export function EmprestimosProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  useEffect(() => {
    // Busca os dados diretamente da tabela 'emprestimos' no Supabase
    const carregarEmprestimos = async () => {
      const { data, error } = await supabase.from("emprestimos").select("*");

      if (error) {
        console.error("Erro ao buscar empréstimos:", error);
      } else if (data) {
        setEmprestimos(data as Emprestimo[]);
      }
    };

    carregarEmprestimos();
  }, []);

  const adicionarEmprestimo = async (
    emprestimo: Omit<Emprestimo, "id" | "dataRegistro" | "status">,
  ) => {
    const novoEmprestimo: Emprestimo = {
      ...emprestimo,
      id: Date.now().toString(),
      dataRegistro: new Date().toISOString(),
      status: "pendente",
    };

    // Envia o novo empréstimo para o Supabase
    const { error } = await supabase
      .from("emprestimos")
      .insert([novoEmprestimo]);

    if (error) {
      console.error("Erro ao inserir empréstimo:", error);
    } else {
      setEmprestimos([...emprestimos, novoEmprestimo]);
    }
  };

  const marcarComoDevolvido = async (
    id: string,
    responsavelDevolucao: string,
    responsavelDevolucaoId: string,
  ) => {
    const atualizacao = {
      status: "devolvido",
      dataDevolucao: new Date().toISOString(),
      responsavelDevolucao,
      responsavelDevolucaoId,
    };

    // Atualiza o status do empréstimo no Supabase
    const { error } = await supabase
      .from("emprestimos")
      .update(atualizacao)
      .eq("id", id);

    if (error) {
      console.error("Erro ao marcar devolução:", error);
    } else {
      setEmprestimos(
        emprestimos.map((emp) =>
          emp.id === id ? { ...emp, ...atualizacao } : emp,
        ) as Emprestimo[],
      );
    }
  };

  return (
    <EmprestimosContext.Provider
      value={{ emprestimos, adicionarEmprestimo, marcarComoDevolvido }}
    >
      {children}
    </EmprestimosContext.Provider>
  );
}

export function useEmprestimos() {
  const context = useContext(EmprestimosContext);
  if (context === undefined) {
    throw new Error(
      "useEmprestimos deve ser usado dentro de um EmprestimosProvider",
    );
  }
  return context;
}
