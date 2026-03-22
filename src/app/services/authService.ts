import { supabase } from "../../../utils/supabase/supabaseClient";
import { UsuarioLogado } from "../types/index";

// O domínio invisível fica agora escondido aqui no serviço
const DOMINIO_SISTEMA = "@ferramentaria.local";

export const authService = {
  // 1. Fazer Login
  async login(matricula: string, senha: string) {
    const emailFake = `${matricula}${DOMINIO_SISTEMA}`;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFake,
      password: senha,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        throw new Error("Matrícula ou senha incorretos.");
      }
      throw new Error("Erro ao fazer login: " + error.message);
    }
  },

  // 2. Fazer Cadastro (AGORA COM ROLE PADRÃO)
  async cadastrar(
    nome: string,
    matricula: string,
    senha: string,
    role: string,
  ) {
    const emailFake = `${matricula}${DOMINIO_SISTEMA}`;

    const { error } = await supabase.auth.signUp({
      email: emailFake,
      password: senha,
      options: {
        data: { nome, matricula, role },
      },
    });

    if (error) {
      if (error.message.includes("User already registered"))
        throw new Error("Esta matrícula já está registada.");
      throw new Error("Erro ao cadastrar: " + error.message);
    }
  },

  // 3. Fazer Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error("Erro ao fazer logout.");
  },

  // 4. Helper formatado (AGORA PUXA A ROLE DO BANCO)
  formatarUsuario(user: any): UsuarioLogado | null {
    if (!user) return null;
    return {
      id: user.id,
      nome: user.user_metadata?.nome || "Usuário",
      matricula: user.user_metadata?.matricula || "",
      // Puxa a role. Se não existir (contas antigas), assume 'funcionario'
      role: user.user_metadata?.role || "funcionario",
    };
  },

  // 5. Obter a sessão ao carregar a página
  async obterSessaoAtual() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return this.formatarUsuario(session?.user);
  },

  // 6. Escutar mudanças de Login/Logout
  observarEstadoAuth(callback: (usuario: UsuarioLogado | null) => void) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(this.formatarUsuario(session?.user));
    });
    return subscription;
  },
};
