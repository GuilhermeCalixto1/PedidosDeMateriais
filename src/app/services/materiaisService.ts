import { supabase } from '../../../utils/supabase/supabaseClient';
import { MaterialDTO, Material } from '../types/index'; //

export const materiaisService = {
  // 1. Buscar todos os materiais
  async obterTodos() {
    const { data, error } = await supabase
      .from('materiais')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw new Error(`Erro ao buscar materiais: ${error.message}`);
    return data || [];
  },

  // 2. Criar um novo material
  async criar(material: MaterialDTO) {
    const { data, error } = await supabase
      .from('materiais')
      .insert([material])
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar material: ${error.message}`);
    return data;
  },

  // 3. Atualizar a quantidade de um material existente
  async atualizarQuantidade(id: string, novaQuantidade: number) {
    const { error } = await supabase
      .from('materiais')
      .update({ quantidade: novaQuantidade })
      .eq('id', id);

    if (error) throw new Error(`Erro ao atualizar quantidade: ${error.message}`);
    return true;
  },

  // 4. Excluir um material
  async excluir(id: string) {
    const { error } = await supabase
      .from('materiais')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Erro ao excluir material: ${error.message}`);
    return true;
  }
};