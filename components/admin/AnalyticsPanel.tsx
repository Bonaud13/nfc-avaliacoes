"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminData } from "./types";
import { dateTime } from "./utils";
import { Panel, SectionTitle } from "./ui";

function daySeries(data: AdminData) {
  const today = new Date();
  const rows = Array.from({ length: 30 }).map((_, index) => {
    const d = new Date(today);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (29 - index));
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d),
      acessos: 0,
    };
  });

  const map = new Map(rows.map((x) => [x.key, x]));
  data.accesses.forEach((access) => {
    const key = new Date(access.acessado_em).toISOString().slice(0, 10);
    const row = map.get(key);
    if (row) row.acessos += 1;
  });
  return rows;
}

export default function AnalyticsPanel({ data }: { data: AdminData }) {
  const days = useMemo(() => daySeries(data), [data]);

  const perPlate = useMemo(() => {
    const counts = new Map<number, number>();
    data.accesses.forEach((access) =>
      counts.set(access.placa_id, (counts.get(access.placa_id) || 0) + 1),
    );

    return Array.from(counts.entries())
      .map(([placaId, total]) => {
        const plate = data.plates.find((x) => x.id === placaId);
        return {
          placaId,
          total,
          name: plate?.nome_placa || plate?.nome_empresa || `Placa ${placaId}`,
          code: plate?.codigo || "—",
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [data]);

  const byHour = useMemo(() => {
    const rows = Array.from({ length: 24 }).map((_, hour) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}h`,
      total: 0,
    }));

    data.accesses.forEach((access) => {
      const hour = new Date(access.acessado_em).getHours();
      rows[hour].total += 1;
    });

    return rows;
  }, [data.accesses]);

  const topHour = [...byHour].sort((a, b) => b.total - a.total)[0];
  const total = data.accesses.length;
  const activePlates = new Set(data.accesses.map((x) => x.placa_id)).size;
  const lastAccess = data.accesses[0];

  return (
    <div>
      <SectionTitle
        eyebrow="Métricas"
        title="O uso real das placas."
        description="Aqui você acompanha acessos. Isso mede interações com a placa, não avaliações confirmadas no Google."
      />

      <div className="mt-7 grid border-l border-t border-black/10 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total de acessos", total.toLocaleString("pt-BR")],
          ["Placas com atividade", activePlates.toLocaleString("pt-BR")],
          ["Horário mais ativo", topHour?.total ? topHour.label : "—"],
          ["Último acesso", lastAccess ? dateTime(lastAccess.acessado_em) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="border-b border-r border-black/10 bg-[#fffdf8] p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">{label}</p>
            <p className="mt-8 text-[28px] font-black tracking-[-0.05em]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-7 xl:grid-cols-[1.25fr_.75fr]">
        <Panel className="p-5 md:p-7">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Últimos 30 dias</h2>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={days}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,.07)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "rgba(0,0,0,.38)" }} minTickGap={18} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "rgba(0,0,0,.35)" }} width={28} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "1px solid rgba(0,0,0,.12)",
                    background: "#fffdf8",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="acessos" fill="#0f8a62" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5 md:p-7">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Por horário</h2>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byHour}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,.07)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: "rgba(0,0,0,.38)" }} interval={2} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "1px solid rgba(0,0,0,.12)",
                    background: "#fffdf8",
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="total" fill="#111111" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel className="mt-7 overflow-x-auto">
        <div className="border-b border-black/10 p-5">
          <h2 className="text-[22px] font-black tracking-[-0.04em]">Placas com mais acessos</h2>
        </div>
        <table className="w-full min-w-[680px] text-left text-[11px]">
          <thead>
            <tr className="border-b border-black/10 font-mono text-[8px] uppercase tracking-[0.12em] text-black/40">
              <th className="px-4 py-3">Posição</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3 text-right">Acessos</th>
            </tr>
          </thead>
          <tbody>
            {perPlate.map((row, index) => (
              <tr key={row.placaId} className="border-b border-black/[0.07] last:border-b-0">
                <td className="px-4 py-4 font-mono text-black/40">0{index + 1}</td>
                <td className="px-4 py-4 font-bold">{row.name}</td>
                <td className="px-4 py-4 font-mono text-[10px]">{row.code}</td>
                <td className="px-4 py-4 text-right text-[17px] font-black">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
