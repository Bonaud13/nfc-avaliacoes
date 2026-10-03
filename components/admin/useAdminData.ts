"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AdminData } from "./types";

const emptyData: AdminData = {
  plates: [],
  plateAdmin: [],
  clients: [],
  sales: [],
  expenses: [],
  payments: [],
  accesses: [],
};

export function useAdminData(enabled: boolean) {
  const [data, setData] = useState<AdminData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    const [
      plates,
      plateAdmin,
      clients,
      sales,
      expenses,
      payments,
      accesses,
    ] = await Promise.all([
      supabase.from("placas").select("*").order("criada_em", { ascending: false }),
      supabase.from("placa_admin").select("*"),
      supabase.from("clientes").select("*").order("criado_em", { ascending: false }),
      supabase.from("vendas").select("*").order("data_venda", { ascending: false }),
      supabase.from("despesas").select("*").order("data", { ascending: false }),
      supabase.from("pagamentos").select("*").order("criado_em", { ascending: false }),
      supabase.from("acessos").select("*").order("acessado_em", { ascending: false }).limit(5000),
    ]);

    const firstError =
      plates.error ||
      plateAdmin.error ||
      clients.error ||
      sales.error ||
      expenses.error ||
      payments.error ||
      accesses.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setData({
      plates: (plates.data || []) as AdminData["plates"],
      plateAdmin: (plateAdmin.data || []) as AdminData["plateAdmin"],
      clients: (clients.data || []) as AdminData["clients"],
      sales: (sales.data || []) as AdminData["sales"],
      expenses: (expenses.data || []) as AdminData["expenses"],
      payments: (payments.data || []) as AdminData["payments"],
      accesses: (accesses.data || []) as AdminData["accesses"],
    });

    setLoading(false);
  }, [enabled]);

  useEffect(() => {
    if (enabled) reload();
  }, [enabled, reload]);

  return { data, loading, error, reload };
}
