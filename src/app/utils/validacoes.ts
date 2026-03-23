import { z } from 'zod';

const antiXssRegex = /^[^<>]*$/;

export const NovaSaidaSchema = z.object({
  usuario: z.string()
    .min(3, "O nome do funcionário deve ter pelo menos 3 letras.")
    .regex(antiXssRegex, "O nome contém caracteres inválidos (< ou >)."),
  
  gerencia: z.string()
    .min(2, "A gerência deve ter pelo menos 2 letras.")
    .regex(antiXssRegex, "A gerência contém caracteres inválidos (< ou >)."),
  
  materialSolicitado: z.string()
    .min(2, "Selecione uma ferramenta válida."),
  
  // CORREÇÃO: Usando coerce.number() para evitar erros de tipagem no Zod
  quantidade: z.coerce.number()
    .int("A quantidade não pode ter casas decimais.")
    .positive("A quantidade deve ser maior que zero (1 ou mais).")
});

export const DevolucaoSchema = z.object({
  nomeRecebedor: z.string()
    .min(3, "O nome de quem recebe é obrigatório e deve ter 3 ou mais letras.")
    .regex(antiXssRegex, "O nome contém caracteres inválidos."),
  
  matriculaRecebedor: z.string()
    .min(3, "A matrícula é obrigatória.")
    .regex(/^[a-zA-Z0-9]+$/, "A matrícula deve conter apenas letras e números (sem espaços ou símbolos)."),
});