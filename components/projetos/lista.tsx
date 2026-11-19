"use client";

// Cards de projetos com abas (em andamento / concluídos) e busca.
// Cada card: nome, cliente e selo do semáforo; barra segmentada por etapa; "2 de 6 etapas · 70%";
// previsão de entrega; avatares da equipe.

import { useState } from "react";
import Link from "next/link";
import { Selo } from "@/components/ui";

type Tom = "verde" | "ambar" | "vermelho";

export type ResumoProjeto = {
  id: string;
  nome: string;
  cliente: string;
  subtitulo: string;
  status: "Em andamento" | "Atrasado" | "Concluído";
  /** Semáforo: verde (no prazo/concluído), âmbar (atenção), vermelho (atrasado). */
  nivel: Tom;
  rotulo: string;
  progresso: number;
  prazo: string;
  alerta: string | null;
  /** Um segmento por etapa, na cor do status dela ("vazia" = não iniciada). */
  etapas: { nome: string; progresso: number; tom: Tom | "vazia" }[];
  etapasConcluidas: number;
  /** Previsão de entrega pelo ritmo recente ("prev. 16/12 · no prazo"). */
  previsao: { texto: string; tom: Tom };
  /** Etapa que leva a previsão para depois do prazo (null se está no prazo). */
  gargalo: string | null;
  membros: { id: string; nome: string; iniciais: string; cor: string }[];
  entrega: string | null;
  resultado: string | null;
};

const ORDEM: Record<Tom, number> = { vermelho: 0, ambar: 1, verde: 2 };
const COR_FUNDO: Record<Tom, string> = { verde: "bg-verde", ambar: "bg-ambar", vermelho: "bg-vermelho" };
const COR_TEXTO: Record<Tom, string> = { verde: "text-verde", ambar: "text-ambar", vermelho: "text-vermelho" };

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Barra segmentada: um trecho por etapa, preenchido conforme o progresso, na cor do status. */
function BarraDeEtapas({ etapas }: { etapas: ResumoProjeto["etapas"] }) {
  return (
    <div className="flex gap-1" aria-hidden="true">
      {etapas.map((e) => (
        <div key={e.nome} title={`${e.nome} · ${e.progresso}%`} className="h-2 flex-1 overflow-hidden rounded-full bg-branco/12">
          {e.tom !== "vazia" && <div className={`anima-barra h-full rounded-full ${COR_FUNDO[e.tom]}`} style={{ width: `${Math.max(e.progresso, 6)}%` }} />}
        </div>
      ))}
    </div>
  );
}

/** Iniciais da equipe sobrepostas, na cor de cada pessoa (a mesma dos gráficos de Participação). */
function Avatares({ membros }: { membros: ResumoProjeto["membros"] }) {
  return (
    <div className="flex -space-x-2">
      {membros.map((m) => (
        <span
          key={m.id}
          title={m.nome}
          className="dado flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-semibold text-fundo"
          style={{ backgroundColor: m.cor }}
        >
          {m.iniciais}
        </span>
      ))}
    </div>
  );
}

function Legenda() {
  const itens: [string, string][] = [
    ["bg-verde", "concluída ou em dia"],
    ["bg-ambar", "atenção (parada ou previsão fora do prazo)"],
    ["bg-vermelho", "atrasada"],
    ["bg-branco/12", "não iniciada"],
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600" aria-label="Legenda das etapas">
      {itens.map(([cor, rotulo]) => (
        <li key={rotulo} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`h-2 w-4 rounded-full ${cor}`} />
          {rotulo}
        </li>
      ))}
      <li className="text-gray-500">· previsão pelo ritmo das últimas 4 semanas</li>
    </ul>
  );
}

