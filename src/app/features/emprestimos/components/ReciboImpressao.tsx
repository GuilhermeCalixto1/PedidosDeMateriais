import React from 'react';
import { Package } from 'lucide-react';

interface ReciboImpressaoProps {
  grupo: any;
}

export function ReciboImpressao({ grupo }: ReciboImpressaoProps) {
  if (!grupo) return null;

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  return (
    // Este bloco fica invisível na tela normal (hidden) e só aparece na impressão (print:block)
    <div className="hidden print:block p-8 font-sans text-black bg-white">
      
      {/* Cabeçalho do Documento */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Package className="size-10" />
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">Ferramentaria</h1>
            <p className="text-sm text-gray-600">Comprovativo de Movimentação de Materiais</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">RECIBO DE SAÍDA</h2>
          <p className="text-sm font-medium">Data: {formatarData(grupo.data_saida)}</p>
          <p className="text-sm font-medium">Status: <span className="uppercase">{grupo.status}</span></p>
        </div>
      </div>

      {/* Dados do Solicitante */}
      <div className="mb-8 p-4 border-2 border-gray-300 rounded-lg">
        <h3 className="text-sm font-bold uppercase mb-2 border-b-2 border-gray-200 pb-1">Dados do Solicitante</h3>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-lg"><strong>Nome / Matrícula:</strong> {grupo.usuario}</p>
          <p className="text-lg"><strong>Gerência / Setor:</strong> {grupo.gerencia}</p>
        </div>
      </div>

      {/* Lista de Ferramentas Retiradas */}
      <div className="mb-16">
        <h3 className="text-sm font-bold uppercase mb-2 border-b-2 border-gray-200 pb-1">Ferramentas Retiradas ({grupo.itens.length})</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-3 px-2 font-bold">Item</th>
              <th className="py-3 px-2 font-bold text-center">Quantidade</th>
              <th className="py-3 px-2 font-bold">Observação / O.S.</th>
            </tr>
          </thead>
          <tbody>
            {grupo.itens.map((item: any, idx: number) => (
              <tr key={item.id || idx} className="border-b border-gray-300">
                <td className="py-3 px-2 font-medium text-lg">{item.materialSolicitado}</td>
                <td className="py-3 px-2 text-center font-bold text-lg">{item.quantidade}</td>
                <td className="py-3 px-2 text-gray-700">{item.observacao || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-sm italic">
          Declaro ter recebido as ferramentas acima listadas em perfeitas condições de uso e comprometo-me a devolvê-las, 
          sob pena de responsabilização em caso de perda ou dano por mau uso.
        </div>
      </div>

      {/* Campos de Assinatura */}
      <div className="mt-24 grid grid-cols-2 gap-12 text-center">
        <div>
          <div className="border-b-2 border-black mb-2 mx-8"></div>
          <p className="font-bold text-sm uppercase">Assinatura do Solicitante</p>
          <p className="text-sm text-gray-600 mt-1">{grupo.usuario}</p>
        </div>
        <div>
          <div className="border-b-2 border-black mb-2 mx-8"></div>
          <p className="font-bold text-sm uppercase">Responsável da Ferramentaria</p>
          <p className="text-sm text-gray-600 mt-1">Data: ___ / ___ / ______</p>
        </div>
      </div>

      <div className="mt-16 text-center text-xs text-gray-400">
        Documento gerado automaticamente pelo Sistema de Ferramentaria
      </div>
    </div>
  );
}