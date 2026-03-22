import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { KeyRound, ShieldCheck } from "lucide-react";

interface ModalAlterarSenhaProps {
  aberto: boolean;
  onFechar: () => void;
}

export function ModalAlterarSenha({
  aberto,
  onFechar,
}: ModalAlterarSenhaProps) {
  const { mudarSenha, logout } = useAuth();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [processando, setProcessando] = useState(false);

  const handleSalvar = async () => {
    if (senha.length < 6) return toast.warning("Mínimo de 6 caracteres.");
    if (senha !== confirmar) return toast.error("As senhas não coincidem.");

    setProcessando(true);

    try {
      const { error } = await mudarSenha(senha);

      if (error) {
        toast.error("Erro: " + error);
        setProcessando(false); // Destrava o botão se houver erro
      } else {
        toast.success("Senha atualizada! Reiniciando sessão...");
        setSenha("");
        setConfirmar("");
        setProcessando(false); // Destrava antes de sair
        setTimeout(() => logout(), 1500);
      }
    } catch (err) {
      toast.error("Ocorreu um erro inesperado.");
      setProcessando(false);
    }
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(o) => !o && !processando && onFechar()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="text-blue-600" /> Alterar Minha Senha
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg text-amber-800 text-sm flex gap-2">
            <ShieldCheck className="size-5 shrink-0" />
            <p>
              Por segurança, você será desconectado para validar o novo acesso
              com a senha nova.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Nova Senha</Label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={processando}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmar</Label>
            <Input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              disabled={processando}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={processando}>
            Cancelar
          </Button>
          <Button
            onClick={handleSalvar}
            disabled={processando}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {processando ? "A salvar..." : "Salvar Senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
