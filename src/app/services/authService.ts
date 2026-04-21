import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../../utils/supabase/supabaseClient";
import { UsuarioLogado } from "../types/index";

// Variáveis de ambiente configuradas no seu ficheiro .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const DOMINIO_SISTEMA = "@ferramentaria.local";

export const authService = {
  async login(matricula: string, senha: string) {
    const emailFake = `${matricula}${DOMINIO_SISTEMA}`;
    const { error } = await supabase.auth.signInWithPassword({
      email: emailFake,
      password: senha,
    });
    if (error) throw new Error("Matrícula ou senha incorretos.");
  },

  async cadastrar(
    nome: string,
    matricula: string,
    senha: string,
    role: string,
  ) {
    const emailFake = `${matricula}${DOMINIO_SISTEMA}`;

    // Utiliza o createClient com as variáveis de ambiente para o registo
    // Isso evita que a sessão do administrador seja encerrada ao criar novos utilizadores
    const tempClient = createClient(supabaseUrl, publicAnonKey, {
      auth: { persistSession: false },
    });

    const { error } = await tempClient.auth.signUp({
      email: emailFake,
      password: senha,
      options: { data: { nome, matricula, role } },
    });
    if (error) throw new Error(error.message);
  },

  async mudarSenha(novaSenha: string) {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) throw new Error(error.message);
  },

  async logout() {
    await supabase.auth.signOut();
  },

  formatarUsuario(user: any): UsuarioLogado | null {
    if (!user) return null;
    return {
      id: user.id,
      nome: user.user_metadata?.nome || "Usuário",
      matricula: user.user_metadata?.matricula || "",
      role: user.user_metadata?.role || "funcionario",
    };
  },

  async obterSessaoAtual() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return this.formatarUsuario(session?.user);
  },

  observarEstadoAuth(callback: (usuario: UsuarioLogado | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(this.formatarUsuario(session?.user));
    });
    return subscription;
  },
};
