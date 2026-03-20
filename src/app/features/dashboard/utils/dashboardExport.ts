import { exportarParaExcel } from '../../../utils/exportador';
import { Emprestimo, Material } from '../../../types';

type Linha = Record<string, string | number>;

export function imprimirElementoPorId(elementId: string, titulo: string) {
  const elemento = document.getElementById(elementId);
  if (!elemento) {
    alert('Nao foi possivel localizar o grafico para impressao.');
    return;
  }

  const janela = window.open('', '_blank', 'width=1200,height=900');
  if (!janela) {
    alert('Nao foi possivel abrir a janela de impressao. Verifique bloqueio de pop-up.');
    return;
  }

  janela.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          h1 { font-size: 20px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        ${elemento.outerHTML}
      </body>
    </html>
  `);

  janela.document.close();
  janela.focus();
  setTimeout(() => {
    janela.print();
    janela.close();
  }, 300);
}

export function exportarGraficoExcel(titulo: string, dados: Linha[]) {
  exportarParaExcel(dados, titulo.replace(/\s+/g, '_'), Object.keys(dados[0] || {}).reduce((acc, chave) => {
    acc[chave] = chave;
    return acc;
  }, {} as Record<string, string>));
}

export function enviarGraficoPorEmail(titulo: string, dados: Linha[]) {
  const linhas = dados.slice(0, 20).map((item) => Object.values(item).join(' | ')).join('\n');
  const corpo = [
    `Segue o resumo do grafico: ${titulo}`,
    '',
    'Preview dos dados (max 20 linhas):',
    linhas || 'Sem dados para o periodo selecionado.',
    '',
    'Obs: para anexar o arquivo, use primeiro o botao de Exportar Excel e depois anexe manualmente no seu cliente de email.'
  ].join('\n');

  const mailto = `mailto:?subject=${encodeURIComponent(`Dashboard - ${titulo}`)}&body=${encodeURIComponent(corpo)}`;
  window.location.href = mailto;
}

export function gerarDadosConsolidadosDashboard(emprestimos: Emprestimo[], materiais: Material[]): Linha[] {
  const pendentes = emprestimos.filter((e) => e.status === 'Pendente').length;
  const devolvidos = emprestimos.filter((e) => e.status === 'Devolvido').length;
  const totalMateriais = materiais.length;
  const totalUnidadesEstoque = materiais.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);
  const totalUnidadesEmprestadas = emprestimos
    .filter((e) => e.status === 'Pendente')
    .reduce((acc, e) => acc + (Number(e.quantidade) || 0), 0);

  return [
    { indicador: 'Total de modelos de materiais', valor: totalMateriais },
    { indicador: 'Total de unidades em estoque', valor: totalUnidadesEstoque },
    { indicador: 'Total de unidades emprestadas (pendentes)', valor: totalUnidadesEmprestadas },
    { indicador: 'Quantidade de emprestimos pendentes', valor: pendentes },
    { indicador: 'Quantidade de emprestimos devolvidos', valor: devolvidos },
    { indicador: 'Data de geracao', valor: new Date().toLocaleString('pt-BR') }
  ];
}
