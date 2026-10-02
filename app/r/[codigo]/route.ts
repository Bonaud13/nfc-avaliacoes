import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params;

  console.log("Código recebido:", codigo);

  const { data: placa, error } = await supabase
    .from("placas")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  console.log("Placa encontrada:", placa);
  console.log("Erro Supabase:", error);

  if (error) {
    return NextResponse.json(
      {
        erro: "Erro ao consultar Supabase",
        detalhe: error.message,
        codigo: error.code,
      },
      { status: 500 }
    );
  }

  if (!placa) {
    return NextResponse.json(
      {
        erro: "Placa não encontrada",
        codigoRecebido: codigo,
      },
      { status: 404 }
    );
  }

  if (!placa.ativa) {
    return NextResponse.json(
      { erro: "Placa está inativa" },
      { status: 403 }
    );
  }

  const { error: acessoError } = await supabase
    .from("acessos")
    .insert({
      placa_id: placa.id,
    });

  if (acessoError) {
    console.error("Erro ao registrar acesso:", acessoError);
  }

  return NextResponse.redirect(placa.link_google, 302);
}