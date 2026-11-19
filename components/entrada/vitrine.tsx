// Peças ilustrativas da página de entrada (pública). Mostram o formato do produto — semáforo,
// previsão, Gantt, resumo da IA, conhecimento, modo reunião, boletim e GitHub — com conteúdo
// genérico: nenhum projeto, cliente ou pessoa real aparece aqui (esses dados ficam atrás do login).

import { IconeEmail, IconeGithub } from "@/components/ui/icones";

/** Nome protegido, como saldo de banco. */
export function Oculto({ n = 10, className = "" }: { n?: number; className?: string }) {
  return (
    <span aria-label="informação protegida" className={`dado tracking-[0.18em] text-gray-500 ${className}`}>
      {"•".repeat(n)}
    </span>
  );
}

const ponto = { verde: "bg-verde", ambar: "bg-ambar", vermelho: "bg-vermelho", neutro: "bg-branco/25" } as const;
export type Tom = keyof typeof ponto;

export function Ponto({ tom, pulsa = false }: { tom: Tom; pulsa?: boolean }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 shrink-0 rounded-full ${ponto[tom]} ${pulsa ? "anima-pulso" : ""}`} />;
}

/** Barra de etapas do projeto, uma fatia por etapa com a cor do semáforo. */
export function BarraEtapas({ etapas }: { etapas: { tom: Tom; feito: number }[] }) {
  return (
    <div className="flex gap-1">
      {etapas.map((e, i) => (
        <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-branco/10">
          <div className={`anima-barra h-full rounded-full ${ponto[e.tom]}`} style={{ width: `${e.feito}%` }} />
        </div>
      ))}
    </div>
  );
}

const COR_HEX: Record<Tom, string> = { verde: "#00DB58", ambar: "#FFA630", vermelho: "#FF3B3B", neutro: "rgb(255 255 255 / 0.3)" };

/** Pulso (traçado de monitor cardíaco, como nos cards de projeto): um batimento por dia com commits. */
export function Pulso({ valores, tom, className = "h-4" }: { valores: number[]; tom: Tom; className?: string }) {
  const L = 280;
  const A = 32;
  const passo = L / valores.length;
  const meio = A / 2;
  const max = Math.max(1, ...valores);
  let d = `M0 ${meio}`;
  valores.forEach((v, i) => {
    const x = i * passo;
    const a = v ? (0.4 + 0.6 * Math.sqrt(v / max)) * (meio - 2) : 0;
    d += ` L${(x + passo * 0.3).toFixed(1)} ${meio} L${(x + passo * 0.42).toFixed(1)} ${(meio + a * 0.25).toFixed(1)} L${(x + passo * 0.52).toFixed(1)} ${(meio - a).toFixed(1)} L${(x + passo * 0.64).toFixed(1)} ${(meio + a * 0.55).toFixed(1)} L${(x + passo * 0.74).toFixed(1)} ${meio} L${(x + passo).toFixed(1)} ${meio}`;
  });
  return (
    <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="none" className={`block w-full ${className}`} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke={COR_HEX[tom]}
        strokeOpacity="0.9"
        strokeWidth="1.4"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Anel de progresso na cor da situação (como nos cards de projeto). */
function AnelMini({ progresso, tom }: { progresso: number; tom: Tom }) {
  const r = 19;
  const volta = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" aria-hidden="true">
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="5" />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke={COR_HEX[tom]}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${((volta * progresso) / 100).toFixed(1)} ${volta.toFixed(1)}`}
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600">
        {progresso}%
      </text>
    </svg>
  );
}

// ---------- destaque: órbita + cards flutuando ----------

const ORBITA = [
  { a: 0, t: 30 },
  { a: 40, t: 22 },
  { a: 85, t: 26 },
  { a: 130, t: 20 },
  { a: 175, t: 28 },
  { a: 215, t: 22 },
  { a: 260, t: 26 },
  { a: 305, t: 20 },
];

