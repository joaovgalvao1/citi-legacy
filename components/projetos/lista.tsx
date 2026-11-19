"use client";

// Projetos em dois modos de visualização, com abas (em andamento / concluídos) e busca:
//   · Cards: um sinal por card (a cor da situação no ponto, na barra e na data prevista); etapas,
//     prazo e gargalo aparecem ao passar o mouse (sempre visíveis em telas de toque). Agrupados
//     em "Precisam de atenção" e "No prazo".
//   · Sinais vitais: cada projeto como um monitor cardíaco — a linha é o ritmo de commits por dia
//     nas últimas 4 semanas (reta = parado; batimento forte = semana ativa).

import { useState } from "react";
import Link from "next/link";

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
  /** Data prevista de entrega ("dd/mm"), quando há previsão. */
  entregaPrevista: string | null;
  /** Commits por dia nas últimas 4 semanas (o último é hoje). */
  pulso: number[];
  /** Leitura do ritmo recente ("ritmo firme", "acelerando", "parado há 9 dias"...). */
  ritmo: string;
  /** Etapa que leva a previsão para depois do prazo (null se está no prazo). */
  gargalo: string | null;
  membros: { id: string; nome: string; iniciais: string; cor: string }[];
  entrega: string | null;
  resultado: string | null;
};

