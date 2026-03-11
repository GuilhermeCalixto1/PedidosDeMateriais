import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Monta a URL automaticamente usando o seu Project ID
const supabaseUrl = `https://${projectId}.supabase.co`;

// Cria e exporta o cliente para ser usado nos Contextos
export const supabase = createClient(supabaseUrl, publicAnonKey);