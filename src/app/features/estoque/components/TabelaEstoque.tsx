// src/app/features/estoque/components/TabelaEstoque.tsx

import React, { useState } from "react";
import { Material } from "../../../types";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Wrench, Zap, Trash2, Edit, AlertTriangle, Search } from "lucide-react";
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
  const { user } = useAuth();
  const [materialParaEditar, setMaterialParaEditar] = useState<Material | null>(
    null,
  );

  if (carregando)
    return (
      <div className="p-8 text-center text-gray-500">
        A carregar inventário...
      </div>
    );

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
                <th className="px-6 py-4 text-center">Avariadas em Estoque</th>
                <th className="px-6 py-4 text-center">Disponível</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {materiais.map((material) => (
                <tr
                  key={material.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {material.nome}
                    <div className="text-xs text-gray-400 font-mono">
                      ID: {material.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="capitalize">
                      {material.categoria === "mecanico" ? (
                        <Wrench className="size-3 mr-1" />
                      ) : (
                        <Zap className="size-3 mr-1" />
                      )}
                      {material.categoria}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center font-bold">
                    {material.total || material.quantidade}
                  </td>
                  <td className="px-6 py-4 text-center text-yellow-600 font-semibold">
                    {material.emUso || 0}
                  </td>
                  <td className="px-6 py-4 text-center text-red-600 font-semibold">
                    {material.avariadas || 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`font-bold ${material.quantidade === 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {material.quantidade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Apenas Admins podem EDITAR ou EXCLUIR manualmente */}
                      {user?.role === "admin" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaterialParaEditar(material)}
                            className="text-blue-600"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              onExcluir(material.id, material.nome)
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Leitura
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ModalEditarMaterial
        material={materialParaEditar}
        onFechar={() => setMaterialParaEditar(null)}
      />
    </>
  );
}