const ORDEM: Record<Tom, number> = { vermelho: 0, ambar: 1, verde: 2 };
const COR_FUNDO: Record<Tom, string> = { verde: "bg-verde", ambar: "bg-ambar", vermelho: "bg-vermelho" };
const COR_TEXTO: Record<Tom, string> = { verde: "text-verde", ambar: "text-ambar", vermelho: "text-vermelho" };
const COR_HEX: Record<Tom, string> = { verde: "#00DB58", ambar: "#FFA630", vermelho: "#FF3B3B" };

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Ponto + rótulo da situação (a única etiqueta colorida do card). */
function Situacao({ nivel, rotulo }: { nivel: Tom; rotulo: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${COR_TEXTO[nivel]}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${COR_FUNDO[nivel]}`} />
      {rotulo}
    </span>
  );
}

/** Barra única de progresso, na cor da situação. */
function Barra({ progresso, nivel }: { progresso: number; nivel: Tom }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-branco/10" aria-hidden="true">
      <div className={`anima-barra h-full rounded-full ${COR_FUNDO[nivel]}`} style={{ width: `${Math.max(progresso, 3)}%` }} />
    </div>
  );
}

/** Até 3 iniciais da equipe; o resto vira "+N". */
function Avatares({ membros }: { membros: ResumoProjeto["membros"] }) {
  const visiveis = membros.slice(0, 3);
  const resto = membros.length - visiveis.length;
  return (
    <div className="flex shrink-0 -space-x-2" title={membros.map((m) => m.nome).join(", ")}>
      {visiveis.map((m) => (
        <span
          key={m.id}
          className="dado flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-fundo"
          style={{ backgroundColor: m.cor }}
        >
          {m.iniciais}
        </span>
      ))}
      {resto > 0 && (
        <span className="dado flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-[9px] font-semibold text-gray-800">
          +{resto}
        </span>
      )}
    </div>
  );
}

function CardAndamento({ p }: { p: ResumoProjeto }) {
  return (
    <Link
      href={`/projetos/${p.id}`}
      className="group flex h-full flex-col gap-3 rounded-xl border border-linha bg-white p-5 transition-colors hover:border-verde/50 focus-visible:border-verde/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-bold tracking-tight">{p.nome}</div>
          <div className="truncate text-sm text-gray-600">{p.cliente === p.nome ? p.subtitulo : p.cliente}</div>
        </div>
        <Situacao nivel={p.nivel} rotulo={p.rotulo} />
      </div>
      <Barra progresso={p.progresso} nivel={p.nivel} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-branco tabular-nums">{Math.round(p.progresso)}%</span>
          {" · "}
          {p.entregaPrevista ? (
            <>
              entrega prevista <span className={`font-semibold tabular-nums ${COR_TEXTO[p.previsao.tom]}`}>{p.entregaPrevista}</span>
            </>
          ) : (
            <span className={COR_TEXTO[p.previsao.tom]}>{p.previsao.texto}</span>
          )}
        </p>
        <Avatares membros={p.membros} />
      </div>
      {/* detalhes: ao passar o mouse ou focar (sempre visíveis em telas de toque) */}
      <div className="hidden space-y-0.5 border-t border-linha pt-2.5 text-xs text-gray-500 group-hover:block group-focus-visible:block [@media(hover:none)]:block">
        <p>
          {p.etapasConcluidas} de {p.etapas.length} etapas · {p.prazo} · {p.previsao.texto}
        </p>
        {p.gargalo && (
          <p>
            gargalo principal: <span className="text-gray-700">{p.gargalo}</span>
          </p>
        )}
        {p.alerta && <p>{p.alerta}</p>}
      </div>
    </Link>
  );
}

function CardConcluido({ p }: { p: ResumoProjeto }) {
  return (
    <Link
      href={`/projetos/${p.id}`}
      className="flex h-full flex-col gap-3 rounded-xl border border-linha bg-white p-5 transition-colors hover:border-verde/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-bold tracking-tight">{p.nome}</div>
          <div className="text-sm text-gray-600">{p.cliente === p.nome ? p.subtitulo : p.cliente}</div>
        </div>
        <Situacao nivel="verde" rotulo={p.rotulo} />
      </div>
      <Barra progresso={100} nivel="verde" />
      <div className="text-sm text-gray-600">{p.entrega}</div>
      {p.resultado && <div className="text-sm text-gray-600">{p.resultado}</div>}
      <div className="mt-auto flex justify-end pt-1">
        <Avatares membros={p.membros} />
      </div>
    </Link>
  );
}

function Grupo({ titulo, projetos, Card }: { titulo: string; projetos: ResumoProjeto[]; Card: typeof CardAndamento }) {
  if (!projetos.length) return null;
  return (
    <section className="space-y-3">
      <h2 className="rotulo">
        {titulo} · {projetos.length}
      </h2>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projetos.map((p) => (
          <li key={p.id} className="min-w-0">
            <Card p={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- sinais vitais ----------

const LARGURA = 560;
const ALTURA = 44;

/** Traçado de monitor cardíaco: um batimento por dia, proporcional aos commits do dia. */
function tracado(pulso: number[], maximo: number) {
  const passo = LARGURA / pulso.length;
  const meio = ALTURA / 2;
  let d = `M0 ${meio}`;
  pulso.forEach((v, i) => {
    const x = i * passo;
    // raiz quadrada: um dia com muitos commits não achata os outros batimentos
    const a = v ? (0.4 + 0.6 * Math.sqrt(Math.min(v / maximo, 1))) * (meio - 3) : 0;
    d += ` L${(x + passo * 0.3).toFixed(1)} ${meio} L${(x + passo * 0.42).toFixed(1)} ${(meio + a * 0.25).toFixed(1)} L${(x + passo * 0.52).toFixed(1)} ${(meio - a).toFixed(1)} L${(x + passo * 0.64).toFixed(1)} ${(meio + a * 0.55).toFixed(1)} L${(x + passo * 0.74).toFixed(1)} ${meio} L${(x + passo).toFixed(1)} ${meio}`;
  });
  return d;
}

function SinaisVitais({ projetos, dias }: { projetos: ResumoProjeto[]; dias: string[] }) {
  const maximo = Math.max(3, ...projetos.flatMap((p) => p.pulso));
  const semanas = [0, 7, 14, 21].map((i) => dias[i]);
  return (
    <div className="rounded-xl border border-linha bg-white p-5">
      <div className="mb-2 hidden grid-cols-[13rem_minmax(0,1fr)_9.5rem] gap-4 md:grid">
        <span />
        <div className="dado flex justify-between text-[10px] text-gray-500">
          {semanas.map((d) => (
            <span key={d}>{ddmm(d)}</span>
          ))}
          <span>hoje</span>
        </div>
        <span />
      </div>
      <ul className="divide-y divide-linha">
        {projetos.map((p) => {
          const cor = COR_HEX[p.nivel];
          const parado = p.ritmo.startsWith("parado");
          const total = p.pulso.reduce((s, v) => s + v, 0);
          return (
            <li key={p.id}>
              <Link
                href={`/projetos/${p.id}`}
                className="group grid grid-cols-1 items-center gap-x-4 gap-y-1.5 py-3 md:grid-cols-[13rem_minmax(0,1fr)_9.5rem]"
              >
                <span className="flex min-w-0 items-center justify-between gap-2 md:justify-start">
                  <span className="truncate font-semibold transition-colors group-hover:text-verde">{p.nome}</span>
                  <span className="md:hidden">
                    <Situacao nivel={p.nivel} rotulo={p.ritmo} />
                  </span>
                </span>
                <span className="relative block">
                  <svg
                    viewBox={`0 0 ${LARGURA} ${ALTURA}`}
                    preserveAspectRatio="none"
                    className="block h-11 w-full"
                    role="img"
                    aria-label={`${p.nome}: ${total} commits em 4 semanas, ${p.ritmo}`}
                  >
                    {[7, 14, 21].map((i) => (
                      <line
                        key={i}
                        x1={(i * LARGURA) / dias.length}
                        x2={(i * LARGURA) / dias.length}
                        y1="0"
                        y2={ALTURA}
                        stroke="rgb(255 255 255 / 0.06)"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    <line
                      x1="0"
                      x2={LARGURA}
                      y1={ALTURA / 2}
                      y2={ALTURA / 2}
                      stroke="rgb(255 255 255 / 0.05)"
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      d={tracado(p.pulso, maximo)}
                      fill="none"
                      stroke={cor}
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    {p.pulso.map((v, i) => (
                      <rect
                        key={dias[i]}
                        x={(i * LARGURA) / dias.length}
                        y="0"
                        width={LARGURA / dias.length}
                        height={ALTURA}
                        fill="transparent"
                      >
                        <title>{`${ddmm(dias[i])} · ${v} ${v === 1 ? "commit" : "commits"}`}</title>
                      </rect>
                    ))}
                  </svg>
                  {/* ponto no fim da linha: pulsa enquanto o projeto está ativo */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rounded-full ${parado ? "bg-gray-400" : `${COR_FUNDO[p.nivel]} anima-pulso`}`}
                  />
                </span>
                <span className="hidden flex-col items-end text-right md:flex">
                  <span className={`text-xs font-medium ${COR_TEXTO[p.nivel]}`}>{p.ritmo}</span>
                  <span className="dado text-[11px] text-gray-500">{total} commits · 4 sem.</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        Cada batimento é um dia com commits; a altura acompanha a quantidade. Linha reta = dias sem commits. A cor é a situação do projeto.
      </p>
    </div>
  );
}

