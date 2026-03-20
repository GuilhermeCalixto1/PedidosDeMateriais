import React from 'react';
import { Button } from '../../../components/ui/button';
import { Mail, Printer, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { enviarGraficoPorEmail, exportarGraficoExcel, imprimirElementoPorId } from '../utils/dashboardExport';

type Linha = Record<string, string | number>;

interface AcoesGraficoProps {
  elementId: string;
  titulo: string;
  dados: Linha[];
}

export function AcoesGrafico({ elementId, titulo, dados }: AcoesGraficoProps) {
  const temDados = dados.length > 0;

  return (
    <div className="flex items-center gap-1 print:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Imprimir gráfico"
        onClick={() => imprimirElementoPorId(elementId, titulo)}
      >
        <Printer className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Exportar para Excel"
        onClick={() => {
          if (!temDados) {
            toast.warning('Nao ha dados para exportar neste grafico.');
            return;
          }
          exportarGraficoExcel(titulo, dados);
          toast.success('Arquivo CSV compativel com Excel gerado com sucesso.');
        }}
      >
        <Sheet className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        title="Enviar por e-mail"
        onClick={() => {
          enviarGraficoPorEmail(titulo, dados);
          toast.info('Cliente de e-mail aberto. Se quiser anexo, exporte o Excel e anexe manualmente.');
        }}
      >
        <Mail className="size-4" />
      </Button>
    </div>
  );
}
