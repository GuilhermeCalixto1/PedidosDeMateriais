import React, { createContext, useContext, useState, useEffect } from "react";

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
  ) => void;
  marcarComoDevolvido: (
    id: string,
    responsavelDevolucao: string,
    responsavelDevolucaoId: string,
  ) => void;
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
    // Carregar empréstimos do localStorage
    const savedEmprestimos = localStorage.getItem("emprestimos");
    if (savedEmprestimos) {
      setEmprestimos(JSON.parse(savedEmprestimos));
    } else {
      // Começa com a lista vazia em vez de usar os dados de exemplo
      setEmprestimos([]);
    }
  }, []);

  const salvarEmprestimos = (novosEmprestimos: Emprestimo[]) => {
    setEmprestimos(novosEmprestimos);
    localStorage.setItem("emprestimos", JSON.stringify(novosEmprestimos));
  };

  const adicionarEmprestimo = (
    emprestimo: Omit<Emprestimo, "id" | "dataRegistro" | "status">,
  ) => {
    const novoEmprestimo: Emprestimo = {
      ...emprestimo,
      id: Date.now().toString(),
      dataRegistro: new Date().toISOString(),
      status: "pendente",
    };
    salvarEmprestimos([...emprestimos, novoEmprestimo]);
  };

  const marcarComoDevolvido = (
    id: string,
    responsavelDevolucao: string,
    responsavelDevolucaoId: string,
  ) => {
    const emprestimosAtualizados = emprestimos.map((emp) =>
      emp.id === id
        ? {
            ...emp,
            status: "devolvido" as const,
            dataDevolucao: new Date().toISOString(),
            responsavelDevolucao,
            responsavelDevolucaoId,
          }
        : emp,
    );
    salvarEmprestimos(emprestimosAtualizados);
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
