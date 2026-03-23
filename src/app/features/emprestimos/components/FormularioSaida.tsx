import React, { useState } from 'react';
import { useMateriais } from '../../../contexts/MateriaisContext';
import { useEmprestimos } from '../../../contexts/EmprestimosContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';

// Importa a nossa muralha de segurança
import { z } from 'zod';
import { NovaSaidaSchema } from '../../../utils/validacoes';

interface Props {
  onFechar: () => void;
}

export function FormularioSaida({ onFechar }: Props) {
  const { materiais, recarregarMateriais } = useMateriais();
  const { adicionarEmprestimo } = useEmprestimos();
  
  const [usuario, setUsuario] = useState('');
  const [gerencia, setGerencia] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [processando, setProcessando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const material = materiais.find(m => m.id === materialId);
    if (!material) {
      toast.error("Por favor, selecione uma ferramenta.");
      return;
    }

    try {
      // 1. ZOD ENTRA EM AÇÃO: Valida os dados antes de contactar o servidor
      NovaSaidaSchema.parse({
        usuario,
        gerencia,
        materialSolicitado: material.nome,
        quantidade: quantidade // O zod.coerce.number() no validacoes.ts trata da conversão
      });

      // 2. Validação extra de stock físico
      if (Number(quantidade) > material.quantidade) {
        toast.error(`Estoque insuficiente. Só existem ${material.quantidade} na prateleira.`);
        return;
      }

      setProcessando(true);
      
      // 3. Se passar nas validações, regista no Supabase
      await adicionarEmprestimo({
        usuario,
        gerencia,
        materialSolicitado: material.nome,
        material_categoria: material.categoria,
        quantidade: Number(quantidade),
        data_saida: new Date().toISOString()
      });

      if (recarregarMateriais) await recarregarMateriais();
      
      toast.success("Saída registada com sucesso!");
      onFechar();

    } catch (error) {
      // 4. Forçamos o TypeScript a aceitar a estrutura do erro do Zod
      const err = error as any; 
      
      if (err.errors && err.errors.length > 0) {
        toast.error(err.errors[0].message);
      } else {
        toast.error("Erro interno ao registar a saída.");
      }
    } finally {
      setProcessando(false);
    }
  };

  const materiaisDisponiveis = materiais.filter(m => m.quantidade > 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">Nova Saída de Material</h3>
          <Button variant="ghost" size="icon" onClick={onFechar} className="h-8 w-8 text-gray-500 hover:text-gray-900">
            <X className="size-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="usuario">Funcionário / Solicitante</Label>
            <Input 
              id="usuario" 
              placeholder="Nome do funcionário" 
              value={usuario} 
              onChange={e => setUsuario(e.target.value)}
              disabled={processando}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gerencia">Gerência / Setor</Label>
            <Input 
              id="gerencia" 
              placeholder="Ex: Manutenção Elétrica" 
              value={gerencia} 
              onChange={e => setGerencia(e.target.value)}
              disabled={processando}
            />
          </div>

          <div className="space-y-2">
            <Label>Ferramenta</Label>
            <Select value={materialId} onValueChange={setMaterialId} disabled={processando}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ferramenta..." />
              </SelectTrigger>
              <SelectContent>
                {materiaisDisponiveis.map(m => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.nome} (Disp: {m.quantidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input 
              id="quantidade" 
              type="number" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)}
              disabled={processando}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onFechar} disabled={processando}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processando} className="bg-blue-600 hover:bg-blue-700">
              <Save className="size-4 mr-2" />
              {processando ? 'A salvar...' : 'Registar Saída'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}