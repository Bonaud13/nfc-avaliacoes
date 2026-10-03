import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function score(value: unknown) {
  const n = Number(value || 0);
  return Math.round(n * 100);
}

async function runPageSpeed(url: string, strategy: "mobile" | "desktop") {
  const params = new URLSearchParams({
    url,
    strategy,
  });

  ["performance", "accessibility", "best-practices", "seo"].forEach((category) =>
    params.append("category", category),
  );

  if (process.env.PAGESPEED_API_KEY) {
    params.set("key", process.env.PAGESPEED_API_KEY);
  }

  const response = await fetch(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`PageSpeed ${response.status}: ${body.slice(0, 180)}`);
  }

  const data = await response.json();
  const categories = data.lighthouseResult?.categories || {};
  const audits = data.lighthouseResult?.audits || {};

  return {
    strategy,
    fetchedAt: data.analysisUTCTimestamp,
    scores: {
      performance: score(categories.performance?.score),
      accessibility: score(categories.accessibility?.score),
      bestPractices: score(categories["best-practices"]?.score),
      seo: score(categories.seo?.score),
    },
    metrics: {
      fcp: audits["first-contentful-paint"]?.displayValue || "—",
      lcp: audits["largest-contentful-paint"]?.displayValue || "—",
      tbt: audits["total-blocking-time"]?.displayValue || "—",
      cls: audits["cumulative-layout-shift"]?.displayValue || "—",
      speedIndex: audits["speed-index"]?.displayValue || "—",
    },
  };
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const target =
    searchParams.get("url") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://pprtia.vercel.app";

  try {
    const [mobile, desktop] = await Promise.all([
      runPageSpeed(target, "mobile"),
      runPageSpeed(target, "desktop"),
    ]);

    return NextResponse.json({
      url: target,
      mobile,
      desktop,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Falha ao executar análise de desempenho",
      },
      { status: 500 },
    );
  }
}
