"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Smartphone,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminData, Plate, PlateAdmin } from "./types";
import {
  Button,
  EmptyState,
  Field,
  inputClass,
  Modal,
  SectionTitle,
  StatusPill,
  textareaClass,
} from "./ui";
import { brl, paymentMethods, shortDate, statusLabel } from "./utils";

type Draft = {
  codigo: string;
  nome_empresa: string;
  nome_placa: string;
  link_google: string;
  ativa: boolean;
  cliente_id: string;
  status: string;
  data_compra: string;
  custo_compra: string;
  data_venda: string;
  preco_venda: string;
  data_instalacao: string;
  local_instalacao: string;
  contato_nome: string;
  contato_telefone: string;
  contato_email: string;
  forma_pagamento: string;
  parcelas: string;
  observacoes: string;
};

const initialDraft: Draft = {
  codigo: "",
  nome_empresa: "",
  nome_placa: "",
  link_google: "",
  ativa: true,
  cliente_id: "",
  status: "estoque",
  data_compra: new Date().toISOString().slice(0, 10),
  custo_compra: "19.90",
  data_venda: "",
  preco_venda: "100.00",
  data_instalacao: "",
  local_instalacao: "",
  contato_nome: "",
  contato_telefone: "",
  contato_email: "",
  forma_pagamento: "",
  parcelas: "1",
  observacoes: "",
};

function toDraft(plate: Plate, meta?: PlateAdmin): Draft {
  return {
    codigo: plate.codigo,
    nome_empresa: plate.nome_empresa,
    nome_placa: plate.nome_placa || "",
    link_google: plate.link_google,
    ativa: plate.ativa,
    cliente_id: meta?.cliente_id || "",
    status: meta?.status || "estoque",
    data_compra: meta?.data_compra || "",
    custo_compra: String(meta?.custo_compra ?? 0),
    data_venda: meta?.data_venda || "",
    preco_venda: String(meta?.preco_venda ?? 0),
    data_instalacao: meta?.data_instalacao || "",
    local_instalacao: meta?.local_instalacao || "",
    contato_nome: meta?.contato_nome || "",
    contato_telefone: meta?.contato_telefone || "",
    contato_email: meta?.contato_email || "",
    forma_pagamento: meta?.forma_pagamento || "",
    parcelas: String(meta?.parcelas || 1),
    observacoes: meta?.observacoes || "",
  };
}

export default function PlatesPanel({
  data,
  reload,
}: {
  data: AdminData;
  reload: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plate | null>(null);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const metaMap = useMemo(
    () => new Map(data.plateAdmin.map((meta) => [meta.placa_id, meta])),
    [data.plateAdmin],
  );

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return data.plates.filter((plate) => {
      const meta = metaMap.get(plate.id);
      const matchesQuery =
        !normalized ||
        [
          plate.codigo,
          plate.nome_empresa,
          plate.nome_placa || "",
          meta?.contato_nome || "",
          meta?.contato_telefone || "",
          meta?.contato_email || "",
          meta?.local_instalacao || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalized);

      const matchesFilter =
        filter === "todas" || (meta?.status || "estoque") === filter;

      return matchesQuery && matchesFilter;
    });
  }, [data.plates, metaMap, query, filter]);

  function openNew() {
    setEditing(null);
    setDraft(initialDraft);
    setMessage(null);
    setModalOpen(true);
  }

  function openEdit(plate: Plate) {
    setEditing(plate);
    setDraft(toDraft(plate, metaMap.get(plate.id)));
    setMessage(null);
    setModalOpen(true);
  }

  async function save() {
    setMessage(null);

    if (!draft.codigo.trim() || !draft.nome_empresa.trim() || !draft.link_google.trim()) {
      setMessage("Código, empresa e link do Google são obrigatórios.");
      return;
    }

    setSaving(true);

    const publicPayload = {
      codigo: draft.codigo.trim().toUpperCase(),
      nome_empresa: draft.nome_empresa.trim(),
      nome_placa: draft.nome_placa.trim() || null,
      link_google: draft.link_google.trim(),
      ativa: draft.ativa,
    };

    let plateId = editing?.id;

    if (editing) {
      const { error } = await supabase
        .from("placas")
        .update(publicPayload)
        .eq("id", editing.id);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("placas")
        .insert(publicPayload)
        .select("id")
        .single();

      if (error || !inserted) {
        setMessage(error?.message || "Não foi possível criar a placa.");
        setSaving(false);
        return;
      }

      plateId = inserted.id;
    }

    const privatePayload = {
      placa_id: plateId!,
      cliente_id: draft.cliente_id || null,
      status: draft.status,
      data_compra: draft.data_compra || null,
      custo_compra: Number(draft.custo_compra || 0),
      data_venda: draft.data_venda || null,
      preco_venda: Number(draft.preco_venda || 0),
      data_instalacao: draft.data_instalacao || null,
      local_instalacao: draft.local_instalacao.trim() || null,
      contato_nome: draft.contato_nome.trim() || null,
      contato_telefone: draft.contato_telefone.trim() || null,
      contato_email: draft.contato_email.trim() || null,
      forma_pagamento: draft.forma_pagamento || null,
      parcelas: Math.max(1, Number(draft.parcelas || 1)),
      observacoes: draft.observacoes.trim() || null,
    };

    const { error: metaError } = await supabase
      .from("placa_admin")
      .upsert(privatePayload, { onConflict: "placa_id" });

    if (metaError) {
      setMessage(metaError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setModalOpen(false);
    await reload();
  }

  const statusOptions = [
    "estoque",
    "reservada",
    "vendida",
    "instalada",
    "manutencao",
    "inativa",
  ];

  return (
    <div>
      <SectionTitle
        eyebrow="Operação"
        title="Placas."
        description="Cadastro, cliente, custo, venda, instalação, contato e destino de cada placa."
        action={
          <Button variant="green" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Nova placa
          </Button>
        }
      />

      <div className="mt-7 flex flex-col gap-3 border-b border-black/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[380px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar código, empresa, contato..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`${inputClass} md:w-[180px]`}
        >
          <option value="todas">Todos os status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {statusLabel[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-x-auto border border-black/10 bg-[#fffdf8]">
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Nenhuma placa encontrada"
              text="Crie sua primeira placa ou ajuste os filtros da pesquisa."
            />
          </div>
        ) : (
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.025] font-mono text-[9px] uppercase tracking-[0.12em] text-black/40">
                <th className="px-4 py-3">Placa</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cliente / contato</th>
                <th className="px-4 py-3">Compra</th>
                <th className="px-4 py-3">Venda</th>
                <th className="px-4 py-3">Instalação</th>
                <th className="px-4 py-3">Destino</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((plate) => {
                const meta = metaMap.get(plate.id);
                const client = data.clients.find((x) => x.id === meta?.cliente_id);

                return (
                  <tr
                    key={plate.id}
                    className="border-b border-black/[0.07] text-[12px] last:border-b-0 hover:bg-black/[0.015]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center bg-[#e5f2ec] text-[#0f8a62]">
                          <Smartphone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold">
                            {plate.nome_placa || plate.nome_empresa}
                          </p>
                          <p className="mt-1 font-mono text-[9px] text-black/35">
                            {plate.codigo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill value={meta?.status || "estoque"} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium">
                        {client?.empresa || client?.nome || meta?.contato_nome || "—"}
                      </p>
                      <p className="mt-1 text-[10px] text-black/40">
                        {meta?.contato_telefone || client?.whatsapp || client?.telefone || "Sem telefone"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{brl(meta?.custo_compra || 0)}</p>
                      <p className="mt-1 text-[10px] text-black/40">
                        {shortDate(meta?.data_compra)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{meta?.preco_venda ? brl(meta.preco_venda) : "—"}</p>
                      <p className="mt-1 text-[10px] text-black/40">
                        {shortDate(meta?.data_venda)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p>{shortDate(meta?.data_instalacao)}</p>
                      <p className="mt-1 max-w-[150px] truncate text-[10px] text-black/40">
                        {meta?.local_instalacao || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={plate.link_google}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f8a62]"
                      >
                        Google <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => openEdit(plate)}
                        className="inline-flex h-9 w-9 items-center justify-center border border-black/10 bg-white transition hover:border-black/25"
                        aria-label="Editar placa"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar placa" : "Nova placa"}
        description="Dados públicos da rota e informações privadas da operação."
        wide
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Código NFC">
            <input
              className={inputClass}
              value={draft.codigo}
              onChange={(e) => setDraft({ ...draft, codigo: e.target.value })}
              placeholder="EX: PPRT001"
            />
          </Field>

          <Field label="Status">
            <select
              className={inputClass}
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {statusLabel[status]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Empresa">
            <input
              className={inputClass}
              value={draft.nome_empresa}
              onChange={(e) => setDraft({ ...draft, nome_empresa: e.target.value })}
              placeholder="Nome do estabelecimento"
            />
          </Field>

          <Field label="Nome da placa">
            <input
              className={inputClass}
              value={draft.nome_placa}
              onChange={(e) => setDraft({ ...draft, nome_placa: e.target.value })}
              placeholder="Ex: Balcão principal"
            />
          </Field>

          <Field label="Link de avaliação do Google" className="md:col-span-2">
            <input
              className={inputClass}
              value={draft.link_google}
              onChange={(e) => setDraft({ ...draft, link_google: e.target.value })}
              placeholder="https://..."
            />
          </Field>

          <Field label="Cliente">
            <select
              className={inputClass}
              value={draft.cliente_id}
              onChange={(e) => setDraft({ ...draft, cliente_id: e.target.value })}
            >
              <option value="">Sem cliente vinculado</option>
              {data.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.empresa || client.nome}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Forma de pagamento">
            <select
              className={inputClass}
              value={draft.forma_pagamento}
              onChange={(e) => setDraft({ ...draft, forma_pagamento: e.target.value })}
            >
              <option value="">Não informado</option>
              {paymentMethods.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </Field>

          <Field label="Data de compra">
            <input
              type="date"
              className={inputClass}
              value={draft.data_compra}
              onChange={(e) => setDraft({ ...draft, data_compra: e.target.value })}
            />
          </Field>

          <Field label="Custo de compra">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={draft.custo_compra}
              onChange={(e) => setDraft({ ...draft, custo_compra: e.target.value })}
            />
          </Field>

          <Field label="Data de venda">
            <input
              type="date"
              className={inputClass}
              value={draft.data_venda}
              onChange={(e) => setDraft({ ...draft, data_venda: e.target.value })}
            />
          </Field>

          <Field label="Preço de venda">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={draft.preco_venda}
              onChange={(e) => setDraft({ ...draft, preco_venda: e.target.value })}
            />
          </Field>

          <Field label="Data de instalação">
            <input
              type="date"
              className={inputClass}
              value={draft.data_instalacao}
              onChange={(e) => setDraft({ ...draft, data_instalacao: e.target.value })}
            />
          </Field>

          <Field label="Local da instalação">
            <input
              className={inputClass}
              value={draft.local_instalacao}
              onChange={(e) => setDraft({ ...draft, local_instalacao: e.target.value })}
              placeholder="Ex: balcão, recepção..."
            />
          </Field>

          <Field label="Contato">
            <input
              className={inputClass}
              value={draft.contato_nome}
              onChange={(e) => setDraft({ ...draft, contato_nome: e.target.value })}
              placeholder="Nome da pessoa"
            />
          </Field>

          <Field label="Telefone / WhatsApp">
            <input
              className={inputClass}
              value={draft.contato_telefone}
              onChange={(e) => setDraft({ ...draft, contato_telefone: e.target.value })}
              placeholder="(21) ..."
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={draft.contato_email}
              onChange={(e) => setDraft({ ...draft, contato_email: e.target.value })}
            />
          </Field>

          <Field label="Parcelas">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={draft.parcelas}
              onChange={(e) => setDraft({ ...draft, parcelas: e.target.value })}
            />
          </Field>

          <Field label="Observações" className="md:col-span-2">
            <textarea
              className={textareaClass}
              value={draft.observacoes}
              onChange={(e) => setDraft({ ...draft, observacoes: e.target.value })}
              placeholder="Informações úteis sobre a venda, instalação ou cliente..."
            />
          </Field>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={draft.ativa}
              onChange={(e) => setDraft({ ...draft, ativa: e.target.checked })}
            />
            <span className="text-[12px] font-medium">
              Rota NFC ativa
            </span>
          </label>
        </div>

        {message && (
          <p className="mt-5 border border-[#a32929]/20 bg-[#a32929]/5 p-3 text-[11px] text-[#8d2020]">
            {message}
          </p>
        )}

        <div className="mt-7 flex justify-end gap-3 border-t border-black/10 pt-5">
          <Button variant="light" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="green" onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar placa"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
