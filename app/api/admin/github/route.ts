import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type GitHubResponse = {
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
};

async function githubFetch(path: string) {
  const token = process.env.GITHUB_TOKEN;

  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub ${response.status}: ${body.slice(0, 180)}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const owner = process.env.GITHUB_OWNER || "Bonaud13";
  const repo = process.env.GITHUB_REPO || "nfc-avaliacoes";

  try {
    const [repository, runs, commits] = await Promise.all([
      githubFetch(`/repos/${owner}/${repo}`),
      githubFetch(`/repos/${owner}/${repo}/actions/runs?per_page=5`),
      githubFetch(`/repos/${owner}/${repo}/commits?per_page=5`),
    ]);

    const payload: GitHubResponse = {
      repo: {
        full_name: repository.full_name,
        html_url: repository.html_url,
        default_branch: repository.default_branch,
        open_issues_count: repository.open_issues_count,
        pushed_at: repository.pushed_at,
        updated_at: repository.updated_at,
        stargazers_count: repository.stargazers_count,
        forks_count: repository.forks_count,
      },
      latestRun: runs.workflow_runs?.[0]
        ? {
            id: runs.workflow_runs[0].id,
            name: runs.workflow_runs[0].name,
            status: runs.workflow_runs[0].status,
            conclusion: runs.workflow_runs[0].conclusion,
            html_url: runs.workflow_runs[0].html_url,
            created_at: runs.workflow_runs[0].created_at,
            updated_at: runs.workflow_runs[0].updated_at,
            head_branch: runs.workflow_runs[0].head_branch,
            head_sha: runs.workflow_runs[0].head_sha,
          }
        : null,
      commits: commits.map((commit: any) => ({
        sha: commit.sha,
        html_url: commit.html_url,
        commit: {
          message: commit.commit.message,
          author: {
            name: commit.commit.author?.name || "—",
            date: commit.commit.author?.date || "",
          },
        },
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Falha ao consultar o GitHub",
      },
      { status: 500 },
    );
  }
}
