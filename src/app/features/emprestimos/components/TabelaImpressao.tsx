import React from 'react';

// Definimos o que este componente precisa para funcionar
interface TabelaImpressaoProps {
  pendentes: any[];
  temFiltroAtivo: boolean;
}

export function TabelaImpressao({ pendentes, temFiltroAtivo }: TabelaImpressaoProps) {
  return (
    <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-8">
      <div className="mb-6 border-b-2 border-gray-800 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Relatório de Ferramentas Pendentes</h1>
        <p className="text-gray-600">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        {temFiltroAtivo && (
          <p className="text-sm font-semibold text-blue-600 mt-2">
            (Imprimindo com filtros ativos aplicados)
          </p>
        )}
      </div>

      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-400">
            <th className="py-2 px-2 font-bold text-gray-800">Ferramenta</th>
            <th className="py-2 px-2 font-bold text-gray-800">Cat.</th>
            <th className="py-2 px-2 font-bold text-gray-800 text-center">Qtd</th>
            <th className="py-2 px-2 font-bold text-gray-800">Retirado por (Func. / Gerência)</th>
            <th className="py-2 px-2 font-bold text-gray-800">Data</th>
            <th className="py-2 px-2 font-bold text-gray-800">Observação</th>
          </tr>
        </thead>
        <tbody>
          {pendentes.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 text-center text-gray-500 italic">
                Nenhuma saída pendente com esses filtros no momento.
              </td>
            </tr>
          ) : (
            pendentes.map((emprestimo, index) => (
              <tr key={emprestimo.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-2 px-2 font-medium">{emprestimo.materialSolicitado}</td>
                <td className="py-2 px-2">
                  {emprestimo.material_categoria === 'eletrico' ? 'Elétrico' : emprestimo.material_categoria === 'mecanico' ? 'Mecânico' : '-'}
                </td>
                <td className="py-2 px-2 font-bold text-center">{emprestimo.quantidade}</td>
                <td className="py-2 px-2">
                  {emprestimo.usuario}
                  {emprestimo.gerencia && <span className="block text-xs text-gray-500">{emprestimo.gerencia}</span>}
                </td>
                <td className="py-2 px-2">
                  {emprestimo.data_saida ? new Date(emprestimo.data_saida + 'T12:00:00Z').toLocaleDateString('pt-BR') : '-'}
                </td>
                <td className="py-2 px-2 italic text-gray-600 max-w-xs break-words">
                  {emprestimo.observacao || '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}