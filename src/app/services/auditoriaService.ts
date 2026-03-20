import { supabase } from '../../../utils/supabase/supabaseClient';

export interface RegistroLogDTO {
  usuario: string;
  modulo: string;
  acao: string;
  detalhes: string;
}

export const auditoriaService = {
  // Envia o novo log para o banco de dados
  async registrarLog(log: RegistroLogDTO) {
    const { data, error } = await supabase
      .from('auditoria_logs')
      .insert([log])
      .select();

    if (error) {
      console.error('Erro no Supabase ao inserir log:', error);
      throw error;
    }
    return data;
  },

  // Busca todos os logs, ordenando do mais recente para o mais antigo
  async obterLogs() {
    const { data, error } = await supabase
      .from('auditoria_logs')
      .select('*')
      .order('data_hora', { ascending: false });

    if (error) {
      console.error('Erro no Supabase ao buscar logs:', error);
      throw error;
    }
    return data;
  }
};