type Modo = "cards" | "vitais";

export function ListaProjetos({ projetos, naLixeira, dias }: { projetos: ResumoProjeto[]; naLixeira: number; dias: string[] }) {
  const [aba, setAba] = useState<"andamento" | "concluidos">("andamento");
  const [modo, setModo] = useState<Modo>("cards");
  const [busca, setBusca] = useState("");

  const andamento = projetos.filter((p) => p.status !== "Concluído");
  const concluidos = projetos.filter((p) => p.status === "Concluído");
  const daAba = aba === "andamento" ? andamento : concluidos;
  const termo = normalizar(busca.trim());
  // atrasados primeiro, depois atenção, depois no prazo
  const visiveis = daAba
    .filter((p) => !termo || normalizar(`${p.nome} ${p.cliente} ${p.subtitulo}`).includes(termo))
    .sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel] || Number(!!b.alerta) - Number(!!a.alerta));
  const modoAtual: Modo = aba === "andamento" ? modo : "cards";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm" role="tablist" aria-label="Projetos">
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
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar projeto ou cliente"
            aria-label="Buscar projeto ou cliente"
            className="min-w-0 flex-1 rounded-full border border-branco/25 bg-branco/5 px-4 py-1.5 text-sm outline-none transition-colors focus:border-verde sm:w-64 sm:flex-none"
          />
          {aba === "andamento" && (
            <div
              className="flex shrink-0 rounded-full border border-branco/25 bg-branco/5 p-0.5 text-sm"
              role="group"
              aria-label="Modo de visualização"
            >
              {(
                [
                  ["cards", "Cards"],
                  ["vitais", "Sinais vitais"],
                ] as const
              ).map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={modo === id}
                  onClick={() => setModo(id)}
                  className={`cursor-pointer rounded-full px-3 py-1 whitespace-nowrap transition-colors ${
                    modo === id ? "bg-verde font-medium text-fundo" : "text-gray-700 hover:text-branco"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-branco/25 p-6 text-center text-sm text-gray-500">Nenhum projeto encontrado.</p>
      ) : modoAtual === "vitais" ? (
        <SinaisVitais projetos={visiveis} dias={dias} />
      ) : aba === "andamento" ? (
        <div className="space-y-6">
          <Grupo titulo="Precisam de atenção" projetos={visiveis.filter((p) => p.nivel !== "verde")} Card={CardAndamento} />
          <Grupo titulo="No prazo" projetos={visiveis.filter((p) => p.nivel === "verde")} Card={CardAndamento} />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visiveis.map((p) => (
            <li key={p.id} className="min-w-0">
              <CardConcluido p={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
