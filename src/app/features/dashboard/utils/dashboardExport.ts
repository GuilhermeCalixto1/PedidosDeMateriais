import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Exporta dados para Excel
export const exportarGraficoExcel = (titulo: string, dados: any[]) => {
  if (!dados || dados.length === 0) {
    console.error("Não existem dados para exportar.");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(dados);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  saveAs(data, `${titulo.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.xlsx`);
};

// Gera captura e prepara e-mail
export const enviarGraficoPorEmail = async (elementId: string, titulo: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Aumenta a qualidade da imagem
      logging: false
    });
    
    const image = canvas.toDataURL("image/png");
    
    // Nota: Protocolo mailto não permite anexos automáticos por segurança do navegador.
    // O link abre o e-mail e o utilizador pode colar (Ctrl+V) a imagem se o cliente suportar.
    const subject = encodeURIComponent(`Relatório: ${titulo}`);
    const body = encodeURIComponent(`Olá,\n\nSegue em anexo a captura do gráfico: ${titulo}.\n\n(Pode colar a imagem capturada diretamente no corpo do e-mail).`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    // Opcional: Copiar imagem para o clipboard para facilitar o Ctrl+V
    canvas.toBlob((blob) => {
      if (blob) {
        navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]).catch(() => console.log("Não foi possível copiar automaticamente para o clipboard."));
      }
    });

  } catch (error) {
    console.error("Erro ao gerar imagem para e-mail:", error);
  }
};

// Gera dados consolidados para o botão Excel Geral do topo
export const gerarDadosConsolidadosDashboard = (emprestimos: any[], materiais: any[]) => {
  return emprestimos.map(e => ({
    'Data de Saída': e.data_saida ? new Date(e.data_saida).toLocaleDateString() : '---',
    'Material': e.materialSolicitado,
    'Qtd': e.quantidade,
    'Funcionário': e.usuario,
    'Gerência': e.gerencia || '---',
    'Status': e.status,
    'Data de Devolução': e.data_devolucao ? new Date(e.data_devolucao).toLocaleDateString() : 'Pendente'
  }));
};