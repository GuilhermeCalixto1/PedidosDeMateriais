import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

// O Supabase sempre monta a URL nesse formato usando o Project ID
const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);
