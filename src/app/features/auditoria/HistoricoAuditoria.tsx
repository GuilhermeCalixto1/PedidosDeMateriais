import React, { useState } from 'react';
import { useAuditoria } from '../../contexts/AuditoriaContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ShieldCheck, Search, Package, ClipboardList, Settings, Clock } from 'lucide-react';

export function HistoricoAuditoria() {
  const { logs } = useAuditoria();
  const [busca, setBusca] = useState('');

  // Motor de pesquisa em tempo real (Procura por pessoa, ação ou detalhes)
  const logsFiltrados = logs.filter(log => 
    log.usuario.toLowerCase().includes(busca.toLowerCase()) ||
    log.acao.toLowerCase().includes(busca.toLowerCase()) ||
    log.detalhes.toLowerCase().includes(busca.toLowerCase())
  );

  const formatarDataHora = (isoString: string) => {
    const data = new Date(isoString);
    return new Intl.DateTimeFormat('pt-PT', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit', second: '2-digit' 
    }).format(data);
  };

  const getIconeModulo = (modulo: string) => {
    switch (modulo) {
      case 'Inventário': return <Package className="size-4 text-blue-500" />;
      case 'Empréstimos': return <ClipboardList className="size-4 text-green-500" />;
      case 'Configurações': return <Settings className="size-4 text-orange-500" />;
      default: return <Settings className="size-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck className="size-6 text-indigo-600" />
          Histórico e Auditoria
        </h2>
        <p className="text-gray-600 mt-1">Registo inalterável de todas as atividades e modificações no sistema.</p>
      </div>

      <Card className="shadow-sm border-t-4 border-t-indigo-600">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-gray-800">Logs do Sistema</CardTitle>
            <CardDescription>Acompanhe quem fez o quê, e quando.</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input 
              placeholder="Buscar por pessoa ou ação..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logsFiltrados.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Clock className="size-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium text-gray-900">Nenhum registo encontrado</p>
              <p className="text-sm text-gray-500 mt-1">As atividades do sistema aparecerão aqui assim que ocorrerem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Data e Hora</th>
                    <th className="px-6 py-4 font-semibold">Utilizador</th>
                    <th className="px-6 py-4 font-semibold">Módulo</th>
                    <th className="px-6 py-4 font-semibold">Ação</th>
                    <th className="px-6 py-4 font-semibold">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logsFiltrados.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                        {formatarDataHora(log.data_hora)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {log.usuario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getIconeModulo(log.modulo)}
                          <span className="font-medium text-gray-700">{log.modulo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-white text-gray-700 font-semibold border-gray-200">
                          {log.acao}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.detalhes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}