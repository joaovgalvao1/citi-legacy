"use client";

// Fundo da página de entrada, em vetor (nítido em qualquer tela) e leve:
//   · Órbitas: anéis e brilho são uma imagem parada; só as "pessoas" giram, numa camada HTML própria
//     (a placa de vídeo move a camada sem redesenhar nada).
//   · Constelações: grupos de estrelas ligadas entre os anéis, parados (desenhados uma vez).
// Cada peça só anima enquanto aparece na tela (IntersectionObserver). No celular e com
// "reduzir movimento", o fundo fica parado (regras .giro-fundo em globals.css).

import { useEffect, useRef, useState } from "react";

type Pessoa = { a: number; r: number; tom?: "verde" | "roxo" | "cinza"; o?: number };
type Anel = { r: number; tracejado?: boolean; opacidade: number; reverso?: boolean; pessoas: Pessoa[] };

const ANEIS: Anel[] = [
  {
    r: 130,
    opacidade: 0.35,
    pessoas: [
      { a: 20, r: 9 },
      { a: 200, r: 6, o: 0.7 },
    ],
  },
  {
    r: 230,
    tracejado: true,
    opacidade: 0.22,
    reverso: true,
    pessoas: [
      { a: 70, r: 11 },
      { a: 160, r: 7, tom: "roxo", o: 0.8 },
      { a: 300, r: 8, o: 0.6 },
    ],
  },
  {
    r: 340,
    opacidade: 0.14,
    pessoas: [
      { a: 120, r: 9, o: 0.7 },
      { a: 240, r: 12, tom: "cinza" },
      { a: 350, r: 7, o: 0.5 },
    ],
  },
  {
    r: 460,
    tracejado: true,
    opacidade: 0.08,
    reverso: true,
    pessoas: [
      { a: 30, r: 8, o: 0.4 },
      { a: 210, r: 10, o: 0.35 },
    ],
  },
];

const COR = { verde: "bg-verde", roxo: "bg-roxo", cinza: "bg-branco/25" };

/** Gerador pseudoaleatório com semente (mulberry32): mesma entrada, mesmo desenho (servidor e navegador). */
function sorteio(texto: string) {
  let x = 0;
  for (const c of texto) x = (Math.imul(x, 31) + c.charCodeAt(0)) | 0;
  return () => {
    x = (x + 0x6d2b79f5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const CORES_CONSTELACAO = ["#00DB58", "#A78BFA", "#00DB58", "#FFA630", "#00DB58"];

/** Constelações entre os anéis (no vão entre 230 e 340 e entre 340 e 460) e poeira de estrelas. */
function constelacoes(id: string) {
  const rnd = sorteio(`constelacoes-${id}`);
  const grupos = Array.from({ length: 5 }, (_, g) => {
    const raio = g % 2 ? 285 : 405;
    const ang = (g / 5) * Math.PI * 2 + rnd() * 0.6;
    const cx = 500 + raio * Math.cos(ang);
    const cy = 500 + raio * Math.sin(ang);
    const k = 4 + Math.floor(rnd() * 5);
    const estrelas = Array.from({ length: k }, () => {
      const a = rnd() * Math.PI * 2;
      const d = 14 + rnd() * 42;
      return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, r: 2 + rnd() * 3, a };
    }).sort((p, q) => p.a - q.a);
    return { cor: CORES_CONSTELACAO[g % CORES_CONSTELACAO.length], estrelas };
  });
  const poeira = Array.from({ length: 70 }, () => {
    const a = rnd() * Math.PI * 2;
    const d = 160 + rnd() * 330;
    return { x: 500 + Math.cos(a) * d, y: 500 + Math.sin(a) * d, r: 1 + rnd() * 1.6 };
  });
  return { grupos, poeira };
}

/** Marca o elemento com data-ativo enquanto estiver (quase) na tela. */
function useVisivel<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { rootMargin: "100px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visivel };
}

export function Orbitas({
  id,
  className = "",
  brilho = 0.22,
  centro = true,
  estrelas = true,
}: {
  id: string;
  className?: string;
  brilho?: number;
  /** Ponto verde no centro (sem ele quando há conteúdo no meio, como na roda de membros). */
  centro?: boolean;
  /** Constelações e poeira de estrelas entre os anéis. */
  estrelas?: boolean;
}) {
  const { ref, visivel } = useVisivel<HTMLDivElement>();
  // com conteúdo no meio (centro=false), o anel mais interno sai para não passar por cima dele
  const aneis = centro ? ANEIS : ANEIS.slice(1);
  const ceu = estrelas ? constelacoes(id) : null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-ativo={visivel || undefined}
      className={`pointer-events-none absolute aspect-square ${className}`}
    >
      {/* parte parada: brilho e anéis (desenhada uma vez) */}
      <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={`brilho-${id}`}>
            <stop offset="0" stopColor="#00DB58" stopOpacity={brilho} />
            <stop offset="0.45" stopColor="#0b3a1f" stopOpacity={brilho * 1.6} />
            <stop offset="1" stopColor="#0a0a0a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="500" cy="500" r="500" fill={`url(#brilho-${id})`} />
        {aneis.map((anel) => (
          <circle
            key={anel.r}
            cx="500"
            cy="500"
            r={anel.r}
            fill="none"
            stroke="#00DB58"
            strokeOpacity={anel.opacidade}
            strokeWidth="1.5"
            strokeDasharray={anel.tracejado ? "3 9" : undefined}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {centro && <circle cx="500" cy="500" r="14" fill="#00DB58" fillOpacity="0.9" />}
        {ceu?.poeira.map((e, i) => (
          <circle key={`p${i}`} cx={r1(e.x)} cy={r1(e.y)} r={r1(e.r)} fill="#fff" fillOpacity="0.25" />
        ))}
        {ceu?.grupos.map((g, i) => (
          <g key={`c${i}`}>
            <polyline
              points={g.estrelas.map((e) => `${r1(e.x)},${r1(e.y)}`).join(" ")}
              fill="none"
              stroke={g.cor}
              strokeOpacity="0.3"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            {g.estrelas.map((e, j) => (
              <g key={j}>
                <circle cx={r1(e.x)} cy={r1(e.y)} r={r1(e.r * 3)} fill={g.cor} fillOpacity="0.07" />
                <circle cx={r1(e.x)} cy={r1(e.y)} r={r1(e.r)} fill={g.cor} fillOpacity="0.8" />
              </g>
            ))}
          </g>
        ))}
      </svg>
      {/* parte que gira: só as pessoas, uma camada por anel */}
      {aneis.map((anel) => (
        <div key={anel.r} className={`giro-fundo absolute inset-0 ${anel.reverso ? "anima-girar-reverso" : "anima-girar"}`}>
          {anel.pessoas.map((p) => {
            const t = (p.a * Math.PI) / 180;
            return (
              <span
                key={p.a}
                className={`absolute rounded-full ${COR[p.tom ?? "verde"]}`}
                style={{
                  left: `${(50 + (anel.r / 10) * Math.cos(t)).toFixed(3)}%`,
                  top: `${(50 + (anel.r / 10) * Math.sin(t)).toFixed(3)}%`,
                  width: `${p.r / 5}%`,
                  height: `${p.r / 5}%`,
                  transform: "translate(-50%, -50%)",
                  opacity: p.o ?? 1,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
