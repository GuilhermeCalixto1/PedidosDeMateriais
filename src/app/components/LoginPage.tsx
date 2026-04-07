import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./Logo";

export function LoginPage() {
  const { login } = useAuth();
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula || !senha)
      return toast.warning("Por favor, preencha todos os campos.");

    setCarregando(true);
    const { error } = await login(matricula, senha);

    if (error) {
      toast.error(error);
      setCarregando(false);
    } else {
      toast.success("Bem-vindo ao Sistema de Ferramentaria!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="p-3 bg-gray-100  rounded-xl mb-4 shadow-lg">
          <Logo className="size-16" />
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acesso Restrito - Faça login com a sua matrícula
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-xl border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>Insira as suas credenciais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Matrícula</Label>
                <Input
                  type="text"
                  placeholder="Matrícula: CSO123 | Senha: abc123"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  disabled={carregando}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-md py-6"
                disabled={carregando || !matricula || !senha}
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 size-5 animate-spin" />A validar...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
