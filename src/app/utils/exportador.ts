// src/app/utils/exportador.ts

/**
 * Converte uma lista de objetos num ficheiro CSV (compatível com Excel) e força o download.
 * @param dados O array de dados (ex: emprestimos ou materiais)
 * @param nomeArquivo O nome que o ficheiro vai ter quando for descarregado
 * @param mapeamentoColunas Um objeto que mapeia a chave do dado para o nome da coluna no Excel
 */
export function exportarParaExcel(dados: any[], nomeArquivo: string, mapeamentoColunas: Record<string, string>) {
    if (!dados || dados.length === 0) {
      alert('Não há dados para exportar.');
      return;
    }
  
    // 1. Prepara os Cabeçalhos (A primeira linha do Excel)
    const chaves = Object.keys(mapeamentoColunas);
    const cabecalhos = chaves.map(chave => mapeamentoColunas[chave]).join(';');
  
    // 2. Prepara as Linhas
    const linhas = dados.map(item => {
      return chaves.map(chave => {
        let valor = item[chave];
        
        // Trata valores nulos ou vazios
        if (valor === null || valor === undefined) valor = '';
        
        // Se for um texto com ponto e vírgula, coloca entre aspas para não estragar a coluna
        const stringValor = String(valor).replace(/"/g, '""');
        return `"${stringValor}"`;
      }).join(';');
    });
  
    // 3. Junta tudo num formato CSV (com BOM para o Excel ler acentos em português corretamente)
    const conteudoCSV = '\uFEFF' + cabecalhos + '\n' + linhas.join('\n');
  
    // 4. Cria o ficheiro fantasma e força o download
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }