"use client";

// Resumo da semana (andamento) ou retrospectiva (concluído), gerado por IA no servidor (/api/resumo).
// Fica guardado no navegador enquanto as tasks do projeto não mudarem; "Gerar de novo" força uma nova chamada.

import { useCallback, useEffect, useState } from "react";
import { useMarcadas } from "@/lib/tasks";

type Secao = { titulo: string; itens: string[] };
type Resumo = { secoes: Secao[]; fonte: "gemini" | "groq" | "regras"; modelo?: string; geradoEm: string; aviso?: string };

const ROTULO_FONTE: Record<Resumo["fonte"], string> = {
  gemini: "Gerado por IA · Gemini",
  groq: "Gerado por IA · Groq",
  regras: "Resumo automático (sem IA)",
};

function lerCache(chave: string): { estado: string; resumo: Resumo } | null {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function ResumoIA({ projetoId, concluido }: { projetoId: string; concluido: boolean }) {
  const todas = useMarcadas();
  // só as marcações deste projeto entram no pedido (e na chave do cache)
  const marcadas = Object.fromEntries(Object.entries(todas).filter(([k]) => k.startsWith(`${projetoId}/`)));
  const estado = JSON.stringify(marcadas);
  const chaveCache = `citi-legacy:resumo:${projetoId}`;

  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const gerar = useCallback(
    async (forcar: boolean) => {
      if (!forcar) {
        const cache = lerCache(chaveCache);
        if (cache && cache.estado === estado && cache.resumo.fonte !== "regras") {
          setResumo(cache.resumo);
          return;
        }
      }
      setCarregando(true);
      setErro("");
      try {
        const r = await fetch("/api/resumo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projetoId, marcadas: JSON.parse(estado) }),
        });
        if (!r.ok) throw new Error(String(r.status));
        const novo = (await r.json()) as Resumo;
        setResumo(novo);
        try {
          window.localStorage.setItem(chaveCache, JSON.stringify({ estado, resumo: novo }));
        } catch {
          // sem armazenamento: só não fica guardado
        }
      } catch {
        setErro("Não foi possível gerar o resumo agora. Tente de novo.");
      } finally {
        setCarregando(false);
      }
    },
    [chaveCache, estado, projetoId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial do resumo ao abrir a página
    void gerar(false);
  }, [gerar]);

  return (
    <section className="anima-surgir rounded-2xl border border-verde/30 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="dado flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-verde">
          <span aria-hidden="true">✦</span>
          {concluido ? "Retrospectiva do projeto" : "Resumo da semana"}
        </h2>
        <button
          type="button"
          onClick={() => void gerar(true)}
          disabled={carregando}
          className="cursor-pointer rounded-full border border-gray-400 px-3 py-1 text-xs text-gray-700 transition-colors hover:border-verde hover:text-verde disabled:cursor-wait disabled:opacity-50"
        >
          {carregando ? "Gerando…" : "Gerar de novo"}
        </button>
      </div>

      {carregando && !resumo ? (
        <div className="grid gap-4 sm:grid-cols-3" aria-busy="true" aria-label="Gerando resumo">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : erro && !resumo ? (
        <p className="text-sm text-ambar">{erro}</p>
      ) : resumo ? (
        <div className={`space-y-4 transition-opacity ${carregando ? "opacity-50" : ""}`}>
          <div className="grid gap-5 sm:grid-cols-3">
            {resumo.secoes.map((s) => (
              <div key={s.titulo} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">{s.titulo}</h3>
                <ul className="space-y-1.5">
                  {s.itens.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-verde" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="dado text-[11px] text-gray-500" title={resumo.aviso}>
            {ROTULO_FONTE[resumo.fonte]}
            {resumo.modelo && ` (${resumo.modelo})`} · {new Date(resumo.geradoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            {erro && ` · ${erro}`}
          </p>
        </div>
      ) : null}
    </section>
  );
}
