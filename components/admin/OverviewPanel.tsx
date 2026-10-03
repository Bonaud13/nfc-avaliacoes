"use client";

import {
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  MousePointerClick,
  PackageCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { AdminData } from "./types";
import { brl, dateTime } from "./utils";
import { Panel, SectionTitle, StatusPill } from "./ui";

function startOfDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

function buildAccessSeries(data: AdminData) {
  const today = new Date();
  const rows = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      acessos: 0,
    };
  });

  const map = new Map(rows.map((row) => [row.key, row]));

  for (const access of data.accesses) {
    const key = new Date(access.acessado_em).toISOString().slice(0, 10);
    const row = map.get(key);
    if (row) row.acessos += 1;
  }

  return rows;
}

export default function OverviewPanel({
  data,
  onNavigate,
}: {
  data: AdminData;
  onNavigate: (view: string) => void;
}) {
  const metaMap = new Map(data.plateAdmin.map((meta) => [meta.placa_id, meta]));
  const soldStatuses = new Set(["vendida", "instalada"]);
  const inStock = data.plateAdmin.filter((x) => x.status === "estoque").length;
  const sold = data.plateAdmin.filter((x) => soldStatuses.has(x.status)).length;
  const installed = data.plateAdmin.filter((x) => x.status === "instalada").length;
  const inventoryCost = data.plateAdmin
    .filter((x) => x.status === "estoque")
    .reduce((sum, x) => sum + Number(x.custo_compra || 0), 0);

  const revenue = data.sales
    .filter((x) => x.status !== "cancelado")
    .reduce((sum, x) => sum + Number(x.valor_total || 0), 0);

  const expenses = data.expenses.reduce(
    (sum, x) => sum + Number(x.valor || 0),
    0,
  );

  const profit = revenue - expenses;

  const last30 = startOfDaysAgo(29);
  const accesses30 = data.accesses.filter(
    (x) => new Date(x.acessado_em) >= last30,
  ).length;

  const pending = data.payments
    .filter((x) => ["pendente", "atrasado"].includes(x.status))
    .reduce((sum, x) => sum + Number(x.valor || 0), 0);

  const accessSeries = buildAccessSeries(data);

  const recent = data.accesses.slice(0, 7).map((access) => {
    const plate = data.plates.find((x) => x.id === access.placa_id);
    const meta = metaMap.get(access.placa_id);
    return { ...access, plate, meta };
  });

  const stats = [
    {
      label: "Receita registrada",
      value: brl(revenue),
      icon: CircleDollarSign,
      note: `${data.sales.length} vendas`,
    },
    {
      label: "Resultado simples",
      value: brl(profit),
      icon: TrendingUp,
      note: `${brl(expenses)} em despesas`,
    },
    {
      label: "Em estoque",
      value: String(inStock),
      icon: Boxes,
      note: `${brl(inventoryCost)} em custo`,
    },
    {
      label: "Vendidas / instaladas",
      value: String(sold),
      icon: PackageCheck,
      note: `${installed} instaladas`,
    },
    {
      label: "Interações em 30 dias",
      value: accesses30.toLocaleString("pt-BR"),
      icon: MousePointerClick,
      note: "acessos às placas",
    },
    {
      label: "A receber",
      value: brl(pending),
      icon: WalletCards,
      note: "pendente + atrasado",
    },
  ];

  return (
    <div>
      <SectionTitle
        eyebrow="Visão geral"
        title="Controle da operação."
        description="Vendas, estoque, clientes, acessos e saúde do negócio em uma única tela."
      />

      <div className="mt-7 grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="min-h-[165px] border-b border-r border-black/10 bg-[#fffdf8] p-5 md:p-6"
            >
              <div className="flex items-start justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-black/40">
                  {stat.label}
                </p>
                <Icon className="h-4 w-4 text-[#0f8a62]" />
              </div>
              <p className="mt-9 text-[32px] font-black leading-none tracking-[-0.055em] md:text-[38px]">
                {stat.value}
              </p>
              <p className="mt-3 text-[11px] text-black/40">{stat.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.45fr_.75fr]">
        <Panel className="p-5 md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#0f8a62]">
                Atividade
              </p>
              <h2 className="mt-2 text-[23px] font-black tracking-[-0.04em]">
                Acessos nos últimos 14 dias
              </h2>
            </div>
            <button
              onClick={() => onNavigate("metricas")}
              className="flex items-center gap-1 text-[11px] font-bold text-black/45 transition hover:text-black"
            >
              Ver análise <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-7 h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accessSeries}>
                <defs>
                  <linearGradient id="pprtArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f8a62" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#0f8a62" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(0,0,0,.07)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "rgba(0,0,0,.38)" }}
                  minTickGap={24}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid rgba(0,0,0,.12)",
                    borderRadius: 0,
                    fontSize: 11,
                    background: "#fffdf8",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="acessos"
                  stroke="#0f8a62"
                  strokeWidth={2}
                  fill="url(#pprtArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5 md:p-7">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#0f8a62]">
            Agora
          </p>
          <h2 className="mt-2 text-[23px] font-black tracking-[-0.04em]">
            Últimos acessos
          </h2>

          <div className="mt-5">
            {recent.length === 0 ? (
              <p className="py-8 text-[12px] text-black/40">
                Nenhum acesso registrado ainda.
              </p>
            ) : (
              recent.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-4 border-t border-black/10 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-bold">
                      {row.plate?.nome_placa ||
                        row.plate?.nome_empresa ||
                        `Placa #${row.placa_id}`}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-black/40">
                      {dateTime(row.acessado_em)}
                    </p>
                  </div>
                  {row.meta?.status && (
                    <StatusPill value={row.meta.status} />
                  )}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <Panel className="p-5 md:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-black tracking-[-0.04em]">
              Estoque rápido
            </h2>
            <button
              onClick={() => onNavigate("estoque")}
              className="text-[11px] font-bold text-[#0f8a62]"
            >
              Abrir estoque →
            </button>
          </div>
          <div className="mt-5 grid grid-cols-3 border-l border-t border-black/10">
            <div className="border-b border-r border-black/10 p-4">
              <p className="text-[28px] font-black">{inStock}</p>
              <p className="mt-1 text-[10px] text-black/40">disponíveis</p>
            </div>
            <div className="border-b border-r border-black/10 p-4">
              <p className="text-[28px] font-black">
                {data.plateAdmin.filter((x) => x.status === "reservada").length}
              </p>
              <p className="mt-1 text-[10px] text-black/40">reservadas</p>
            </div>
            <div className="border-b border-r border-black/10 p-4">
              <p className="text-[28px] font-black">{installed}</p>
              <p className="mt-1 text-[10px] text-black/40">instaladas</p>
            </div>
          </div>
        </Panel>

        <Panel className="p-5 md:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-black tracking-[-0.04em]">
              Financeiro rápido
            </h2>
            <button
              onClick={() => onNavigate("financeiro")}
              className="text-[11px] font-bold text-[#0f8a62]"
            >
              Abrir financeiro →
            </button>
          </div>
          <div className="mt-5 space-y-3">
            <div className="flex justify-between border-t border-black/10 pt-3 text-[12px]">
              <span className="text-black/45">Receita</span>
              <strong>{brl(revenue)}</strong>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-[12px]">
              <span className="text-black/45">Despesas</span>
              <strong>{brl(expenses)}</strong>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-3 text-[12px]">
              <span className="text-black/45">Resultado</span>
              <strong className={profit >= 0 ? "text-[#0f8a62]" : "text-[#a32929]"}>
                {brl(profit)}
              </strong>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
