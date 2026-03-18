import { supabase } from '../../../utils/supabase/supabaseClient';
import { Emprestimo, NovaSaidaDTO } from '../types';

export const emprestimosService = {
  // 1. Obter todo o histórico
  async obterTodos() {
    const { data, error } = await supabase
      .from('emprestimos')
      .select('*')
      .order('data_saida', { ascending: false });

    if (error) throw new Error(`Erro ao buscar empréstimos: ${error.message}`);
    return data || [];
  },

  // 2. Registar uma nova saída (e abater no stock)
  async registrarSaida(novaSaida: NovaSaidaDTO, materialId?: string) {
    const { error: errEmprestimo } = await supabase
      .from('emprestimos')
      .insert([{ ...novaSaida, status: 'Pendente' }]);

    if (errEmprestimo) throw new Error(`Erro ao registar saída: ${errEmprestimo.message}`);

    const materialQuery = supabase.from('materiais').select('id, quantidade');
    if (materialId) {
      materialQuery.eq('id', materialId);
    } else {
      materialQuery.ilike('nome', novaSaida.materialSolicitado);
    }

    const { data: materialData, error: errMaterial } = await materialQuery.maybeSingle();

    if (materialData && !errMaterial) {
      const novaQnt = Math.max(0, Number(materialData.quantidade) - Number(novaSaida.quantidade));
      await supabase.from('materiais').update({ quantidade: novaQnt }).eq('id', materialData.id);
    }
  },

  // 3. Registar a devolução (e devolver ao stock)
  async registrarDevolucao(emprestimo: Emprestimo, dadosDevolucao: { data_devolucao: string; responsavel_recebimento: string }) {
    const { error: errUpdate } = await supabase
      .from('emprestimos')
      .update({ 
        status: 'Devolvido',
        data_devolucao: dadosDevolucao.data_devolucao,
        responsavel_recebimento: dadosDevolucao.responsavel_recebimento
      })
      .eq('id', emprestimo.id);

    if (errUpdate) throw new Error(`Erro ao atualizar status de devolução: ${errUpdate.message}`);

    const { data: materialData, error: errMaterial } = await supabase
      .from('materiais')
      .select('id, quantidade')
      .ilike('nome', emprestimo.materialSolicitado)
      .maybeSingle();

    if (materialData && !errMaterial) {
      const novaQnt = Math.max(0, Number(materialData.quantidade) + Number(emprestimo.quantidade));
      await supabase.from('materiais').update({ quantidade: novaQnt }).eq('id', materialData.id);
    }
  }
};