export function VitrineDestaque() {
  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[500px] select-none">
      {/* trilhos */}
      <div className="absolute inset-[6%] rounded-full border border-dashed border-branco/12" />
      <div className="absolute inset-[22%] rounded-full border border-branco/6" />
      {/* pessoas em órbita (sem nome) */}
      <div className="anima-girar absolute inset-[6%]">
        {ORBITA.map((p, i) => {
          const r = (p.a * Math.PI) / 180;
          return (
            <span
              key={i}
              className={`absolute rounded-full ${i % 3 === 2 ? "bg-branco/20" : "bg-verde"} shadow-[0_0_0_3px_var(--color-fundo)]`}
              style={{
                width: p.t,
                height: p.t,
                left: `${50 + 50 * Math.cos(r)}%`,
                top: `${50 + 50 * Math.sin(r)}%`,
                transform: "translate(-50%, -50%)",
                opacity: i % 3 === 2 ? 1 : 0.55 + (i % 2) * 0.35,
              }}
            />
          );
        })}
      </div>
      <div className="anima-girar-reverso absolute inset-[22%]">
        {[20, 140, 260].map((a) => (
          <span
            key={a}
            className="absolute h-2.5 w-2.5 rounded-full bg-roxo/70"
            style={{
              left: `${50 + 50 * Math.cos((a * Math.PI) / 180)}%`,
              top: `${50 + 50 * Math.sin((a * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* resumo da IA */}
      <div className="anima-flutuar absolute top-[3%] right-0 w-[60%] rounded-xl borda-ia p-3 shadow-2xl shadow-black/60">
        <p className="texto-ia rotulo">Resumo da semana · IA</p>
        <p className="mt-1.5 text-[11px] leading-snug text-gray-700 sm:text-xs">
          <b className="text-branco">Pagamentos</b> avançou 3 tasks. <b className="text-branco">Relatórios</b> está parada há 9 dias:
          priorize destravar a integração.
        </p>
      </div>

      {/* card do projeto, igual aos cards da tela de projetos: monograma, situação, entrega prevista, pulso e anel */}
      <div className="absolute top-1/2 left-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-branco/12 bg-white p-3.5 shadow-2xl shadow-black/70 sm:p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ambar/12 text-xs font-bold text-ambar sm:h-11 sm:w-11">
            ••
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Oculto n={11} className="block truncate text-sm" />
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-ambar sm:text-[11px]">
                <Ponto tom="ambar" pulsa /> Atenção
              </span>
            </div>
            <p className="truncate text-[10px] text-gray-600 sm:text-[11px]">
              entrega prevista <b className="text-ambar tabular-nums">12/12</b> · Relatórios
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Pulso tom="ambar" valores={[0, 2, 0, 1, 0, 3, 1, 0, 0, 2, 4, 0, 1, 2]} className="h-3.5" />
              </div>
              <span className="flex -space-x-1.5" aria-hidden="true">
                {["bg-verde", "bg-roxo", "bg-verde/70"].map((c) => (
                  <span key={c} className={`h-4 w-4 rounded-full border-2 border-white ${c}`} />
                ))}
              </span>
            </div>
          </div>
          <AnelMini progresso={62} tom="ambar" />
        </div>
      </div>

      {/* Gantt */}
      <div className="anima-flutuar-lento absolute bottom-[3%] left-0 w-[64%] rounded-xl border border-branco/12 bg-white p-3 shadow-2xl shadow-black/60">
        <p className="rotulo">Linha do tempo</p>
        <div className="relative mt-4 space-y-1.5">
          {[
            { ini: 0, fim: 38, tom: "bg-verde" },
            { ini: 22, fim: 64, tom: "bg-verde/70" },
            { ini: 48, fim: 80, tom: "bg-ambar", extra: 14 },
          ].map((b, i) => (
            <div key={i} className="relative h-2.5 rounded-full bg-branco/5">
              <div className={`absolute inset-y-0 rounded-full ${b.tom}`} style={{ left: `${b.ini}%`, width: `${b.fim - b.ini}%` }} />
              {b.extra && (
                <div
                  className="absolute inset-y-0 rounded-r-full border border-dashed border-ambar/70"
                  style={{ left: `${b.fim}%`, width: `${b.extra}%` }}
                />
              )}
            </div>
          ))}
          <div className="absolute -inset-y-1 left-[58%] w-px bg-branco/70">
            <span className="dado absolute -top-3.5 -translate-x-1/2 text-[8px] text-gray-600">hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- mini ilustrações dos recursos ----------

export function MiniSemaforo() {
  const linhas: { tom: Tom; pulso: number[]; texto: string; cor: string }[] = [
    { tom: "verde", pulso: [2, 0, 3, 1, 2, 0, 4, 2, 1, 3, 0, 2, 3, 2], texto: "no prazo · 28/11", cor: "text-verde" },
    { tom: "ambar", pulso: [0, 2, 0, 1, 0, 3, 1, 0, 0, 2, 4, 0, 1, 0], texto: "previsão 12/12 · 7 dias depois", cor: "text-ambar" },
    { tom: "vermelho", pulso: [1, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], texto: "atrasado · gargalo: Pagamentos", cor: "text-vermelho" },
  ];
  return (
    <ul className="space-y-2.5">
      {linhas.map((l, i) => (
        <li
          key={i}
          className="grid grid-cols-[auto_minmax(0,5rem)_minmax(0,1fr)] items-center gap-3 rounded-lg border border-linha bg-fundo/60 px-3 py-2"
        >
          <Ponto tom={l.tom} pulsa={l.tom === "vermelho"} />
          <Oculto n={9} className="truncate text-xs" />
          <div className="space-y-1">
            <Pulso valores={l.pulso} tom={l.tom} className="h-4" />
            <p className={`dado truncate text-[10px] ${l.cor}`}>{l.texto}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MiniIA() {
  return (
    <div className="space-y-2 text-xs leading-snug text-gray-700">
      {[
        ["O que andou", "Autenticação concluída; Pagamentos com 3 tasks novas."],
        ["O que travou", "Relatórios sem commits há 9 dias."],
        ["Fazer primeiro", "Destravar a integração com o gateway."],
      ].map(([t, x]) => (
        <p key={t}>
          <span className="texto-ia font-semibold">{t}.</span> {x}
        </p>
      ))}
    </div>
  );
}

export function MiniConhecimento() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <div className="absolute inset-0 rounded-full border border-dashed border-branco/15" />
        <span className="absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-verde shadow-[0_0_0_3px_var(--color-white),0_0_0_4px_var(--color-verde)]" />
        {[0, 72, 144, 216, 288].map((a, i) => (
          <span
            key={a}
            className={`absolute h-4 w-4 rounded-full ${i === 3 ? "bg-branco/25" : "bg-verde/70"}`}
            style={{
              left: `${50 + 46 * Math.cos((a * Math.PI) / 180)}%`,
              top: `${50 + 46 * Math.sin((a * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {[64, 23, 13].map((v, i) => (
          <li key={v} className="flex items-center gap-2 text-[10px]">
            <Oculto n={5} />
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-branco/10">
              <span className={`anima-barra block h-full rounded-full ${i ? "bg-verde/60" : "bg-verde"}`} style={{ width: `${v}%` }} />
            </span>
            <span className="dado w-7 text-right text-gray-700">{v}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MiniReuniao() {
  return (
    <div className="space-y-2.5">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-branco/12 bg-fundo p-3">
        <p className="rotulo text-verde!">Panorama da semana</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {(["verde", "ambar", "vermelho"] as const).map((t, i) => (
            <div key={t} className="rounded-md border border-linha p-1.5">
              <span className={`dado block text-base leading-none font-bold ${["text-verde", "text-ambar", "text-vermelho"][i]}`}>
                {[3, 1, 1][i]}
              </span>
              <span className="text-[8px] text-gray-500">{["no prazo", "atenção", "atrasado"][i]}</span>
            </div>
          ))}
        </div>
        <span className="dado absolute right-2 bottom-1.5 text-[8px] text-gray-500">2 / 8</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-600">
        {["←", "→", "F"].map((k) => (
          <kbd key={k} className="dado rounded border border-branco/20 bg-branco/5 px-1.5 py-0.5">
            {k}
          </kbd>
        ))}
        <span className="ml-auto rounded-full border border-verde/40 bg-verde/10 px-2.5 py-0.5 text-verde">Exportar PDF</span>
      </div>
    </div>
  );
}

export function MiniEmail() {
  return (
    <div className="rounded-lg border border-branco/12 bg-fundo p-3 text-[11px]">
      <div className="flex items-center gap-2 text-gray-500">
        <IconeEmail className="h-3.5 w-3.5 text-verde" />
        <span className="truncate">Reunião da diretoria · segunda, 14h</span>
      </div>
      <div className="mt-2 space-y-1">
        <div className="h-1.5 w-11/12 rounded-full bg-branco/10" />
        <div className="h-1.5 w-3/4 rounded-full bg-branco/10" />
        <div className="h-1.5 w-4/5 rounded-full bg-branco/10" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-verde px-2.5 py-0.5 font-medium text-fundo">Ver boletim em PDF</span>
        <span className="rounded-full border border-branco/20 px-2.5 py-0.5 text-gray-700">+ Google Agenda</span>
      </div>
    </div>
  );
}

export function FluxoGithub() {
  const passos = [
    { titulo: "git push", texto: "a equipe trabalha normalmente", icone: true },
    { titulo: "webhook assinado", texto: "o GitHub avisa na hora (HMAC SHA-256)" },
    { titulo: "commits por etapa", texto: "cada arquivo cai na etapa do seu caminho" },
    { titulo: "painel atualizado", texto: "IC, previsão e calendário recalculados" },
  ];
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {passos.map((p, i) => (
        <li key={p.titulo} className="relative rounded-lg border border-linha bg-fundo/60 p-3">
          <span className="dado flex items-center gap-1.5 text-xs text-verde">
            {p.icone ? <IconeGithub className="h-3.5 w-3.5" /> : <span>0{i + 1}</span>}
            {p.titulo}
          </span>
          <p className="mt-1 text-[11px] text-gray-600">{p.texto}</p>
          {i < passos.length - 1 && (
            <span aria-hidden="true" className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 text-verde sm:block">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
