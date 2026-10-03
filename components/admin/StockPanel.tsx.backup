"use client";

import { useMemo, useState } from "react";
import {
  Boxes,
  PackageCheck,
  PackageOpen,
  Plus,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { AdminData } from "./types";
import { brl, shortDate } from "./utils";
import {
  Button,
  EmptyState,
  Field,
  inputClass,
  Modal,
  Panel,
  SectionTitle,
  StatusPill,
} from "./ui";

type BatchDraft = {
  quantity: string;
  prefix: string;
  start: string;
  nameBase: string;
  dataCompra: string;
  custoUnitario: string;
};

const initialBatch: BatchDraft = {
  quantity: "15",
  prefix: "PPRT",
  start: "1",
  nameBase: "Placa PPRT",
  dataCompra: new Date().toISOString().slice(0, 10),
  custoUnitario: "19.90",
};

function moneyNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function StockPanel({
  data,
  reload,
}: {
  data: AdminData;
  reload: () => Promise<void>;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [batch, setBatch] = useState<BatchDraft>(initialBatch);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const metaMap = useMemo(
    () => new Map(data.plateAdmin.map((x) => [x.placa_id, x])),
    [data.plateAdmin],
  );

  const stock = useMemo(
    () =>
      data.plates
        .map((plate) => ({
          plate,
          meta: metaMap.get(plate.id),
        }))
        .filter(
          (row) =>
            (row.meta?.status || "estoque") === "estoque",
        ),
    [data.plates, metaMap],
  );

  const reserved = data.plateAdmin.filter(
    (x) => x.status === "reservada",
  ).length;

  const installed = data.plateAdmin.filter(
    (x) => x.status === "instalada",
  ).length;

  const totalCost = stock.reduce(
    (sum, row) =>
      sum + Number(row.meta?.custo_compra || 0),
    0,
  );

  const averageCost = stock.length
    ? totalCost / stock.length
    : 0;

  const quantity = Math.max(
    1,
    Math.min(100, Number(batch.quantity) || 1),
  );

  const startNumber = Math.max(
    1,
    Number(batch.start) || 1,
  );

  const normalizedPrefix =
    batch.prefix
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") || "PPRT";

  const previewCodes = useMemo(() => {
    return Array.from({ length: quantity }, (_, index) => {
      const number = startNumber + index;

      return `${normalizedPrefix}${String(number).padStart(
        3,
        "0",
      )}`;
    });
  }, [quantity, startNumber, normalizedPrefix]);

  async function registerBatch() {
    setMessage(null);
    setSuccess(null);

    const cost = moneyNumber(batch.custoUnitario);

    if (!batch.dataCompra) {
      setMessage("Informe a data da compra.");
      return;
    }

    if (quantity < 1) {
      setMessage("Informe pelo menos uma placa.");
      return;
    }

    const existingCodes = new Set(
      data.plates.map((plate) =>
        plate.codigo.toUpperCase(),
      ),
    );

    const duplicates = previewCodes.filter((code) =>
      existingCodes.has(code),
    );

    if (duplicates.length > 0) {
      setMessage(
        `Já existem placas com estes códigos: ${duplicates
          .slice(0, 5)
          .join(", ")}${
          duplicates.length > 5 ? "..." : ""
        }`,
      );

      return;
    }

    setSaving(true);

    /*
      Placas de estoque ficam INATIVAS.
      A rota NFC só deve ser ativada quando a placa
      for configurada para um cliente.
    */
    const fallbackUrl = window.location.origin;

    const publicRows = previewCodes.map(
      (codigo, index) => ({
        codigo,
        nome_empresa: "PPRT.IA",
        nome_placa: `${batch.nameBase.trim() || "Placa"} ${String(
          startNumber + index,
        ).padStart(3, "0")}`,
        link_google: fallbackUrl,
        ativa: false,
      }),
    );

    const {
      data: insertedPlates,
      error: platesError,
    } = await supabase
      .from("placas")
      .insert(publicRows)
      .select("id, codigo");

    if (platesError || !insertedPlates) {
      setMessage(
        platesError?.message ||
          "Não foi possível cadastrar as placas.",
      );
      setSaving(false);
      return;
    }

    const privateRows = insertedPlates.map(
      (plate) => ({
        placa_id: plate.id,
        status: "estoque",
        data_compra: batch.dataCompra,
        custo_compra: cost,
        preco_venda: 0,
        parcelas: 1,
        observacoes:
          "Entrada de estoque cadastrada em lote pelo painel.",
      }),
    );

    const { error: adminError } = await supabase
      .from("placa_admin")
      .insert(privateRows);

    if (adminError) {
      /*
        Se a parte administrativa falhar,
        remove as placas públicas criadas
        para não deixar cadastro pela metade.
      */
      await supabase
        .from("placas")
        .delete()
        .in(
          "id",
          insertedPlates.map((plate) => plate.id),
        );

      setMessage(adminError.message);
      setSaving(false);
      return;
    }

    await reload();

    setSaving(false);
    setModalOpen(false);

    setSuccess(
      `${quantity} ${
        quantity === 1 ? "placa cadastrada" : "placas cadastradas"
      } no estoque com sucesso.`,
    );

    setBatch({
      ...initialBatch,
      start: String(startNumber + quantity),
    });
  }

  const cards = [
    {
      label: "Disponíveis",
      value: stock.length,
      note: "prontas para venda",
      icon: Boxes,
    },
    {
      label: "Reservadas",
      value: reserved,
      note: "separadas para clientes",
      icon: PackageOpen,
    },
    {
      label: "Instaladas",
      value: installed,
      note: "em operação",
      icon: PackageCheck,
    },
    {
      label: "Valor em estoque",
      value: brl(totalCost),
      note: `custo médio ${brl(averageCost)}`,
      icon: ShieldAlert,
    },
  ];

  return (
    <div>
      <SectionTitle
        eyebrow="Estoque"
        title="Seu estoque."
        description="Controle as placas físicas que estão com você antes da venda e instalação."
        action={
          <Button
            variant="dark"
            onClick={() => {
              setMessage(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Cadastrar placas
          </Button>
        }
      />

      {success && (
        <div className="mt-5 border-l-2 border-[#0f8a62] bg-white px-4 py-3 text-[12px] font-medium text-[#0f6f51]">
          {success}
        </div>
      )}

      {/* KPIs MAIS LIMPOS */}
      <div className="mt-8 grid border-y border-black/10 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className={`py-6 sm:px-6 ${
                index > 0
                  ? "sm:border-l sm:border-black/10"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/40">
                  {card.label}
                </p>

                <Icon className="h-4 w-4 text-black/30" />
              </div>

              <p className="mt-5 text-[36px] font-bold tracking-[-0.055em] text-[#111]">
                {card.value}
              </p>

              <p className="mt-1 text-[11px] text-black/40">
                {card.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold tracking-[-0.035em]">
            Placas disponíveis
          </h2>

          <p className="mt-1 text-[12px] text-black/40">
            Cada unidade cadastrada fisicamente no seu estoque.
          </p>
        </div>

        <p className="text-[12px] font-semibold text-black/45">
          {stock.length}{" "}
          {stock.length === 1 ? "unidade" : "unidades"}
        </p>
      </div>

      <Panel className="mt-5 overflow-x-auto">
        {stock.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="Sem placas em estoque"
              text="Use o botão Cadastrar placas para registrar as unidades que você tem em mãos."
            />
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.02] text-[10px] uppercase tracking-[0.08em] text-black/35">
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Placa</th>
                <th className="px-5 py-4">Compra</th>
                <th className="px-5 py-4">Custo</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {stock.map(({ plate, meta }) => (
                <tr
                  key={plate.id}
                  className="border-b border-black/[0.06] text-[12px] transition last:border-b-0 hover:bg-black/[0.015]"
                >
                  <td className="px-5 py-4 font-mono text-[10px]">
                    {plate.codigo}
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    {plate.nome_placa ||
                      plate.nome_empresa}
                  </td>

                  <td className="px-5 py-4 text-black/60">
                    {shortDate(meta?.data_compra)}
                  </td>

                  <td className="px-5 py-4">
                    {brl(
                      meta?.custo_compra || 0,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <StatusPill value="estoque" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* MODAL DE ENTRADA EM LOTE */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
          }
        }}
        title="Cadastrar placas"
        description="Registre várias placas físicas de uma só vez."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Quantidade">
            <input
              type="number"
              min="1"
              max="100"
              value={batch.quantity}
              onChange={(e) =>
                setBatch({
                  ...batch,
                  quantity: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Custo por placa">
            <input
              type="text"
              inputMode="decimal"
              value={batch.custoUnitario}
              onChange={(e) =>
                setBatch({
                  ...batch,
                  custoUnitario: e.target.value,
                })
              }
              className={inputClass}
              placeholder="19,90"
            />
          </Field>

          <Field label="Prefixo do código">
            <input
              value={batch.prefix}
              onChange={(e) =>
                setBatch({
                  ...batch,
                  prefix: e.target.value,
                })
              }
              className={inputClass}
              placeholder="PPRT"
            />
          </Field>

          <Field label="Número inicial">
            <input
              type="number"
              min="1"
              value={batch.start}
              onChange={(e) =>
                setBatch({
                  ...batch,
                  start: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>

          <Field
            label="Nome base"
            className="sm:col-span-2"
          >
            <input
              value={batch.nameBase}
              onChange={(e) =>
                setBatch({
                  ...batch,
                  nameBase: e.target.value,
                })
              }
              className={inputClass}
              placeholder="Placa PPRT"
            />
          </Field>

          <Field
            label="Data da compra"
            className="sm:col-span-2"
          >
            <input
              type="date"
              value={batch.dataCompra}
              onChange={(e) =>
                setBatch({
                  ...batch,
                  dataCompra: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>

        {/* RESUMO */}
        <div className="mt-7 border-y border-black/10 py-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-black/35">
                Unidades
              </p>

              <p className="mt-2 text-[24px] font-bold">
                {quantity}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-black/35">
                Custo unitário
              </p>

              <p className="mt-2 text-[24px] font-bold">
                {brl(
                  moneyNumber(
                    batch.custoUnitario,
                  ),
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-black/35">
                Custo do lote
              </p>

              <p className="mt-2 text-[24px] font-bold">
                {brl(
                  quantity *
                    moneyNumber(
                      batch.custoUnitario,
                    ),
                )}
              </p>
            </div>
          </div>
        </div>

        {/* PREVIEW DOS CÓDIGOS */}
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.08em] text-black/35">
            Códigos que serão criados
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {previewCodes
              .slice(0, 8)
              .map((code) => (
                <span
                  key={code}
                  className="border border-black/10 bg-white px-3 py-2 font-mono text-[10px]"
                >
                  {code}
                </span>
              ))}

            {previewCodes.length > 8 && (
              <span className="px-2 py-2 text-[10px] text-black/40">
                + {previewCodes.length - 8} códigos
              </span>
            )}
          </div>

          {previewCodes.length > 1 && (
            <p className="mt-3 text-[11px] text-black/40">
              De {previewCodes[0]} até{" "}
              {previewCodes[
                previewCodes.length - 1
              ]}
            </p>
          )}
        </div>

        <div className="mt-6 border-l-2 border-[#111] pl-4">
          <p className="text-[11px] leading-5 text-black/50">
            As placas entram como{" "}
            <strong className="text-black">
              Em estoque
            </strong>{" "}
            e com a rota NFC desativada. Quando uma
            placa for vendida, você configura a
            empresa, o link do Google e ativa a rota.
          </p>
        </div>

        {message && (
          <div className="mt-5 border-l-2 border-[#a32929] bg-[#a32929]/5 px-4 py-3 text-[11px] text-[#922d2d]">
            {message}
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="light"
            disabled={saving}
            onClick={() =>
              setModalOpen(false)
            }
          >
            Cancelar
          </Button>

          <Button
            variant="dark"
            disabled={saving}
            onClick={registerBatch}
          >
            <Plus className="h-4 w-4" />

            {saving
              ? "Cadastrando..."
              : `Cadastrar ${quantity} ${
                  quantity === 1
                    ? "placa"
                    : "placas"
                }`}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
