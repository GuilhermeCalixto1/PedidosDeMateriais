// src/app/features/estoque/GerenciamentoMateriais.tsx

import React, { useState, useMemo } from "react";
import { Plus, Download, FileText, Mail, Package } from "lucide-react";
import { toast } from "sonner";

import { useMateriais } from "../../contexts/MateriaisContext";
import { useEmprestimos } from "../../contexts/EmprestimosContext";
import { useAuth } from "../../contexts/AuthContext"; // <-- Importado
import { Button } from "../../components/ui/button";
import { FiltrosEstoque } from "./components/FiltrosEstoque";
import { TabelaEstoque } from "./components/TabelaEstoque";
import { ModalNovoMaterial } from "./components/ModalNovoMaterial";
import { exportarParaExcel } from "../../utils/exportador";

export function GerenciamentoMateriais() {
  const {
    materiais,
    carregando,
    adicionarMaterial,
    excluirMaterial,
    atualizarQuantidade,
  } = useMateriais();
  const { emprestimos } = useEmprestimos();
  const { user } = useAuth(); // <-- Puxa o utilizador

  const [mostrarDialogNovo, setMostrarDialogNovo] = useState(false);
  const [buscaTexto, setBuscaTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<
    "todas" | "mecanico" | "eletrico"
  >("todas");

  const materiaisFiltrados = useMemo(() => {
    let resultado = materiais;
    if (buscaTexto.trim() !== "") {
      resultado = resultado.filter((m) =>
        m.nome.toLowerCase().includes(buscaTexto.toLowerCase()),
      );
    }
    if (filtroCategoria !== "todas") {
      resultado = resultado.filter((m) => m.categoria === filtroCategoria);
    }
    return resultado;
  }, [materiais, buscaTexto, filtroCategoria]);

  const materiaisComTotais = useMemo(() => {
    const PREFIXO_AVARIA = "[AVARIA]";

    return materiaisFiltrados.map((m) => {
      const pendentes = emprestimos.filter(
        (e) => e.status === "Pendente" && e.materialSolicitado === m.nome,
      );
      const emUso = pendentes.reduce(
        (acc, curr) => acc + (Number(curr.quantidade) || 0),
        0,
      );

      const devolvidosAvariados = emprestimos.filter(
        (e) =>
          e.status === "Devolvido" &&
          e.materialSolicitado === m.nome &&
          (e.observacao || "").includes(PREFIXO_AVARIA),
      );
      const avariadas = devolvidosAvariados.reduce(
        (acc, curr) => acc + (Number(curr.quantidade) || 0),
        0,
      );

      return {
        ...m,
        emUso,
        avariadas,
        total: m.quantidade + emUso + avariadas,
      };
    });
  }, [materiaisFiltrados, emprestimos]);

  const handleExcluir = async (id: string, nome: string) => {
    if (confirm(`Deseja realmente excluir "${nome}"?`)) {
      try {
        await excluirMaterial(id);
        toast.success(`"${nome}" foi removido.`);
      } catch (error) {
        toast.error(`Erro ao remover "${nome}".`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="size-6 text-blue-600" /> Inventário de Materiais
          </h2>
          <p className="text-gray-600 mt-1">
            Visão completa do patrimônio de ferramentas
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Apenas Admins podem adicionar ferramentas */}
          {user?.role === "admin" && (
            <Button
              onClick={() => setMostrarDialogNovo(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              <Plus className="size-5 mr-2" /> Adicionar Ferramenta
            </Button>
          )}
        </div>
      </div>

      <div className="print:hidden">
        <FiltrosEstoque
          buscaTexto={buscaTexto}
          setBuscaTexto={setBuscaTexto}
          filtroCategoria={filtroCategoria}
          setFiltroCategoria={setFiltroCategoria}
        />
      </div>

      <TabelaEstoque
        materiais={materiaisComTotais}
        carregando={carregando}
        onAtualizarQuantidade={atualizarQuantidade}
        onExcluir={handleExcluir}
      />

      <ModalNovoMaterial
        aberto={mostrarDialogNovo}
        onFechar={() => setMostrarDialogNovo(false)}
        adicionarMaterial={adicionarMaterial}
      />
    </div>
  );
}
