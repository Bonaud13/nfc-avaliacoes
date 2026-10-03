"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;

      const { data: admin } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (admin) router.replace("/admin");
    });
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      setMessage("Email ou senha inválidos.");
      setLoading(false);
      return;
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !admin) {
      await supabase.auth.signOut();
      setMessage("Esta conta não está autorizada a acessar o painel.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f0e7] p-5 text-[#111]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,17,17,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.06) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="relative z-10 grid w-full max-w-[980px] border border-black/10 bg-[#fffdf8] lg:grid-cols-[.95fr_1.05fr]">
        <div className="hidden min-h-[590px] flex-col justify-between bg-[#111] p-9 text-white lg:flex">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#58c99d]">
              PPRT / CONTROL
            </p>
            <h1 className="mt-10 text-[62px] font-black leading-[0.9] tracking-[-0.07em]">
              Toda a
              <br />
              operação.
              <br />
              <span className="text-white/30">Um painel.</span>
            </h1>
          </div>

          <div className="border-t border-white/15 pt-5">
            <div className="grid grid-cols-3 font-mono text-[8px] uppercase tracking-[0.12em] text-white/35">
              <span>placas</span>
              <span>financeiro</span>
              <span>métricas</span>
            </div>
          </div>
        </div>

        <div className="flex min-h-[560px] items-center p-7 md:p-12">
          <div className="w-full">
            <div className="flex h-11 w-11 items-center justify-center bg-[#e5f2ec] text-[#0f8a62]">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <p className="mt-8 font-mono text-[9px] uppercase tracking-[0.16em] text-[#0f8a62]">
              acesso restrito
            </p>
            <h2 className="mt-3 text-[37px] font-black leading-none tracking-[-0.055em]">
              Entre no painel.
            </h2>
            <p className="mt-3 text-[12px] leading-5 text-black/45">
              Use o usuário criado no Supabase Authentication.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.13em] text-black/40">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full border border-black/10 bg-white px-4 text-[13px] outline-none transition focus:border-[#0f8a62]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.13em] text-black/40">
                  Senha
                </span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full border border-black/10 bg-white px-4 text-[13px] outline-none transition focus:border-[#0f8a62]"
                />
              </label>

              {message && (
                <p className="border border-[#a32929]/20 bg-[#a32929]/5 p-3 text-[11px] text-[#8d2020]">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-between bg-[#111] px-4 text-[12px] font-bold text-white transition hover:bg-[#0f8a62] disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <a
              href="/"
              className="mt-7 inline-block text-[11px] font-bold text-black/40 transition hover:text-black"
            >
              ← Voltar para o site
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
