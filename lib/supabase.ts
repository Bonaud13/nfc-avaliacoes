import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não encontrada");
}

if (!supabaseKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada");
}

console.log("Supabase URL válida:", /^https?:\/\//.test(supabaseUrl));
console.log("Tamanho da URL:", supabaseUrl.length);
console.log("Tem /rest/v1:", supabaseUrl.includes("/rest/v1"));
console.log("Tem espaço:", supabaseUrl.includes(" "));

export const supabase = createClient(supabaseUrl, supabaseKey);