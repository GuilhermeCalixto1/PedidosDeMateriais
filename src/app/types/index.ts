// ==========================================
// 1. TIPAGENS DE USUÁRIO E AUTENTICAÇÃO
// ==========================================
export interface UsuarioLogado {
  id: string;
  nome: string;
  matricula: string;
  role: "admin" | "funcionario"; // O cargo unificado e correto
}

// ==========================================
// 2. TIPAGENS DE MATERIAIS / ESTOQUE
// ==========================================
// DTO (Data Transfer Object) - Usado para criar um NOVO material (ainda sem ID)
export interface MaterialDTO {
  nome: string;
  categoria: "mecanico" | "eletrico";
  quantidade: number;
  valor_unitario?: number; // <-- ADICIONADO: Permite registar o preço
}

// O Material completo, conforme vem do Banco de Dados e modificado pelo Contexto
export interface Material extends MaterialDTO {
  id: string;
  total?: number; // <-- ADICIONADO: Para a tabela saber que pode receber isto
  emUso?: number; // <-- ADICIONADO: Para a tabela saber a quantidade na rua
}

// ==========================================
// 3. TIPAGENS DE EMPRÉSTIMOS
// ==========================================
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

// DTO para registrar uma NOVA saída (não precisa de ID nem Status inicial)
export type NovaSaidaDTO = Omit<Emprestimo, "id" | "status">;
