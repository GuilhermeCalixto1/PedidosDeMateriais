// src/app/types/index.ts

export interface UsuarioLogado {
  id: string;
  nome: string;
  matricula: string;
  role: "admin" | "funcionario";
}

export interface MaterialDTO {
  nome: string;
  categoria: "mecanico" | "eletrico";
  quantidade: number;
  valor_unitario?: number;
}

export interface Material extends MaterialDTO {
  id: string;
  total?: number; // <-- ADICIONADO
  emUso?: number; // <-- ADICIONADO
}

export interface Emprestimo {
  id: string;
  usuario: string;
  materialSolicitado: string;
  material_categoria: "mecanico" | "eletrico";
  gerencia: string;
  quantidade: number;
  status: "Pendente" | "Devolvido";
  data_saida: string;
  observacao?: string;
  data_devolucao?: string;
  responsavel_recebimento?: string;
}

export type NovaSaidaDTO = Omit<Emprestimo, "id" | "status">;
