import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Printer, Sheet, Mail, MoreHorizontal } from 'lucide-react';
import { exportarGraficoExcel, enviarGraficoPorEmail } from '../utils/dashboardExport';
import { toast } from 'sonner';

interface AcoesGraficoProps {
  elementId: string;
  titulo: string;
  dados: any[];
}

export function AcoesGrafico({ elementId, titulo, dados }: AcoesGraficoProps) {
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    const clickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', clickFora);
    return () => document.removeEventListener('mousedown', clickFora);
  }, []);

  const handleImprimir = () => {
    setAberto(false);
    const conteudo = document.getElementById(elementId);
    if (!conteudo) return;
    const win = window.open('', '', 'height=700,width=900');
    if (!win) return;
    win.document.write(`<html><head><title>${titulo}</title>`);
    win.document.write('<style>body{font-family:sans-serif;padding:30px;} svg{max-width:100% !important; height:auto !important;}</style></head><body>');
    win.document.write(`<h2>${titulo}</h2>${conteudo.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setAberto(!aberto)}
        className={`h-8 w-8 hover:bg-gray-100 ${aberto ? 'bg-gray-100' : ''}`}
      >
        <MoreHorizontal className="size-5 text-gray-500" />
      </Button>

      {aberto && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 shadow-2xl rounded-md z-[9999] py-1 animate-in fade-in zoom-in duration-100">
          <button 
            onClick={handleImprimir}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Printer className="size-4 mr-3" /> Imprimir Gráfico
          </button>
          <button 
            onClick={() => { exportarGraficoExcel(titulo, dados); setAberto(false); }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
          >
            <Sheet className="size-4 mr-3 text-green-600" /> Exportar para Excel
          </button>
          <button 
            onClick={() => { enviarGraficoPorEmail(elementId, titulo); setAberto(false); }}
            className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Mail className="size-4 mr-3 text-blue-600" /> Enviar por E-mail
          </button>
        </div>
      )}
    </div>
  );
}