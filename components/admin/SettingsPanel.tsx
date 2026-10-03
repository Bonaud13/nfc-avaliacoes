"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Field, inputClass, Panel, SectionTitle } from "./ui";

export default function SettingsPanel() {
  const [company, setCompany] = useState("PPRT.IA");
  const [salePrice, setSalePrice] = useState("100");
  const [costPrice, setCostPrice] = useState("19.90");
  const [minStock, setMinStock] = useState("5");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("configuracoes").select("*");
      if (!data) return;

      const empresa = data.find((x) => x.chave === "empresa")?.valor as any;
      const venda = data.find((x) => x.chave === "venda")?.valor as any;
      const estoque = data.find((x) => x.chave === "estoque")?.valor as any;

      if (empresa?.nome) setCompany(String(empresa.nome));
      if (venda?.preco_padrao !== undefined) setSalePrice(String(venda.preco_padrao));
      if (venda?.custo_padrao !== undefined) setCostPrice(String(venda.custo_padrao));
      if (estoque?.alerta_minimo !== undefined) setMinStock(String(estoque.alerta_minimo));
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);

    const rows = [
      {
        chave: "empresa",
        valor: { nome: company, moeda: "BRL" },
        atualizado_em: new Date().toISOString(),
      },
      {
        chave: "venda",
        valor: {
          preco_padrao: Number(salePrice || 0),
          custo_padrao: Number(costPrice || 0),
        },
        atualizado_em: new Date().toISOString(),
      },
      {
        chave: "estoque",
        valor: { alerta_minimo: Number(minStock || 0) },
        atualizado_em: new Date().toISOString(),
      },
    ];

    const { error } = await supabase
      .from("configuracoes")
      .upsert(rows, { onConflict: "chave" });

    setSaving(false);
    setMessage(error ? error.message : "Configurações salvas.");
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Configurações"
        title="Regras da operação."
        description="Valores padrão e parâmetros usados como referência no painel."
      />

      <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_.8fr]">
        <Panel className="p-5 md:p-7">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Negócio</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Nome da empresa" className="md:col-span-2">
              <input
                className={inputClass}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </Field>

            <Field label="Preço padrão de venda">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
              />
            </Field>

            <Field label="Custo padrão da placa">
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </Field>

            <Field label="Alerta mínimo de estoque">
              <input
                type="number"
                min="0"
                className={inputClass}
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
              />
            </Field>
          </div>

          {message && (
            <p className="mt-5 border border-black/10 bg-white p-3 text-[11px] text-black/55">
              {message}
            </p>
          )}

          <div className="mt-6">
            <Button variant="green" onClick={save} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </Panel>

        <Panel className="p-5 md:p-7">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Integrações</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Supabase", "Banco, autenticação e métricas"],
              ["GitHub", "Commits e GitHub Actions"],
              ["PageSpeed", "Performance, SEO e acessibilidade"],
              ["Vercel", "Deploy automático via GitHub"],
            ].map(([name, text]) => (
              <div key={name} className="border-t border-black/10 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-bold">{name}</p>
                    <p className="mt-1 text-[10px] text-black/40">{text}</p>
                  </div>
                  <span className="h-2 w-2 bg-[#0f8a62]" />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
