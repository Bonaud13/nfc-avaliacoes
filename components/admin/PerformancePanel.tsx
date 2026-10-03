"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  ExternalLink,
  GitCommitHorizontal,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Monitor,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Panel, SectionTitle } from "./ui";
import { dateTime } from "./utils";

type GitHubData = {
  repo?: {
    full_name: string;
    html_url: string;
    default_branch: string;
    open_issues_count: number;
    pushed_at: string;
    updated_at: string;
    stargazers_count: number;
    forks_count: number;
  };
  latestRun?: {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    html_url: string;
    created_at: string;
    updated_at: string;
    head_branch: string;
    head_sha: string;
  } | null;
  commits?: Array<{
    sha: string;
    html_url: string;
    commit: {
      message: string;
      author: {
        name: string;
        date: string;
      };
    };
  }>;
  error?: string;
};

type PerformanceData = {
  url: string;
  mobile: Audit;
  desktop: Audit;
  error?: string;
};

type Audit = {
  strategy: string;
  fetchedAt: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    fcp: string;
    lcp: string;
    tbt: string;
    cls: string;
    speedIndex: string;
  };
};

function Score({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const stroke = value >= 90 ? "#0f8a62" : value >= 70 ? "#c88918" : "#a32929";
  const dash = Math.max(0, Math.min(100, value)) * 2.64;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[74px] w-[74px] shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="rgba(0,0,0,.07)"
            strokeWidth="7"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="butt"
            strokeDasharray={`${dash} 264`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[17px] font-black">
          {value}
        </div>
      </div>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-black/40">
          {label}
        </p>
        <p className="mt-1 text-[11px] text-black/45">
          {value >= 90 ? "Muito bom" : value >= 70 ? "Pode melhorar" : "Precisa de atenção"}
        </p>
      </div>
    </div>
  );
}

export default function PerformancePanel() {
  const [github, setGithub] = useState<GitHubData | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  async function authFetch(path: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw new Error("Sessão expirada.");

    const response = await fetch(path, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    return response.json();
  }

  async function loadGithub() {
    setLoadingGithub(true);
    try {
      setGithub(await authFetch("/api/admin/github"));
    } finally {
      setLoadingGithub(false);
    }
  }

  async function loadPerformance() {
    setLoadingPerformance(true);
    try {
      setPerformance(await authFetch("/api/admin/performance"));
    } finally {
      setLoadingPerformance(false);
    }
  }

  return (
    <div>
      <SectionTitle
        eyebrow="Tecnologia"
        title="Saúde do produto."
        description="Repositório, automações de build e auditoria real do site. GitHub mostra a saúde do código; PageSpeed/Lighthouse mede a página publicada."
        action={
          <div className="flex gap-2">
            <Button variant="light" onClick={loadGithub} disabled={loadingGithub}>
              <GitCommitHorizontal className="h-4 w-4" />
              {loadingGithub ? "Consultando..." : "GitHub"}
            </Button>
            <Button variant="green" onClick={loadPerformance} disabled={loadingPerformance}>
              <Activity className="h-4 w-4" />
              {loadingPerformance ? "Analisando..." : "Rodar auditoria"}
            </Button>
          </div>
        }
      />

      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <Panel className="p-5 md:p-7">
          <div className="flex items-center justify-between border-b border-black/10 pb-5">
            <div className="flex items-center gap-3">
              <GitCommitHorizontal className="h-5 w-5" />
              <div>
                <h2 className="text-[20px] font-black tracking-[-0.04em]">GitHub</h2>
                <p className="mt-1 text-[10px] text-black/40">código + GitHub Actions</p>
              </div>
            </div>
            <button
              onClick={loadGithub}
              className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white"
              aria-label="Atualizar GitHub"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingGithub ? "animate-spin" : ""}`} />
            </button>
          </div>

          {!github ? (
            <div className="py-16 text-center">
              <p className="text-[12px] text-black/45">
                Clique em GitHub para consultar o repositório.
              </p>
            </div>
          ) : github.error ? (
            <p className="mt-5 border border-[#a32929]/20 bg-[#a32929]/5 p-4 text-[11px] text-[#8d2020]">
              {github.error}
            </p>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 border-l border-t border-black/10">
                <div className="border-b border-r border-black/10 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-black/35">Repositório</p>
                  <a
                    href={github.repo?.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold"
                  >
                    {github.repo?.full_name} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="border-b border-r border-black/10 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-black/35">Branch</p>
                  <p className="mt-2 text-[13px] font-bold">{github.repo?.default_branch}</p>
                </div>
                <div className="border-b border-r border-black/10 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-black/35">Issues / PRs abertos</p>
                  <p className="mt-2 text-[20px] font-black">{github.repo?.open_issues_count ?? 0}</p>
                </div>
                <div className="border-b border-r border-black/10 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-black/35">Último push</p>
                  <p className="mt-2 text-[11px] font-bold">{dateTime(github.repo?.pushed_at)}</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">
                  Última automação
                </p>

                {github.latestRun ? (
                  <a
                    href={github.latestRun.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-between gap-5 border border-black/10 p-4 transition hover:border-black/25"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className={`h-5 w-5 ${
                          github.latestRun.conclusion === "success"
                            ? "text-[#0f8a62]"
                            : "text-[#a32929]"
                        }`}
                      />
                      <div>
                        <p className="text-[12px] font-bold">{github.latestRun.name}</p>
                        <p className="mt-1 font-mono text-[9px] text-black/40">
                          {github.latestRun.head_branch} · {github.latestRun.head_sha.slice(0, 7)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold">
                      {github.latestRun.conclusion || github.latestRun.status}
                    </span>
                  </a>
                ) : (
                  <p className="mt-3 text-[11px] text-black/40">Nenhum workflow encontrado.</p>
                )}
              </div>

              <div className="mt-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">
                  Commits recentes
                </p>
                <div className="mt-2">
                  {github.commits?.map((commit) => (
                    <a
                      key={commit.sha}
                      href={commit.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-start gap-3 border-t border-black/10 py-3"
                    >
                      <GitCommitHorizontal className="mt-0.5 h-4 w-4 shrink-0 text-[#0f8a62]" />
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold">
                          {commit.commit.message.split("\n")[0]}
                        </p>
                        <p className="mt-1 font-mono text-[8px] text-black/35">
                          {commit.sha.slice(0, 7)} · {commit.commit.author.name}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </Panel>

        <Panel className="p-5 md:p-7">
          <div className="flex items-center justify-between border-b border-black/10 pb-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <h2 className="text-[20px] font-black tracking-[-0.04em]">PageSpeed / Lighthouse</h2>
                <p className="mt-1 text-[10px] text-black/40">site publicado</p>
              </div>
            </div>
            <button
              onClick={loadPerformance}
              className="flex h-9 w-9 items-center justify-center border border-black/10 bg-white"
              aria-label="Atualizar desempenho"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingPerformance ? "animate-spin" : ""}`} />
            </button>
          </div>

          {!performance ? (
            <div className="py-16 text-center">
              <p className="text-[12px] text-black/45">
                Rode uma auditoria para medir a versão publicada do site.
              </p>
            </div>
          ) : performance.error ? (
            <p className="mt-5 border border-[#a32929]/20 bg-[#a32929]/5 p-4 text-[11px] text-[#8d2020]">
              {performance.error}
            </p>
          ) : (
            <>
              <p className="mt-5 truncate font-mono text-[9px] text-black/35">{performance.url}</p>

              {[
                { label: "Mobile", icon: Smartphone, audit: performance.mobile },
                { label: "Desktop", icon: Monitor, audit: performance.desktop },
              ].map(({ label, icon: Icon, audit }) => (
                <div key={label} className="mt-6 border-t border-black/10 pt-5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#0f8a62]" />
                    <h3 className="text-[13px] font-black">{label}</h3>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Score label="Performance" value={audit.scores.performance} />
                    <Score label="Acessibilidade" value={audit.scores.accessibility} />
                    <Score label="Boas práticas" value={audit.scores.bestPractices} />
                    <Score label="SEO" value={audit.scores.seo} />
                  </div>

                  <div className="mt-6 grid grid-cols-5 border-l border-t border-black/10">
                    {[
                      ["FCP", audit.metrics.fcp],
                      ["LCP", audit.metrics.lcp],
                      ["TBT", audit.metrics.tbt],
                      ["CLS", audit.metrics.cls],
                      ["Speed", audit.metrics.speedIndex],
                    ].map(([metric, value]) => (
                      <div key={metric} className="border-b border-r border-black/10 p-2.5">
                        <p className="font-mono text-[8px] text-black/35">{metric}</p>
                        <p className="mt-1 text-[10px] font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </Panel>
      </div>

      <div className="mt-7 border border-black/10 bg-[#e5f2ec] p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#0f6f51]">
          Como ler esta tela
        </p>
        <p className="mt-2 max-w-[850px] text-[12px] leading-6 text-black/55">
          GitHub acompanha código, commits e execução dos workflows. PageSpeed/Lighthouse mede
          desempenho, acessibilidade, boas práticas e SEO da página publicada. São coisas diferentes
          e complementares.
        </p>
      </div>
    </div>
  );
}
