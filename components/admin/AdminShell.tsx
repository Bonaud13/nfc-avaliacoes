"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Boxes,
  ContactRound,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Smartphone,
  WalletCards,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdminData } from "./useAdminData";
import OverviewPanel from "./OverviewPanel";
import PlatesPanel from "./PlatesPanel";
import CustomersPanel from "./CustomersPanel";
import StockPanel from "./StockPanel";
import FinancePanel from "./FinancePanel";
import AnalyticsPanel from "./AnalyticsPanel";
import PerformancePanel from "./PerformancePanel";
import SettingsPanel from "./SettingsPanel";

const nav = [
  { id: "visao", label: "Visão geral", icon: LayoutDashboard },
  { id: "placas", label: "Placas", icon: Smartphone },
  { id: "clientes", label: "Clientes", icon: ContactRound },
  { id: "estoque", label: "Estoque", icon: Boxes },
  { id: "financeiro", label: "Financeiro", icon: WalletCards },
  { id: "metricas", label: "Métricas", icon: Activity },
  { id: "desempenho", label: "Desempenho", icon: Gauge },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminShell() {
  const router = useRouter();
  const [view, setView] = useState("visao");
  const [ready, setReady] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { data, loading, error, reload } = useAdminData(ready);

  useEffect(() => {
    let active = true;

    (async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        router.replace("/admin/login");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!active) return;

      if (adminError || !admin) {
        setAuthError(
          "Sua conta entrou no Supabase, mas ainda não está cadastrada em admin_users.",
        );
        return;
      }

      setUserEmail(user.email || "");
      setReady(true);
    })();

    return () => {
      active = false;
    };
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  function changeView(next: string) {
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f0e7] p-6 text-[#111]">
        <div className="max-w-[620px] border border-black/10 bg-[#fffdf8] p-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#a32929]">
            Acesso não liberado
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.05em]">
            Falta vincular sua conta ao painel.
          </h1>
          <p className="mt-4 text-[13px] leading-6 text-black/55">{authError}</p>
          <p className="mt-4 border-l-2 border-[#0f8a62] pl-4 font-mono text-[11px] leading-6 text-black/55">
            Execute o INSERT indicado no final de supabase/admin-dashboard.sql
            usando o mesmo email criado em Authentication → Users.
          </p>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f0e7]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin border-2 border-black/15 border-t-[#0f8a62]" />
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-black/40">
            validando acesso
          </p>
        </div>
      </main>
    );
  }

  const activeLabel = nav.find((item) => item.id === view)?.label || "Painel";

  return (
    <div className="min-h-screen bg-[#f3f0e7] text-[#111]">
      {/* GRID DE FUNDO */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,17,17,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* MOBILE TOPBAR */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-[62px] items-center justify-between border-b border-black/10 bg-[#f3f0e7]/95 px-4 backdrop-blur lg:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center border border-black/10 bg-[#fffdf8]"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="text-[15px] font-black tracking-[-0.04em]">
          PPRT<span className="text-[#0f8a62]">/CONTROL</span>
        </div>

        <span className="font-mono text-[9px] text-black/40">{activeLabel}</span>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-[60] w-[260px] border-r border-black/10 bg-[#f7f4ec] transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[86px] items-center justify-between border-b border-black/10 px-6">
            <div>
              <div className="text-[18px] font-black tracking-[-0.05em]">
                PPRT<span className="text-[#0f8a62]">/CONTROL</span>
              </div>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-black/35">
                operations system
              </p>
            </div>

            <button
              onClick={() => setMenuOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-5">
            {nav.map((item, index) => {
              const Icon = item.icon;
              const active = item.id === view;

              return (
                <button
                  key={item.id}
                  onClick={() => changeView(item.id)}
                  className={`group mb-1 flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left transition ${
                    active
                      ? "border-[#0f8a62] bg-[#e6f1eb] text-[#111]"
                      : "border-transparent text-black/50 hover:bg-black/[0.025] hover:text-black"
                  }`}
                >
                  <span className="w-5 font-mono text-[8px] text-black/25">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className={`h-4 w-4 ${active ? "text-[#0f8a62]" : ""}`} />
                  <span className="text-[12px] font-bold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-black/10 p-4">
            <div className="mb-3 min-w-0 px-2">
              <p className="truncate text-[10px] font-bold">{userEmail}</p>
              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#0f8a62]">
                administrador
              </p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 border border-black/10 bg-[#fffdf8] px-3 py-2.5 text-[11px] font-bold transition hover:bg-black/[0.025]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair do painel
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 min-h-screen pt-[62px] lg:ml-[260px] lg:pt-0">
        <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-7 md:py-10 xl:px-10 xl:py-12">
          {error ? (
            <div className="border border-[#a32929]/20 bg-[#fffdf8] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#a32929]">
                Erro ao carregar banco
              </p>
              <h1 className="mt-3 text-[28px] font-black tracking-[-0.045em]">
                O painel não conseguiu ler todas as tabelas.
              </h1>
              <p className="mt-3 text-[12px] leading-6 text-black/50">{error}</p>
              <p className="mt-4 text-[11px] text-black/45">
                Confirme se o arquivo supabase/admin-dashboard.sql foi executado inteiro.
              </p>
            </div>
          ) : loading ? (
            <div className="grid gap-3 md:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((x) => (
                <div
                  key={x}
                  className="h-[150px] animate-pulse border border-black/10 bg-[#fffdf8]"
                />
              ))}
            </div>
          ) : (
            <>
              {view === "visao" && (
                <OverviewPanel data={data} onNavigate={changeView} />
              )}
              {view === "placas" && (
                <PlatesPanel data={data} reload={reload} />
              )}
              {view === "clientes" && (
                <CustomersPanel data={data} reload={reload} />
              )}
              {view === "estoque" && <StockPanel data={data} reload={reload} />}
              {view === "financeiro" && (
                <FinancePanel data={data} reload={reload} />
              )}
              {view === "metricas" && <AnalyticsPanel data={data} />}
              {view === "desempenho" && <PerformancePanel />}
              {view === "configuracoes" && <SettingsPanel />}
            </>
          )}
        </div>
      </main>

      {menuOpen && (
        <button
          className="fixed inset-0 z-50 bg-black/25 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Fechar menu"
        />
      )}
    </div>
  );
}
