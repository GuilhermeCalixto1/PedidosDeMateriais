import { supabase } from '../../../utils/supabase/supabaseClient';
import { Emprestimo, NovaSaidaDTO } from '../types';

function normalizarTexto(valor: string) {
  return (valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

async function buscarMaterialPorNome(nomeMaterial: string) {
  const nomeNormalizado = normalizarTexto(nomeMaterial);

  const { data: candidatos, error } = await supabase
    .from('materiais')
    .select('id, nome, quantidade')
    .ilike('nome', `%${nomeMaterial}%`);

  if (error) {
    throw new Error(`Erro ao localizar material para ajuste de estoque: ${error.message}`);
  }

  const lista = candidatos || [];
  if (lista.length === 0) return null;

  const matchExato = lista.find((m: any) => normalizarTexto(m.nome) === nomeNormalizado);
  return matchExato || lista[0];
}

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

    const materialData = await buscarMaterialPorNome(emprestimo.materialSolicitado);
    if (materialData) {
      const novaQnt = Math.max(0, Number(materialData.quantidade) + Number(emprestimo.quantidade));
      await supabase.from('materiais').update({ quantidade: novaQnt }).eq('id', materialData.id);
    }
  },

  // 4. Apagar saída pendente (corrigir digitação) e devolver ao stock
  async excluirPendente(emprestimo: Emprestimo) {
    if (emprestimo.status !== 'Pendente') {
      throw new Error('Apenas empréstimos pendentes podem ser apagados.');
    }

    const { error: errDelete } = await supabase
      .from('emprestimos')
      .delete()
      .eq('id', emprestimo.id)
      .eq('status', 'Pendente');

    if (errDelete) throw new Error(`Erro ao apagar empréstimo: ${errDelete.message}`);

    const materialData = await buscarMaterialPorNome(emprestimo.materialSolicitado);
    if (materialData) {
      const novaQnt = Math.max(0, Number(materialData.quantidade) + Number(emprestimo.quantidade));
      await supabase.from('materiais').update({ quantidade: novaQnt }).eq('id', materialData.id);
    } else {
      throw new Error(`Material "${emprestimo.materialSolicitado}" nao encontrado para devolucao ao estoque.`);
    }
  }
};