import { createClient } from "@supabase/supabase-js";

// O Vite exige o prefixo VITE_ para expor variáveis ao código do cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
