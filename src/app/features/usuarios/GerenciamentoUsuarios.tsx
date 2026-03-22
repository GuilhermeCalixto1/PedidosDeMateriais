import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../../../utils/supabase/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Users, ShieldCheck, UserPlus, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

export function GerenciamentoUsuarios() {
  const { cadastrar, user } = useAuth();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("funcionario");
  const [processando, setProcessando] = useState(false);

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("usuarios_view")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setUsuarios(data);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const handleCadastrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !matricula || !senha)
      return toast.warning("Preencha todos os campos.");

    setProcessando(true);
    const { error } = await cadastrar(nome, matricula, senha, role);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Usuário criado com sucesso!");
      setNome("");
      setMatricula("");
      setSenha("");
      setRole("funcionario");
      carregarUsuarios();
    }
    setProcessando(false);
  };

  const handleExcluir = async (id: string, nomeUsr: string) => {
    if (id === user?.id)
      return toast.error("Você não pode excluir a sua própria conta!");
    if (!confirm(`Tem a certeza que deseja excluir o acesso de ${nomeUsr}?`))
      return;

    try {
      const { error } = await supabase.rpc("excluir_usuario", { user_id: id });
      if (error) throw error;
      toast.success("Usuário removido do sistema.");
      carregarUsuarios();
    } catch (err) {
      toast.error("Erro ao excluir usuário.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Users className="size-6 text-blue-600" /> Controle de Acessos
        </h2>
        <p className="text-gray-600 mt-1">
          Gira quem pode entrar no sistema e defina os seus níveis de permissão.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Cadastro */}
        <Card className="lg:col-span-1 shadow-sm border-t-4 border-t-blue-600 h-fit">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="size-5 text-blue-600" /> Cadastrar Novo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCadastrar} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Silva"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Matrícula (Login)</Label>
                <Input
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 54321"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Senha Provisória</Label>
                <Input
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  type="password"
                  placeholder="Mínimo 6 dígitos"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionario">
                      Funcionário (Comum)
                    </SelectItem>
                    <SelectItem value="admin">Administrador (Total)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                disabled={processando}
              >
                {processando ? "A criar..." : "Criar Acesso"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="size-5 text-gray-700" /> Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Usuário</th>
                    <th className="px-6 py-4 text-center">Nível</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuarios.map((usr) => (
                    <tr key={usr.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">
                          {usr.nome}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          Mat: {usr.matricula}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {usr.role === "admin" ? (
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50">
                            <Shield className="size-3 mr-1" /> Admin
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-gray-600 bg-white"
                          >
                            Funcionário
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExcluir(usr.id, usr.nome)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={usr.id === user?.id}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
