import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useMateriais } from '../contexts/MateriaisContext';
import { useEmprestimos } from '../contexts/EmprestimosContext';
import { useConfiguracoes } from '../contexts/ConfiguracoesContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export function Notificacoes() {
  const { materiais } = useMateriais();
  const { emprestimos } = useEmprestimos();
  const { configuracoes } = useConfiguracoes();
  
  // ESTADO NATIVO DO REACT PARA CONTROLAR O MENU
  const [aberto, setAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efeito para fechar o menu se o utilizador clicar noutro lugar do ecrã
  useEffect(() => {
    function clicarFora(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", clicarFora);
    return () => document.removeEventListener("mousedown", clicarFora);
  }, []);

  // 1. DETETAR RUPTURA DE ESTOQUE
  const alertasRuptura = useMemo(() => {
    return materiais.filter(m => m.quantidade <= configuracoes.estoqueMinimoRuptura);
  }, [materiais, configuracoes.estoqueMinimoRuptura]);

  // 2. DETETAR FERRAMENTAS PERDIDAS (ATRASADAS)
  const alertasAtraso = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return emprestimos.filter(emp => {
      if (emp.status !== 'Pendente' || !emp.data_saida) return false;
      
      const partes = emp.data_saida.split('-');
      if (partes.length !== 3) return false;
      
      const dataSaida = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
      dataSaida.setHours(0, 0, 0, 0);
      
      const diffTempo = hoje.getTime() - dataSaida.getTime();
      const diffDias = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
      
      return diffDias >= configuracoes.diasAlertaPerda;
    });
  }, [emprestimos, configuracoes.diasAlertaPerda]);

  const totalAlertas = alertasRuptura.length + alertasAtraso.length;

  return (
    <div className="relative" ref={menuRef}>
      {/* BOTÃO DO SINO */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setAberto(!aberto)}
        className={`relative h-9 w-9 transition-colors ${aberto ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
      >
        <Bell className="size-5" />
        
        {/* A Bolinha Vermelha */}
        {totalAlertas > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm border border-white">
            {totalAlertas > 9 ? '9+' : totalAlertas}
          </span>
        )}
      </Button>
      
      {/* PAINEL FLUTUANTE (Renderizado apenas quando 'aberto' for true) */}
      {aberto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* CABEÇALHO DO MENU */}
          <div className="bg-gray-50/90 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <span className="font-semibold text-sm text-gray-800">Notificações</span>
            {totalAlertas > 0 ? (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none">{totalAlertas} pendências</Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-none">Tudo Limpo</Badge>
            )}
          </div>
          
          {/* CORPO DO MENU (Scrollable) */}
          <div className="max-h-[350px] overflow-y-auto">
            {totalAlertas === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center">
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="size-6 text-green-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">Nenhum alerta crítico</p>
                <p className="text-xs text-gray-500 mt-1">Sua ferramentaria está sob controle.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                
                {/* LISTA DE RUPTURAS */}
                {alertasRuptura.map(item => (
                  <div key={`rup-${item.id}`} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                    <div className="mt-0.5"><AlertTriangle className="size-4 text-red-500" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">Estoque Crítico: {item.nome}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Apenas <span className="font-bold text-red-600">{item.quantidade} unidades</span> disponíveis na prateleira.
                      </p>
                    </div>
                  </div>
                ))}

                {/* LISTA DE ATRASOS */}
                {alertasAtraso.map(emp => (
                  <div key={`atr-${emp.id}`} className="p-4 flex gap-3 hover:bg-gray-50 transition-colors">
                    <div className="mt-0.5"><Clock className="size-4 text-orange-500" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-tight">Retenção: {emp.usuario}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Retirou <span className="font-semibold">{emp.quantidade}x {emp.materialSolicitado}</span> há mais de {configuracoes.diasAlertaPerda} dias.
                      </p>
                    </div>
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}