function CardAndamento({ p }: { p: ResumoProjeto }) {
  return (
    <Link
      href={`/projetos/${p.id}`}
      className={`flex h-full flex-col gap-3 rounded-xl border bg-white p-5 transition-colors ${
        p.nivel === "vermelho" ? "border-vermelho/35 hover:border-vermelho/70" : "border-linha hover:border-verde/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold tracking-tight">{p.nome}</div>
          <div className="truncate text-sm text-gray-600">{p.cliente === p.nome ? p.subtitulo : p.cliente}</div>
        </div>
        <Selo tom={p.nivel}>{p.rotulo}</Selo>
      </div>
      <BarraDeEtapas etapas={p.etapas} />
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="dado text-xs text-gray-600">
          {p.etapasConcluidas} de {p.etapas.length} etapas · {Math.round(p.progresso)}%
        </span>
        <span className="dado text-xs text-gray-500">{p.prazo}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <div className="min-w-0">
          <p className={`dado text-sm font-semibold ${COR_TEXTO[p.previsao.tom]}`}>{p.previsao.texto}</p>
          {p.gargalo && <p className="truncate text-xs text-gray-500">gargalo principal: {p.gargalo}</p>}
        </div>
        <Avatares membros={p.membros} />
      </div>
    </Link>
  );
}

function CardConcluido({ p }: { p: ResumoProjeto }) {
  return (
    <Link href={`/projetos/${p.id}`} className="flex h-full flex-col gap-3 rounded-xl border border-linha bg-white p-5 transition-colors hover:border-verde/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-bold tracking-tight">{p.nome}</div>
          <div className="text-sm text-gray-600">{p.cliente === p.nome ? p.subtitulo : p.cliente}</div>
        </div>
        <Selo tom="verde">{p.rotulo}</Selo>
      </div>
      <BarraDeEtapas etapas={p.etapas} />
      <div className="dado text-xs text-gray-700">{p.entrega}</div>
      {p.resultado && <div className="text-sm text-gray-600">{p.resultado}</div>}
      <div className="mt-auto flex justify-end pt-1">
        <Avatares membros={p.membros} />
      </div>
    </Link>
  );
}

export function ListaProjetos({ projetos, naLixeira }: { projetos: ResumoProjeto[]; naLixeira: number }) {
  const [aba, setAba] = useState<"andamento" | "concluidos">("andamento");
  const [busca, setBusca] = useState("");

  const andamento = projetos.filter((p) => p.status !== "Concluído");
  const concluidos = projetos.filter((p) => p.status === "Concluído");
  const daAba = aba === "andamento" ? andamento : concluidos;
  const termo = normalizar(busca.trim());
  // atrasados primeiro, depois atenção, depois no prazo
  const visiveis = daAba
    .filter((p) => !termo || normalizar(`${p.nome} ${p.cliente} ${p.subtitulo}`).includes(termo))
    .sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel] || Number(!!b.alerta) - Number(!!a.alerta));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 text-sm" role="tablist" aria-label="Projetos">
          {(
            [
              ["andamento", `Em andamento · ${andamento.length}`],
              ["concluidos", `Concluídos · ${concluidos.length}`],
            ] as const
          ).map(([id, rotulo]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`cursor-pointer rounded-full border px-3 py-1 ${
                aba === id ? "border-verde bg-verde/10 text-verde" : "border-branco/25 bg-branco/5 text-gray-700"
              }`}
            >
              {rotulo}
            </button>
          ))}
          {/* a lixeira só aparece quando tem algo dentro */}
          {naLixeira > 0 && (
            <Link
              href="/projetos/lixeira"
              className="rounded-full border border-dashed border-vermelho/40 px-3 py-1 text-gray-700 transition-colors hover:border-vermelho hover:text-vermelho"
            >
              Lixeira · {naLixeira}
            </Link>
          )}
        </div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar projeto ou cliente"
          aria-label="Buscar projeto ou cliente"
          className="w-full rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde sm:w-64"
        />
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-branco/25 p-6 text-center text-sm text-gray-500">Nenhum projeto encontrado.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visiveis.map((p) => (
            <li key={p.id} className="min-w-0">
              {aba === "andamento" ? <CardAndamento p={p} /> : <CardConcluido p={p} />}</li>
          ))}
        </ul>
      )}

      {aba === "andamento" && visiveis.length > 0 && <Legenda />}
    </div>
  );
}
