import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePedidos } from '../contexts/PedidosContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft } from 'lucide-react';
import type { Pedido } from '../contexts/PedidosContext';

interface PedidoFormProps {
  pedido: Pedido | null;
  onFechar: () => void;
}

export function PedidoForm({ pedido, onFechar }: PedidoFormProps) {
  const { user } = useAuth();
  const { adicionarPedido, atualizarPedido } = usePedidos();
  
  const [material, setMaterial] = useState(pedido?.material || '');
  const [quantidade, setQuantidade] = useState(pedido?.quantidade || 1);
  const [descricao, setDescricao] = useState(pedido?.descricao || '');
  const [categoria, setCategoria] = useState<'eletrico' | 'mecanico'>(pedido?.categoria || 'mecanico');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pedido) {
      // Editar pedido existente
      atualizarPedido(pedido.id, {
        material,
        quantidade,
        descricao,
        categoria,
      });
    } else {
      // Criar novo pedido
      adicionarPedido({
        material,
        quantidade,
        descricao,
        categoria,
        solicitante: user!.nome,
        solicitanteId: user!.id,
      });
    }
    
    onFechar();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={onFechar} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {pedido ? 'Editar Pedido' : 'Novo Pedido de Material'}
            </CardTitle>
            <CardDescription>
              Preencha os dados do material que você precisa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material / Ferramenta *</Label>
                <Input
                  id="material"
                  placeholder="Ex: Martelo, Chave de fenda, Luvas..."
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição / Observações</Label>
                <Textarea
                  id="descricao"
                  placeholder="Adicione detalhes sobre o material, especificações, motivo da solicitação..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={categoria}
                  onValueChange={(value) => setCategoria(value as 'eletrico' | 'mecanico')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eletrico">Elétrico</SelectItem>
                    <SelectItem value="mecanico">Mecânico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm text-gray-600">Solicitante</Label>
                <p className="mt-1">{user?.nome}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onFechar} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {pedido ? 'Salvar Alterações' : 'Criar Pedido'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}