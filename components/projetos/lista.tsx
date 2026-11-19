"use client";

// Projetos com abas (em andamento / concluídos) e busca. Cada card tem um sinal só (a cor da
// situação no monograma, no anel e na data prevista) e um pulso em miniatura com o ritmo de commits;
// etapas e prazo aparecem ao passar o mouse (sempre visíveis em telas de toque).
// No topo, o projeto atrasado mais grave ganha o destaque "Precisa de você agora", com o resumo da IA.

import { useState } from "react";
import Link from "next/link";

type Tom = "verde" | "ambar" | "vermelho";

/** Projeto em destaque no topo: o atrasado mais grave, com o resumo da IA da semana. */
export type Destaque = { id: string; travou: string | null; primeiro: string | null; ia: boolean } | null;

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
  /** Iniciais do cliente, para o monograma do card. */
  monograma: string;
  /** Etapa que leva a previsão para depois do prazo (null se está no prazo). */
  gargalo: string | null;
  membros: { id: string; nome: string; iniciais: string; cor: string; github?: string }[];
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

/** Foto do GitHub por cima das iniciais (se não carregar, ficam as iniciais). */
function FotoGithub({ github, nome }: { github: string; nome: string }) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- foto externa (GitHub), sem otimização do Next
    <img
      src={`https://github.com/${encodeURIComponent(github)}.png?size=48`}
      alt={`Foto de ${nome}`}
      loading="lazy"
      onError={() => setFalhou(true)}
      className="absolute inset-0 h-full w-full rounded-full object-cover"
    />
  );
}

/** Até 3 membros da equipe (foto do GitHub, ou as iniciais); o resto vira "+N". */
function Avatares({ membros }: { membros: ResumoProjeto["membros"] }) {
  const visiveis = membros.slice(0, 3);
  const resto = membros.length - visiveis.length;
  return (
    <div className="flex shrink-0 -space-x-2">
      {visiveis.map((m) => (
        <span
          key={m.id}
          title={m.nome}
          className="dado relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold text-fundo transition-transform duration-200 hover:z-10 hover:scale-150"
          style={{ backgroundColor: m.cor }}
        >
          {m.iniciais}
          {m.github && <FotoGithub github={m.github} nome={m.nome} />}
        </span>
      ))}
      {resto > 0 && (
        <span
          title={membros
            .slice(3)
            .map((m) => m.nome)
            .join(", ")}
          className="dado flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-300 text-[9px] font-semibold text-gray-800"
        >
          +{resto}
        </span>
      )}
    </div>
  );
}

const COR_SUAVE: Record<Tom, string> = {
  verde: "bg-verde/12 text-verde",
  ambar: "bg-ambar/12 text-ambar",
  vermelho: "bg-vermelho/12 text-vermelho",
};
const BORDA_HOVER: Record<Tom, string> = {
  verde: "hover:border-verde/60 focus-visible:border-verde/60",
  ambar: "hover:border-ambar/60 focus-visible:border-ambar/60",
  vermelho: "hover:border-vermelho/60 focus-visible:border-vermelho/60",
};

/** Monograma com as iniciais do cliente, na cor da situação. */
function Monograma({ texto, nivel, grande = false }: { texto: string; nivel: Tom; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-xl font-bold tracking-tight ${COR_SUAVE[nivel]} ${grande ? "h-12 w-12 text-base" : "h-11 w-11 text-sm"}`}
    >
      {texto}
    </span>
  );
}

/** Anel de progresso na cor da situação, com o percentual no meio. */
function Anel({ progresso, nivel }: { progresso: number; nivel: Tom }) {
  const r = 19;
  const volta = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0" role="img" aria-label={`${Math.round(progresso)}% concluído`}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="5" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={COR_HEX[nivel]}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${((volta * Math.min(progresso, 100)) / 100).toFixed(1)} ${volta.toFixed(1)}`}
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
        {Math.round(progresso)}%
      </text>
    </svg>
  );
}

