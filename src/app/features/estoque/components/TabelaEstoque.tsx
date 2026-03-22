import React, { useState } from "react";
import { Material } from "../../../types";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Package,
  Wrench,
  Zap,
  Trash2,
  Edit,
  AlertTriangle,
  Search,
} from "lucide-react";
import { ModalEditarMaterial } from "./ModalEditarMaterial";
import { formatarMoeda } from "../../../utils/formatters";

interface TabelaEstoqueProps {
  materiais: Material[];
  carregando: boolean;
  onAtualizarQuantidade: (id: string, novaQuantidade: number) => Promise<void>;
  onExcluir: (id: string, nome: string) => Promise<void>;
}

export function TabelaEstoque({
  materiais,
  carregando,
  onAtualizarQuantidade,
  onExcluir,
}: TabelaEstoqueProps) {
  const { user } = useAuth(); // Puxa o utilizador logado para validar permissões
  const [materialParaEditar, setMaterialParaEditar] = useState<Material | null>(
    null,
  );

  if (carregando) {
    return (
      <div className="p-8 text-center text-gray-500">
        A carregar inventário...
      </div>
    );
  }

  if (materiais.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Search className="size-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Nenhuma ferramenta encontrada
        </h3>
        <p className="text-gray-500">
          Tente ajustar os filtros de busca ou adicione um novo material.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Ferramenta</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-center">Património Total</th>
                <th className="px-6 py-4 text-center">Em Uso (Rua)</th>
                <th className="px-6 py-4 text-center">
                  Disponível (Prateleira)
                </th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materiais.map((material) => (
                <tr
                  key={material.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {material.nome}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">
                      ID: {material.id.substring(0, 8)}
                    </div>

                    {/* Renderiza o valor monetário formatado apenas se a ferramenta tiver um valor registado */}
                    {material.valor_unitario !== undefined &&
                      material.valor_unitario !== null && (
                        <div className="text-xs text-emerald-600 font-medium mt-1">
                          {formatarMoeda(material.valor_unitario)}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`capitalize ${
                        material.categoria === "mecanico"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {material.categoria === "mecanico" ? (
                        <Wrench className="size-3 mr-1" />
                      ) : (
                        <Zap className="size-3 mr-1" />
                      )}
                      {material.categoria}
                    </Badge>
                  </td>

                  {/* Património Total */}
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      {material.total || material.quantidade}
                    </span>
                  </td>

                  {/* Em Uso (Rua) */}
                  <td className="px-6 py-4 text-center">
                    {(material.emUso || 0) > 0 ? (
                      <span className="font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                        {material.emUso}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  {/* Disponível (Prateleira) */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`font-bold text-lg ${material.quantidade === 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {material.quantidade}
                      </span>
                      {material.quantidade <= 2 && (
                        <AlertTriangle
                          className={`size-4 ${material.quantidade === 0 ? "text-red-500" : "text-orange-500"}`}
                        />
                      )}
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Botão de Editar (Visível para todos, permite ajustar stock na prateleira) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMaterialParaEditar(material)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Ajustar Quantidade"
                      >
                        <Edit className="size-4" />
                      </Button>

                      {/* Botão de Excluir (Protegido: Visível APENAS para Administradores) */}
                      {user?.role === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onExcluir(material.id, material.nome)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Remover Ferramenta do Sistema"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Editar a Quantidade (Abre quando clicamos no lápis) */}
      <ModalEditarMaterial
        material={materialParaEditar}
        onFechar={() => setMaterialParaEditar(null)}
      />
    </>
  );
}
