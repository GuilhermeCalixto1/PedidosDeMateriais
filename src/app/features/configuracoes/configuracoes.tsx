import React, { useState } from 'react';
import { useConfiguracoes } from '../../contexts/ConfiguracoesContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Settings, Save, AlertTriangle, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

export function ConfiguracoesSistema() {
  const { configuracoes, atualizarConfiguracoes } = useConfiguracoes();
  
  // Guardamos os valores locais antes de o utilizador clicar em "Salvar"
  const [limiteCargaAlta, setLimiteCargaAlta] = useState(configuracoes.limiteCargaAlta.toString());
  const [diasAlertaPerda, setDiasAlertaPerda] = useState(configuracoes.diasAlertaPerda.toString());
  const [estoqueMinimoRuptura, setEstoqueMinimoRuptura] = useState(configuracoes.estoqueMinimoRuptura.toString());

  const handleSalvar = () => {
    atualizarConfiguracoes({
      limiteCargaAlta: Number(limiteCargaAlta) || 15,
      diasAlertaPerda: Number(diasAlertaPerda) || 7,
      estoqueMinimoRuptura: Number(estoqueMinimoRuptura) || 2,
    });
    toast.success('Configurações do sistema atualizadas com sucesso!');
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Settings className="size-6 text-gray-700" />
          Configurações do Sistema
        </h2>
        <p className="text-gray-600 mt-1">Ajuste os parâmetros globais de alertas e limites da plataforma.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
          <CardTitle className="text-lg text-gray-800">Parâmetros de Alerta (Dashboard)</CardTitle>
          <CardDescription>Estes valores afetam diretamente a sensibilidade dos gráficos e painéis da página principal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          
          {/* Configuração 1: Carga Alta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-b border-gray-100 pb-6">
            <div className="md:col-span-3 space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2 text-gray-900">
                <Activity className="size-4 text-blue-500" />
                Limite de "Carga Alta" (Pedidos Pendentes)
              </Label>
              <p className="text-sm text-gray-500">
                Número de cartões de saída abertos simultaneamente que faz o painel "Fluxo de Pedidos" disparar o alerta vermelho.
              </p>
            </div>
            <div className="md:col-span-1">
              <Input type="number" min="1" value={limiteCargaAlta} onChange={(e) => setLimiteCargaAlta(e.target.value)} className="text-center font-bold text-lg h-12" />
            </div>
          </div>

          {/* Configuração 2: Envelhecimento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-b border-gray-100 pb-6">
            <div className="md:col-span-3 space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2 text-gray-900">
                <Clock className="size-4 text-orange-500" />
                Dias para Alerta de "Ferramenta Perdida"
              </Label>
              <p className="text-sm text-gray-500">
                Tempo (em dias) que uma ferramenta pode estar na rua antes de cair na fatia Vermelha (Crítica) do gráfico de Envelhecimento.
              </p>
            </div>
            <div className="md:col-span-1">
              <Input type="number" min="1" value={diasAlertaPerda} onChange={(e) => setDiasAlertaPerda(e.target.value)} className="text-center font-bold text-lg h-12" />
            </div>
          </div>

          {/* Configuração 3: Ruptura de Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            <div className="md:col-span-3 space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2 text-gray-900">
                <AlertTriangle className="size-4 text-red-500" />
                Nível de Ruptura de Estoque
              </Label>
              <p className="text-sm text-gray-500">
                Quantidade mínima na prateleira necessária para disparar o aviso no painel de "Estoque Crítico".
              </p>
            </div>
            <div className="md:col-span-1">
              <Input type="number" min="0" value={estoqueMinimoRuptura} onChange={(e) => setEstoqueMinimoRuptura(e.target.value)} className="text-center font-bold text-lg h-12" />
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSalvar} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 shadow-md">
          <Save className="size-5 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}