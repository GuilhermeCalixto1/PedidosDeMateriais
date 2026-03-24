import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useEmprestimos } from "../../contexts/EmprestimosContext";
import { useMateriais } from "../../contexts/MateriaisContext";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Plus,
  Package,
  Printer,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  Wrench,
  Zap,
  PackageOpen,
  Download,
  FileText,
  Mail,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

// Importação do Exportador Excel
import { exportarParaExcel } from "../../utils/exportador";

// Componentes Importados
import { FormularioSaida } from "./components/FormularioSaida";
import { TabelaImpressao } from "./components/TabelaImpressao";
import { FiltrosEmprestimo } from "./components/FiltrosEmprestimo";
import { ModalDevolucao } from "./components/ModalDevolucao";
import { ReciboImpressao } from "./components/ReciboImpressao";

export function ControleFerramentaria() {
  const { user } = useAuth(); // <-- Puxamos o utilizador logado para validar o cargo
  const {
    emprestimos,
    marcarComoDevolvido,
    excluirEmprestimoPendente,
    carregando,
  } = useEmprestimos();
  const { recarregarMateriais } = useMateriais();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"todos" | "Pendente" | "Devolvido">(
    "Pendente",
  );
  const [processando, setProcessando] = useState(false);

  const [grupoParaImprimir, setGrupoParaImprimir] = useState<any>(null);

  // ESTADO DE PAGINAÇÃO: 20 cartões visíveis
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(20);

  useEffect(() => {
    const handleAfterPrint = () => setGrupoParaImprimir(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  // Estados para os Filtros
  const [buscaTexto, setBuscaTexto] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroGerencia, setFiltroGerencia] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");

  // Resetar a quantidade visível sempre que um filtro ou aba mudar
  useEffect(() => {
    setQuantidadeVisivel(20);
  }, [abaAtiva, buscaTexto, filtroDataInicio, filtroDataFim, filtroGerencia, filtroCategoria]);

  // Estados para a Devolução
  const [emprestimoParaDevolver, setEmprestimoParaDevolver] =
    useState<any>(null);
  const [dataDevolucao, setDataDevolucao] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [matriculaRecebedor, setMatriculaRecebedor] = useState("");

  // 1. FILTRAGEM ROBUSTA
  const emprestimosFiltrados = useMemo(() => {
    let resultado = emprestimos;
    if (abaAtiva === "Pendente")
      resultado = resultado.filter((e) => e.status === "Pendente");
    else if (abaAtiva === "Devolvido")
      resultado = resultado.filter((e) => e.status === "Devolvido");

    if (buscaTexto.trim() !== "") {
      const termoBusca = buscaTexto.toLowerCase();
      resultado = resultado.filter(
        (e) =>
          (e.usuario && e.usuario.toLowerCase().includes(termoBusca)) ||
          (e.materialSolicitado &&
            e.materialSolicitado.toLowerCase().includes(termoBusca)),
      );
    }
    if (filtroDataInicio !== "" || filtroDataFim !== "") {
      resultado = resultado.filter((e) => {
        if (!e.data_saida) return false;
        const dataEmprestimo = e.data_saida.split("T")[0];
        if (filtroDataInicio !== "" && filtroDataFim !== "")
          return (
            dataEmprestimo >= filtroDataInicio &&
            dataEmprestimo <= filtroDataFim
          );
        else if (filtroDataInicio !== "")
          return dataEmprestimo === filtroDataInicio;
        else if (filtroDataFim !== "") return dataEmprestimo === filtroDataFim;
        return true;
      });
    }
    if (filtroGerencia.trim() !== "") {
      const termoGerencia = filtroGerencia.toLowerCase();
      resultado = resultado.filter(
        (e) => e.gerencia && e.gerencia.toLowerCase().includes(termoGerencia),
      );
    }
    if (filtroCategoria !== "todas") {
      resultado = resultado.filter(
        (e) => e.material_categoria === filtroCategoria,
      );
    }
    return resultado;
  }, [
    emprestimos,
    abaAtiva,
    buscaTexto,
    filtroDataInicio,
    filtroDataFim,
    filtroGerencia,
    filtroCategoria,
  ]);

  // 2. AGRUPAMENTO VISUAL
  const gruposDeEmprestimo = useMemo(() => {
    const mapa = new Map<string, any>();
    emprestimosFiltrados.forEach((emp) => {
      const chave = `${emp.usuario}|${emp.data_saida}|${emp.status}`;
      if (!mapa.has(chave)) {
        mapa.set(chave, {
          id: chave,
          usuario: emp.usuario,
          data_saida: emp.data_saida,
          gerencia: emp.gerencia || "Não informada",
          status: emp.status,
          itens: [],
        });
      }
      mapa.get(chave).itens.push(emp);
    });
    return Array.from(mapa.values()).sort(
      (a, b) =>
        new Date(b.data_saida).getTime() - new Date(a.data_saida).getTime(),
    );
  }, [emprestimosFiltrados]);

  // 3. CARTÕES VISÍVEIS (PAGINAÇÃO)
  const gruposVisiveis = gruposDeEmprestimo.slice(0, quantidadeVisivel);

  // Helpers
  const pendentesParaImprimir = useMemo(
    () => emprestimosFiltrados.filter((e) => e.status === "Pendente"),
    [emprestimosFiltrados],
  );
  const contadores = useMemo(
    () => ({
      todos: emprestimos.length,
      pendente: emprestimos.filter((e) => e.status === "Pendente").length,
      devolvido: emprestimos.filter((e) => e.status === "Devolvido").length,
    }),
    [emprestimos],
  );
  const temFiltroAtivo =
    buscaTexto !== "" ||
    filtroDataInicio !== "" ||
    filtroDataFim !== "" ||
    filtroGerencia !== "" ||
    filtroCategoria !== "todas";

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "";
    const partes = dataStr.split("-");
    if (partes.length !== 3) return dataStr;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  const limparFiltros = () => {
    setBuscaTexto("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
    setFiltroGerencia("");
    setFiltroCategoria("todas");
  };

  const abrirModalDevolucao = (emprestimo: any) => {
    setEmprestimoParaDevolver(emprestimo);
    if (user) {
      setNomeRecebedor(user.nome);
      setMatriculaRecebedor(user.matricula);
    }
    setDataDevolucao(new Date().toISOString().split("T")[0]);
  };

  const confirmarDevolucao = async () => {
    if (!emprestimoParaDevolver || !nomeRecebedor || !matriculaRecebedor)
      return;
    setProcessando(true);
    try {
      await marcarComoDevolvido(emprestimoParaDevolver, {
        data_devolucao: dataDevolucao,
        responsavel_recebimento: `${nomeRecebedor} (Mat: ${matriculaRecebedor})`,
      });
      if (recarregarMateriais) await recarregarMateriais();
      toast.success(
        `"${emprestimoParaDevolver.materialSolicitado}" devolvido com sucesso!`,
      );
      setEmprestimoParaDevolver(null);
      setNomeRecebedor("");
      setMatriculaRecebedor("");
    } catch (error) {
      toast.error("Erro ao registar devolução.");
    } finally {
      setProcessando(false);
    }
  };

  const apagarCartaoPendente = async (grupo: any) => {
    if (grupo.status !== "Pendente") return;

    if (user?.role !== "admin") {
      toast.error(
        "Acesso negado: Apenas administradores podem apagar registos.",
      );
      return;
    }

    const totalItens = grupo.itens.length;
    const confirmado = window.confirm(
      `Deseja apagar este cartão pendente com ${totalItens} item(ns)? Esta ação corrige lançamento incorreto e devolve as quantidades ao estoque.`,
    );
    if (!confirmado) return;

    setProcessando(true);
    try {
      for (const item of grupo.itens) {
        await excluirEmprestimoPendente(item);
      }
      if (recarregarMateriais) await recarregarMateriais();
      toast.success("Cartão pendente apagado com sucesso.");
    } catch (error) {
      toast.error("Erro ao apagar cartão pendente.");
    } finally {
      setProcessando(false);
    }
  };

  const handleImprimirListaGeral = () => {
    setGrupoParaImprimir(null);
    setTimeout(() => window.print(), 100);
  };

  const handleImprimirReciboIndividual = (grupo: any) => {
    setGrupoParaImprimir(grupo);
    setTimeout(() => window.print(), 100);
  };

  const handleExportarExcel = () => {
    const colunas = {
      usuario: "Funcionário / Solicitante",
      gerencia: "Gerência / Setor",
      materialSolicitado: "Ferramenta Retirada",
      material_categoria: "Categoria",
      quantidade: "Qtd.",
      data_saida: "Data de Saída",
      status: "Status Atual",
      data_devolucao: "Data de Devolução",
      observacao: "Observações",
    };
    exportarParaExcel(emprestimosFiltrados, "Relatorio_Emprestimos", colunas);
    toast.success("Ficheiro Excel gerado com sucesso!");
  };

  const handleEnviarEmail = () => {
    const preview = emprestimosFiltrados
      .slice(0, 20)
      .map((item) => {
        const gerencia = item.gerencia || "Não informada";
        return `${item.usuario} | Gerência: ${gerencia} | ${item.materialSolicitado} | Qtd: ${item.quantidade} | ${item.status}`;
      })
      .join("\n");

    const corpo = [
      "Segue o resumo de emprestimos (com os filtros atuais):",
      "",
      preview || "Sem dados para o filtro atual.",
      "",
      "Obs: para anexar arquivo, exporte em Excel e anexe manualmente no e-mail.",
    ].join("\n");

    const mailto = `mailto:?subject=${encodeURIComponent("Relatorio de Emprestimos")}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailto;
    toast.info("Cliente de e-mail aberto com o resumo.");
  };

  if (carregando)
    return (
      <div className="p-8 text-center text-gray-500">
        A carregar dados do sistema...
      </div>
    );

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">
              Empréstimos de Ferramentas
            </h2>
            <p className="text-gray-600 mt-1">
              Gerencie saídas e devoluções de materiais
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              onClick={handleImprimirListaGeral}
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <FileText className="size-4 mr-2 text-red-600" />
              PDF / Imprimir
            </Button>

            <Button
              onClick={handleExportarExcel}
              variant="outline"
              className="bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
            >
              <Download className="size-4 mr-2 text-green-600" />
              Excel
            </Button>

            <Button
              onClick={handleEnviarEmail}
              variant="outline"
              className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
            >
              <Mail className="size-4 mr-2 text-blue-600" />
              E-mail
            </Button>

            <Button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="size-5 mr-2" /> Nova Saída
            </Button>
          </div>
        </div>

        {/* Abas */}
        <Tabs
          value={abaAtiva}
          onValueChange={(v) => setAbaAtiva(v as typeof abaAtiva)}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="Pendente">
              Pendentes ({contadores.pendente})
            </TabsTrigger>
            <TabsTrigger value="Devolvido">
              Devolvidos ({contadores.devolvido})
            </TabsTrigger>
            <TabsTrigger value="todos">Todos ({contadores.todos})</TabsTrigger>
          </TabsList>

          <FiltrosEmprestimo
            buscaTexto={buscaTexto}
            setBuscaTexto={setBuscaTexto}
            filtroDataInicio={filtroDataInicio}
            setFiltroDataInicio={setFiltroDataInicio}
            filtroDataFim={filtroDataFim}
            setFiltroDataFim={setFiltroDataFim}
            filtroGerencia={filtroGerencia}
            setFiltroGerencia={setFiltroGerencia}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            temFiltroAtivo={temFiltroAtivo}
            limparFiltros={limparFiltros}
          />

          <TabsContent value={abaAtiva} className="mt-0">
            {gruposDeEmprestimo.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="py-12 text-center">
                  <PackageOpen className="size-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Nenhum empréstimo encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Não há resultados para exibir com os filtros atuais.
                  </p>
                  {temFiltroAtivo && (
                    <Button variant="outline" onClick={limparFiltros}>
                      Limpar Filtros
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {gruposVisiveis.map((grupo) => (
                  <div
                    key={grupo.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                  >
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
                            <Building2 className="size-3.5 text-gray-400" />{" "}
                            {grupo.gerencia}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Imprimir Recibo Assinado"
                          onClick={() => handleImprimirReciboIndividual(grupo)}
                          className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                        >
                          <Printer className="size-4" />
                        </Button>

                        {grupo.status === "Pendente" &&
                          user?.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Apagar cartão pendente (Apenas Admin)"
                              onClick={() => apagarCartaoPendente(grupo)}
                              className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                              disabled={processando}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                      </div>
                    </div>

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
                              <div className="flex items-center gap-3 mt-1">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-white"
                                >
                                  Qtd: {item.quantidade}
                                </Badge>
                                {item.observacao && (
                                  <span className="text-xs text-gray-500 italic border-l pl-3">
                                    Obs: {item.observacao}
                                  </span>
                                )}
                                {item.status === "Devolvido" &&
                                  item.data_devolucao && (
                                    <span className="text-xs text-green-600 font-medium border-l pl-3 flex items-center gap-1">
                                      <CheckCircle2 className="size-3" />{" "}
                                      Devolvido em{" "}
                                      {formatarData(item.data_devolucao)}
                                    </span>
                                  )}
                                {item.status === "Devolvido" &&
                                  item.responsavel_recebimento && (
                                    <span className="text-xs text-blue-700 font-medium border-l pl-3">
                                      Recebido por:{" "}
                                      {item.responsavel_recebimento}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>

                          {item.status === "Pendente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalDevolucao(item)}
                              className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              Devolver Item
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* BOTÃO DE CARREGAR MAIS CARTÕES */}
            {quantidadeVisivel < gruposDeEmprestimo.length && (
              <div className="flex justify-center mt-6 mb-2">
                <Button 
                  variant="outline" 
                  onClick={() => setQuantidadeVisivel(prev => prev + 20)}
                  className="w-full max-w-md border-dashed border-2 hover:bg-gray-50 text-gray-600 font-medium py-6"
                >
                  Mostrar mais cartões...
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {emprestimosFiltrados.length > 0 && (
          <div className="text-center text-sm text-gray-500 pb-4">
            Exibindo {gruposVisiveis.length} de {gruposDeEmprestimo.length} cartões (Total de {emprestimosFiltrados.length} ferramentas)
          </div>
        )}

        {mostrarFormulario && (
          <FormularioSaida onFechar={() => setMostrarFormulario(false)} />
        )}
      </div>

      <ModalDevolucao
        emprestimo={emprestimoParaDevolver}
        dataDevolucao={dataDevolucao}
        setDataDevolucao={setDataDevolucao}
        nomeRecebedor={nomeRecebedor}
        matriculaRecebedor={matriculaRecebedor}
        processando={processando}
        onConfirmar={confirmarDevolucao}
        onCancelar={() => setEmprestimoParaDevolver(null)}
      />

      {grupoParaImprimir ? (
        <ReciboImpressao grupo={grupoParaImprimir} />
      ) : (
        <TabelaImpressao
          pendentes={pendentesParaImprimir}
          temFiltroAtivo={temFiltroAtivo}
        />
      )}
    </>
  );
}