/** Pulso em miniatura: as últimas 2 semanas de commits, um batimento por dia com commits. */
function MiniPulso({ pulso, nivel }: { pulso: number[]; nivel: Tom }) {
  const ultimos = pulso.slice(-14);
  return (
    <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} preserveAspectRatio="none" className="block h-4 w-full" aria-hidden="true">
      <path
        d={tracado(ultimos, Math.max(3, ...ultimos))}
        fill="none"
        stroke={COR_HEX[nivel]}
        strokeOpacity="0.85"
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function CardAndamento({ p }: { p: ResumoProjeto }) {
  return (
    <Link
      href={`/projetos/${p.id}`}
      className={`group flex h-full flex-col gap-3 rounded-xl border border-linha bg-white p-4 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 sm:p-5 ${BORDA_HOVER[p.nivel]}`}
    >
      <div className="flex items-center gap-3.5">
        <Monograma texto={p.monograma} nivel={p.nivel} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-base font-bold tracking-tight sm:text-lg">{p.nome}</span>
            {/* no celular, a situação fica no monograma e no anel, para o nome caber */}
            <span className="hidden sm:inline-flex">
              <Situacao nivel={p.nivel} rotulo={p.rotulo} />
            </span>
          </div>
          <p className="truncate text-sm text-gray-600">
            {p.entregaPrevista ? (
              <>
                entrega prevista <span className={`font-semibold tabular-nums ${COR_TEXTO[p.previsao.tom]}`}>{p.entregaPrevista}</span>
              </>
            ) : (
              <span className={COR_TEXTO[p.previsao.tom]}>{p.previsao.texto}</span>
            )}
            {p.gargalo && <span className="text-gray-500"> · {p.gargalo}</span>}
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <MiniPulso pulso={p.pulso} nivel={p.nivel} />
            </div>
            <Avatares membros={p.membros} />
          </div>
        </div>
        <Anel progresso={p.progresso} nivel={p.nivel} />
      </div>
      {/* detalhes: ao passar o mouse ou focar (sempre visíveis em telas de toque) */}
      <div className="hidden items-end justify-between gap-3 border-t border-linha pt-2.5 text-xs text-gray-500 group-hover:flex group-focus-visible:flex [@media(hover:none)]:flex">
        <div className="min-w-0 space-y-0.5">
          <p>
            {p.etapasConcluidas} de {p.etapas.length} etapas · {p.prazo} · {p.previsao.texto}
          </p>
          {p.alerta && <p>{p.alerta}</p>}
        </div>
      </div>
    </Link>
  );
}

/** Card largo no topo: o projeto que mais precisa de ação, com o resumo da IA ao lado. */
function CardDestaque({ p, d }: { p: ResumoProjeto; d: NonNullable<Destaque> }) {
  return (
    <section className="space-y-3">
      <h2 className="rotulo text-vermelho!">Precisa de você agora</h2>
      <Link
        href={`/projetos/${p.id}`}
        className="grid gap-5 rounded-2xl border border-vermelho/40 bg-white p-5 transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-vermelho/70 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:p-6"
      >
        <div className="min-w-0 space-y-3">
          <div className="flex items-center gap-3.5">
            <Monograma texto={p.monograma} nivel={p.nivel} grande />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xl font-bold tracking-tight">{p.nome}</div>
              <div className="truncate text-sm text-gray-600">
                {p.cliente === p.nome ? p.subtitulo : p.cliente} · <span className="text-vermelho">{p.prazo}</span>
              </div>
            </div>
            <span className="ml-auto">
              <Anel progresso={p.progresso} nivel={p.nivel} />
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <MiniPulso pulso={p.pulso} nivel={p.nivel} />
            </div>
            <Avatares membros={p.membros} />
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-branco tabular-nums">{Math.round(p.progresso)}%</span>
            {p.entregaPrevista && (
              <>
                {" · entrega prevista "}
                <span className="font-semibold text-vermelho tabular-nums">{p.entregaPrevista}</span>
              </>
            )}
            {p.gargalo && (
              <>
                {" "}
                · gargalo principal: <span className="text-gray-800">{p.gargalo}</span>
              </>
            )}
          </p>
        </div>
        {(d.travou || d.primeiro) && (
          <div className="min-w-0 space-y-2 border-linha md:border-l md:pl-5">
            <p className={`rotulo ${d.ia ? "texto-ia" : ""}`}>Resumo da semana{d.ia ? " · IA" : ""}</p>
            {d.travou && (
              <p className="text-sm leading-snug text-gray-700">
                <span className="font-semibold text-branco">O que travou.</span> {d.travou}
              </p>
            )}
            {d.primeiro && (
              <p className="text-sm leading-snug text-gray-700">
                <span className="font-semibold text-branco">Fazer primeiro.</span> {d.primeiro}
              </p>
            )}
          </div>
        )}
      </Link>
    </section>
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

// ---------- pulso (traçado de monitor cardíaco) ----------

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

export function ListaProjetos({ projetos, naLixeira, destaque }: { projetos: ResumoProjeto[]; naLixeira: number; destaque: Destaque }) {
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
  // o destaque só aparece sem busca, nos cards de Em andamento (e sai do grupo para não repetir)
  const projetoDestaque = destaque && aba === "andamento" && !termo ? visiveis.find((p) => p.id === destaque.id) : undefined;
  const nosGrupos = projetoDestaque ? visiveis.filter((p) => p.id !== projetoDestaque.id) : visiveis;

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
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-xl border border-dashed border-branco/25 p-6 text-center text-sm text-gray-500">Nenhum projeto encontrado.</p>
      ) : aba === "andamento" ? (
        <div className="space-y-7">
          {projetoDestaque && destaque && <CardDestaque p={projetoDestaque} d={destaque} />}
          <Grupo titulo="Precisam de atenção" projetos={nosGrupos.filter((p) => p.nivel !== "verde")} Card={CardAndamento} />
          <Grupo titulo="No prazo" projetos={nosGrupos.filter((p) => p.nivel === "verde")} Card={CardAndamento} />
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
