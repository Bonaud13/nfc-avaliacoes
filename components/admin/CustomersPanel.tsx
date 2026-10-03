"use client";

import { useMemo, useState } from "react";
import { Mail, Pencil, Phone, Plus, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminData, Client } from "./types";
import {
  Button,
  EmptyState,
  Field,
  inputClass,
  Modal,
  SectionTitle,
  textareaClass,
} from "./ui";
import { brl } from "./utils";

type ClientDraft = {
  nome: string;
  empresa: string;
  telefone: string;
  whatsapp: string;
  email: string;
  documento: string;
  endereco: string;
  observacoes: string;
};

const initialDraft: ClientDraft = {
  nome: "",
  empresa: "",
  telefone: "",
  whatsapp: "",
  email: "",
  documento: "",
  endereco: "",
  observacoes: "",
};

function draftFromClient(client: Client): ClientDraft {
  return {
    nome: client.nome,
    empresa: client.empresa || "",
    telefone: client.telefone || "",
    whatsapp: client.whatsapp || "",
    email: client.email || "",
    documento: client.documento || "",
    endereco: client.endereco || "",
    observacoes: client.observacoes || "",
  };
}

export default function CustomersPanel({
  data,
  reload,
}: {
  data: AdminData;
  reload: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [draft, setDraft] = useState<ClientDraft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.clients;

    return data.clients.filter((client) =>
      [
        client.nome,
        client.empresa || "",
        client.telefone || "",
        client.whatsapp || "",
        client.email || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [data.clients, query]);

  function openNew() {
    setEditing(null);
    setDraft(initialDraft);
    setMessage(null);
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setDraft(draftFromClient(client));
    setMessage(null);
    setOpen(true);
  }

  async function save() {
    if (!draft.nome.trim()) {
      setMessage("Nome é obrigatório.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      nome: draft.nome.trim(),
      empresa: draft.empresa.trim() || null,
      telefone: draft.telefone.trim() || null,
      whatsapp: draft.whatsapp.trim() || null,
      email: draft.email.trim() || null,
      documento: draft.documento.trim() || null,
      endereco: draft.endereco.trim() || null,
      observacoes: draft.observacoes.trim() || null,
    };

    const response = editing
      ? await supabase.from("clientes").update(payload).eq("id", editing.id)
      : await supabase.from("clientes").insert(payload);

    if (response.error) {
      setMessage(response.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    await reload();
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Relacionamento"
        title="Clientes."
        description="Quem comprou, onde trabalha, como entrar em contato e quais placas estão vinculadas."
        action={
          <Button variant="green" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Novo cliente
          </Button>
        }
      />

      <div className="relative mt-7 max-w-[420px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
        <input
          className={`${inputClass} pl-10`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente, empresa ou contato..."
        />
      </div>

      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="Nenhum cliente cadastrado"
            text="Cadastre os clientes para vincular placas, vendas, pagamentos e histórico."
          />
        ) : (
          <div className="grid border-l border-t border-black/10 lg:grid-cols-2">
            {rows.map((client) => {
              const customerPlates = data.plateAdmin.filter(
                (x) => x.cliente_id === client.id,
              );
              const customerSales = data.sales.filter(
                (x) => x.cliente_id === client.id && x.status !== "cancelado",
              );
              const revenue = customerSales.reduce(
                (sum, sale) => sum + Number(sale.valor_total || 0),
                0,
              );

              return (
                <article
                  key={client.id}
                  className="border-b border-r border-black/10 bg-[#fffdf8] p-5 md:p-6"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0f8a62]">
                        {client.empresa || "Cliente"}
                      </p>
                      <h2 className="mt-2 text-[23px] font-black tracking-[-0.04em]">
                        {client.nome}
                      </h2>
                    </div>
                    <button
                      onClick={() => openEdit(client)}
                      className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    <p className="flex items-center gap-2 text-[11px] text-black/55">
                      <Phone className="h-3.5 w-3.5" />
                      {client.whatsapp || client.telefone || "Sem telefone"}
                    </p>
                    <p className="flex items-center gap-2 text-[11px] text-black/55">
                      <Mail className="h-3.5 w-3.5" />
                      {client.email || "Sem email"}
                    </p>
                  </div>

                  <div className="mt-7 grid grid-cols-3 border-l border-t border-black/10">
                    <div className="border-b border-r border-black/10 p-3">
                      <p className="text-[22px] font-black">{customerPlates.length}</p>
                      <p className="mt-1 text-[9px] text-black/35">placas</p>
                    </div>
                    <div className="border-b border-r border-black/10 p-3">
                      <p className="text-[22px] font-black">{customerSales.length}</p>
                      <p className="mt-1 text-[9px] text-black/35">vendas</p>
                    </div>
                    <div className="border-b border-r border-black/10 p-3">
                      <p className="truncate text-[15px] font-black">{brl(revenue)}</p>
                      <p className="mt-1 text-[9px] text-black/35">receita</p>
                    </div>
                  </div>

                  {client.observacoes && (
                    <p className="mt-5 border-t border-black/10 pt-4 text-[11px] leading-5 text-black/45">
                      {client.observacoes}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar cliente" : "Novo cliente"}
        description="Dados de contato e relacionamento."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nome" className="md:col-span-2">
            <input
              className={inputClass}
              value={draft.nome}
              onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
            />
          </Field>
          <Field label="Empresa">
            <input
              className={inputClass}
              value={draft.empresa}
              onChange={(e) => setDraft({ ...draft, empresa: e.target.value })}
            />
          </Field>
          <Field label="Documento">
            <input
              className={inputClass}
              value={draft.documento}
              onChange={(e) => setDraft({ ...draft, documento: e.target.value })}
            />
          </Field>
          <Field label="Telefone">
            <input
              className={inputClass}
              value={draft.telefone}
              onChange={(e) => setDraft({ ...draft, telefone: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              className={inputClass}
              value={draft.whatsapp}
              onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
            />
          </Field>
          <Field label="Email" className="md:col-span-2">
            <input
              type="email"
              className={inputClass}
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </Field>
          <Field label="Endereço" className="md:col-span-2">
            <input
              className={inputClass}
              value={draft.endereco}
              onChange={(e) => setDraft({ ...draft, endereco: e.target.value })}
            />
          </Field>
          <Field label="Observações" className="md:col-span-2">
            <textarea
              className={textareaClass}
              value={draft.observacoes}
              onChange={(e) => setDraft({ ...draft, observacoes: e.target.value })}
            />
          </Field>
        </div>

        {message && (
          <p className="mt-5 border border-[#a32929]/20 bg-[#a32929]/5 p-3 text-[11px] text-[#8d2020]">
            {message}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3 border-t border-black/10 pt-5">
          <Button variant="light" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="green" onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar cliente"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
