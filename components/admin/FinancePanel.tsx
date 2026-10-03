"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Plus,
  ReceiptText,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/lib/supabase";
import type { AdminData } from "./types";
import {
  Button,
  Field,
  inputClass,
  Modal,
  Panel,
  SectionTitle,
  StatusPill,
  textareaClass,
} from "./ui";
import { brl, paymentMethods, shortDate } from "./utils";

function monthKey(date: string) {
  return date.slice(0, 7);
}

function buildFinanceSeries(data: AdminData) {
  const now = new Date();
  const months = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(d),
      receita: 0,
      despesas: 0,
    };
  });

  const map = new Map(months.map((x) => [x.key, x]));

  for (const sale of data.sales) {
    if (sale.status === "cancelado") continue;
    const row = map.get(monthKey(sale.data_venda));
    if (row) row.receita += Number(sale.valor_total || 0);
  }

  for (const expense of data.expenses) {
    const row = map.get(monthKey(expense.data));
    if (row) row.despesas += Number(expense.valor || 0);
  }

  return months;
}

export default function FinancePanel({
  data,
  reload,
}: {
  data: AdminData;
  reload: () => Promise<void>;
}) {
  const [saleOpen, setSaleOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [sale, setSale] = useState({
    cliente_id: "",
    placa_id: "",
    data_venda: new Date().toISOString().slice(0, 10),
    valor_total: "100.00",
    desconto: "0",
    forma_pagamento: "Pix",
    status: "pago",
    observacoes: "",
  });

  const [expense, setExpense] = useState({
    data: new Date().toISOString().slice(0, 10),
    categoria: "Estoque",
    descricao: "",
    valor: "",
    forma_pagamento: "Pix",
    recorrente: false,
    observacoes: "",
  });

  const revenue = data.sales
    .filter((x) => x.status !== "cancelado")
    .reduce((sum, x) => sum + Number(x.valor_total || 0), 0);

  const expenses = data.expenses.reduce((sum, x) => sum + Number(x.valor || 0), 0);
  const result = revenue - expenses;

  const receivable = data.payments
    .filter((x) => ["pendente", "atrasado"].includes(x.status))
    .reduce((sum, x) => sum + Number(x.valor || 0), 0);

  const financeSeries = useMemo(() => buildFinanceSeries(data), [data]);

  const methodRows = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data.sales) {
      if (row.status === "cancelado") continue;
      const key = row.forma_pagamento || "Não informado";
      map.set(key, (map.get(key) || 0) + Number(row.valor_total || 0));
    }

    return Array.from(map.entries())
      .map(([method, total]) => ({ method, total }))
      .sort((a, b) => b.total - a.total);
  }, [data.sales]);

  async function saveSale() {
    if (!sale.valor_total || Number(sale.valor_total) <= 0) {
      setMessage("Informe o valor da venda.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const total = Number(sale.valor_total);
    const discount = Number(sale.desconto || 0);

    const { data: created, error } = await supabase
      .from("vendas")
      .insert({
        cliente_id: sale.cliente_id || null,
        data_venda: sale.data_venda,
        subtotal: total + discount,
        desconto: discount,
        valor_total: total,
        forma_pagamento: sale.forma_pagamento || null,
        status: sale.status,
        observacoes: sale.observacoes.trim() || null,
      })
      .select("id")
      .single();

    if (error || !created) {
      setMessage(error?.message || "Não foi possível registrar a venda.");
      setSaving(false);
      return;
    }

    if (sale.placa_id) {
      const plateId = Number(sale.placa_id);
      const meta = data.plateAdmin.find((x) => x.placa_id === plateId);

      await supabase.from("venda_itens").insert({
        venda_id: created.id,
        placa_id: plateId,
        descricao: "Placa NFC PPRT",
        quantidade: 1,
        custo_unitario: Number(meta?.custo_compra || 0),
        preco_unitario: total,
      });

      await supabase
        .from("placa_admin")
        .upsert(
          {
            placa_id: plateId,
            cliente_id: sale.cliente_id || meta?.cliente_id || null,
            status: "vendida",
            data_venda: sale.data_venda,
            preco_venda: total,
            forma_pagamento: sale.forma_pagamento || null,
            parcelas: meta?.parcelas || 1,
            custo_compra: Number(meta?.custo_compra || 0),
          },
          { onConflict: "placa_id" },
        );
    }

    if (sale.status !== "pago") {
      await supabase.from("pagamentos").insert({
        venda_id: created.id,
        cliente_id: sale.cliente_id || null,
        descricao: "Venda de placa NFC",
        valor: total,
        forma_pagamento: sale.forma_pagamento || null,
        status: "pendente",
        vencimento: sale.data_venda,
      });
    }

    setSaving(false);
    setSaleOpen(false);
    await reload();
  }

  async function saveExpense() {
    if (!expense.descricao.trim() || Number(expense.valor) <= 0) {
      setMessage("Descrição e valor são obrigatórios.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase.from("despesas").insert({
      data: expense.data,
      categoria: expense.categoria,
      descricao: expense.descricao.trim(),
      valor: Number(expense.valor),
      forma_pagamento: expense.forma_pagamento || null,
      recorrente: expense.recorrente,
      observacoes: expense.observacoes.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setExpenseOpen(false);
    await reload();
  }

  const availablePlates = data.plates.filter((plate) => {
    const meta = data.plateAdmin.find((x) => x.placa_id === plate.id);
    return !meta || ["estoque", "reservada"].includes(meta.status);
  });

  return (
    <div>
      <SectionTitle
        eyebrow="Financeiro"
        title="Dinheiro sob controle."
        description="Receita, despesas, recebimentos, formas de pagamento e margem operacional."
        action={
          <div className="flex gap-2">
            <Button variant="light" onClick={() => { setMessage(null); setExpenseOpen(true); }}>
              <ArrowDownRight className="h-4 w-4" />
              Despesa
            </Button>
            <Button variant="green" onClick={() => { setMessage(null); setSaleOpen(true); }}>
              <Plus className="h-4 w-4" />
              Registrar venda
            </Button>
          </div>
        }
      />

      <div className="mt-7 grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Receita", value: brl(revenue), icon: ArrowUpRight },
          { label: "Despesas", value: brl(expenses), icon: ArrowDownRight },
          { label: "Resultado", value: brl(result), icon: Wallet },
          { label: "A receber", value: brl(receivable), icon: CreditCard },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="border-b border-r border-black/10 bg-[#fffdf8] p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">{card.label}</p>
                <Icon className="h-4 w-4 text-[#0f8a62]" />
              </div>
              <p className="mt-8 text-[29px] font-black tracking-[-0.055em]">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.3fr_.7fr]">
        <Panel className="p-5 md:p-7">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Fluxo dos últimos 6 meses</h2>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeSeries}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,.07)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "rgba(0,0,0,.4)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "rgba(0,0,0,.35)" }} width={52} />
                <Tooltip
                  formatter={(value) => brl(Number(value))}
                  contentStyle={{
                    borderRadius: 0,
                    border: "1px solid rgba(0,0,0,.12)",
                    background: "#fffdf8",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="receita" fill="#0f8a62" radius={0} />
                <Bar dataKey="despesas" fill="#b7b0a4" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5 md:p-7">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Formas de pagamento</h2>
          <div className="mt-5">
            {methodRows.length === 0 ? (
              <p className="py-10 text-[12px] text-black/40">Nenhuma venda registrada.</p>
            ) : (
              methodRows.map((row, index) => (
                <div key={row.method} className="border-t border-black/10 py-4">
                  <div className="flex items-center justify-between text-[12px]">
                    <span>{row.method}</span>
                    <strong>{brl(row.total)}</strong>
                  </div>
                  <div className="mt-2 h-1 bg-black/[0.06]">
                    <div
                      className="h-full bg-[#0f8a62]"
                      style={{
                        width: `${Math.max(
                          8,
                          (row.total / (methodRows[0]?.total || 1)) * 100,
                        )}%`,
                        opacity: 1 - index * 0.12,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <Panel className="overflow-x-auto">
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <h2 className="text-[20px] font-black tracking-[-0.04em]">Últimas vendas</h2>
            <ReceiptText className="h-4 w-4 text-[#0f8a62]" />
          </div>
          <table className="w-full min-w-[620px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-black/10 font-mono text-[8px] uppercase tracking-[0.12em] text-black/40">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.sales.slice(0, 8).map((row) => {
                const client = data.clients.find((x) => x.id === row.cliente_id);
                return (
                  <tr key={row.id} className="border-b border-black/[0.07] last:border-b-0">
                    <td className="px-4 py-3">{shortDate(row.data_venda)}</td>
                    <td className="px-4 py-3 font-medium">{client?.empresa || client?.nome || "—"}</td>
                    <td className="px-4 py-3">{row.forma_pagamento || "—"}</td>
                    <td className="px-4 py-3"><StatusPill value={row.status} /></td>
                    <td className="px-4 py-3 text-right font-bold">{brl(row.valor_total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <Panel className="overflow-x-auto">
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <h2 className="text-[20px] font-black tracking-[-0.04em]">Últimas despesas</h2>
            <ArrowDownRight className="h-4 w-4 text-[#a32929]" />
          </div>
          <table className="w-full min-w-[560px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-black/10 font-mono text-[8px] uppercase tracking-[0.12em] text-black/40">
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {data.expenses.slice(0, 8).map((row) => (
                <tr key={row.id} className="border-b border-black/[0.07] last:border-b-0">
                  <td className="px-4 py-3">{shortDate(row.data)}</td>
                  <td className="px-4 py-3 font-medium">{row.descricao}</td>
                  <td className="px-4 py-3">{row.categoria}</td>
                  <td className="px-4 py-3 text-right font-bold">{brl(row.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Modal open={saleOpen} onClose={() => setSaleOpen(false)} title="Registrar venda" description="Registre a venda e, se quiser, vincule uma placa do estoque.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Cliente" className="md:col-span-2">
            <select className={inputClass} value={sale.cliente_id} onChange={(e) => setSale({ ...sale, cliente_id: e.target.value })}>
              <option value="">Sem cliente</option>
              {data.clients.map((client) => (
                <option key={client.id} value={client.id}>{client.empresa || client.nome}</option>
              ))}
            </select>
          </Field>
          <Field label="Placa do estoque" className="md:col-span-2">
            <select className={inputClass} value={sale.placa_id} onChange={(e) => setSale({ ...sale, placa_id: e.target.value })}>
              <option value="">Venda sem placa vinculada</option>
              {availablePlates.map((plate) => (
                <option key={plate.id} value={plate.id}>{plate.codigo} — {plate.nome_placa || plate.nome_empresa}</option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input type="date" className={inputClass} value={sale.data_venda} onChange={(e) => setSale({ ...sale, data_venda: e.target.value })} />
          </Field>
          <Field label="Valor final">
            <input type="number" step="0.01" className={inputClass} value={sale.valor_total} onChange={(e) => setSale({ ...sale, valor_total: e.target.value })} />
          </Field>
          <Field label="Desconto">
            <input type="number" step="0.01" className={inputClass} value={sale.desconto} onChange={(e) => setSale({ ...sale, desconto: e.target.value })} />
          </Field>
          <Field label="Forma de pagamento">
            <select className={inputClass} value={sale.forma_pagamento} onChange={(e) => setSale({ ...sale, forma_pagamento: e.target.value })}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select className={inputClass} value={sale.status} onChange={(e) => setSale({ ...sale, status: e.target.value })}>
              <option value="orcamento">Orçamento</option>
              <option value="pendente">Pendente</option>
              <option value="parcial">Parcial</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>
          <Field label="Observações" className="md:col-span-2">
            <textarea className={textareaClass} value={sale.observacoes} onChange={(e) => setSale({ ...sale, observacoes: e.target.value })} />
          </Field>
        </div>

        {message && <p className="mt-5 border border-[#a32929]/20 bg-[#a32929]/5 p-3 text-[11px] text-[#8d2020]">{message}</p>}

        <div className="mt-7 flex justify-end gap-3 border-t border-black/10 pt-5">
          <Button variant="light" onClick={() => setSaleOpen(false)}>Cancelar</Button>
          <Button variant="green" onClick={saveSale} disabled={saving}>{saving ? "Salvando..." : "Registrar venda"}</Button>
        </div>
      </Modal>

      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Registrar despesa" description="Custos de estoque, domínio, ferramentas, entrega, marketing e outros.">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Data">
            <input type="date" className={inputClass} value={expense.data} onChange={(e) => setExpense({ ...expense, data: e.target.value })} />
          </Field>
          <Field label="Categoria">
            <select className={inputClass} value={expense.categoria} onChange={(e) => setExpense({ ...expense, categoria: e.target.value })}>
              {["Estoque", "Entrega", "Marketing", "Software", "Domínio", "Impostos", "Transporte", "Outros"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </Field>
          <Field label="Descrição" className="md:col-span-2">
            <input className={inputClass} value={expense.descricao} onChange={(e) => setExpense({ ...expense, descricao: e.target.value })} />
          </Field>
          <Field label="Valor">
            <input type="number" step="0.01" className={inputClass} value={expense.valor} onChange={(e) => setExpense({ ...expense, valor: e.target.value })} />
          </Field>
          <Field label="Pagamento">
            <select className={inputClass} value={expense.forma_pagamento} onChange={(e) => setExpense({ ...expense, forma_pagamento: e.target.value })}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </Field>
          <Field label="Observações" className="md:col-span-2">
            <textarea className={textareaClass} value={expense.observacoes} onChange={(e) => setExpense({ ...expense, observacoes: e.target.value })} />
          </Field>
          <label className="flex items-center gap-3 md:col-span-2">
            <input type="checkbox" checked={expense.recorrente} onChange={(e) => setExpense({ ...expense, recorrente: e.target.checked })} />
            <span className="text-[12px]">Despesa recorrente</span>
          </label>
        </div>

        {message && <p className="mt-5 border border-[#a32929]/20 bg-[#a32929]/5 p-3 text-[11px] text-[#8d2020]">{message}</p>}

        <div className="mt-7 flex justify-end gap-3 border-t border-black/10 pt-5">
          <Button variant="light" onClick={() => setExpenseOpen(false)}>Cancelar</Button>
          <Button variant="green" onClick={saveExpense} disabled={saving}>{saving ? "Salvando..." : "Registrar despesa"}</Button>
        </div>
      </Modal>
    </div>
  );
}
