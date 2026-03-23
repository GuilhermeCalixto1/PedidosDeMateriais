import React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  CheckCircle2,
  Clock,
  User,
  Building2,
  Calendar,
  Printer,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";

interface CartaoEmprestimoProps {
  grupo: any;
  onAbrirDevolucao: (item: any) => void;
  onApagarGrupo: (grupo: any) => void;
  onImprimirRecibo: (grupo: any) => void;
  processando: boolean;
}

export function CartaoEmprestimo({
  grupo,
  onAbrirDevolucao,
  onApagarGrupo,
  onImprimirRecibo,
  processando,
}: CartaoEmprestimoProps) {
  const { user } = useAuth(); // Puxa o utilizador para validar o cargo (role)

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "";
    const partes = dataStr.split("-");
    if (partes.length !== 3) return dataStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      {/* CABEÇALHO DO CARTÃO (Info do Funcionário e Ações de Admin) */}
      <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-md">
              <User className="size-4 text-blue-600" />
            </div>
            {grupo.usuario}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mt-2">
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5 text-gray-400" /> {grupo.gerencia}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="size-3.5 text-gray-400" />{" "}
              {formatarData(grupo.data_saida)}
            </span>
            <span className="flex items-center gap-1 font-medium text-blue-600">
              • {grupo.itens.length}{" "}
              {grupo.itens.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Geral do Cartão */}
          <Badge
            className={`px-3 py-1 text-xs uppercase tracking-wider font-semibold ${
              grupo.status === "Pendente"
                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                : "bg-green-100 text-green-800 border-green-200"
            }`}
          >
            {grupo.status === "Pendente" ? (
              <Clock className="size-3 mr-1.5" />
            ) : (
              <CheckCircle2 className="size-3 mr-1.5" />
            )}
            {grupo.status}
          </Badge>

          {/* Botão de Impressão (Apenas leitura ou Admin) */}
          <Button
            variant="ghost"
            size="icon"
            title="Imprimir Recibo"
            onClick={() => onImprimirRecibo(grupo)}
            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          >
            <Printer className="size-4" />
          </Button>

          {/* PROTEÇÃO: Botão de Apagar só aparece se for PENDENTE e se o utilizador for ADMIN */}
          {grupo.status === "Pendente" && user?.role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              title="Apagar este cartão (Admin)"
              onClick={() => onApagarGrupo(grupo)}
              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
              disabled={processando}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* LISTA DE ITENS DENTRO DO CARTÃO */}
      <div className="divide-y divide-gray-100">
        {grupo.itens.map((item: any) => (
          <div
            key={item.id}
            className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/20 transition-colors"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`p-2.5 rounded-lg border ${
                  item.material_categoria === "mecanico"
                    ? "bg-orange-50 border-orange-100 text-orange-600"
                    : "bg-purple-50 border-purple-100 text-purple-600"
                }`}
              >
                {item.material_categoria === "mecanico" ? (
                  <Wrench className="size-5" />
                ) : (
                  <Zap className="size-5" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {item.materialSolicitado}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <Badge variant="outline" className="text-xs bg-white">
                    Qtd: {item.quantidade}
                  </Badge>

                  {item.observacao && (
                    <span className="text-xs text-gray-500 italic border-l pl-3">
                      Obs: {item.observacao}
                    </span>
                  )}

                  {item.status === "Devolvido" && item.data_devolucao && (
                    <span className="text-xs text-green-600 font-medium border-l pl-3 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Devolvido em{" "}
                      {formatarData(item.data_devolucao)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Ação de Devolver Item (Disponível para todos, mas só se estiver pendente) */}
            {item.status === "Pendente" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAbrirDevolucao(item)}
                className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
                disabled={processando}
              >
                Devolver Item
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
