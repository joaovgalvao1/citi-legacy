"use client";

// Fundo da página de entrada, em vetor (nítido em qualquer tela) e leve:
//   · Órbitas: anéis e brilho são uma imagem parada; só as "pessoas" giram, numa camada HTML própria
//     (a placa de vídeo move a camada sem redesenhar nada).
//   · Ramificações: linhas de branch com commits, paradas (o produto nasce do Git).
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
}: {
  id: string;
  className?: string;
  brilho?: number;
  /** Ponto verde no centro (sem ele quando há conteúdo no meio, como na roda de membros). */
  centro?: boolean;
}) {
  const { ref, visivel } = useVisivel<HTMLDivElement>();
  // com conteúdo no meio (centro=false), o anel mais interno sai para não passar por cima dele
  const aneis = centro ? ANEIS : ANEIS.slice(1);
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

// ---------- ramificações (grafo de commits) ----------

type Ramo = { d: string; cor: string; o: number; nos: [number, number][] };

const RAMOS: Ramo[] = [
  {
    d: "M300 0 C 330 260, 320 520, 340 1000",
    cor: "#00DB58",
    o: 0.5,
    nos: [
      [306, 90],
      [318, 260],
      [324, 430],
      [330, 640],
      [338, 860],
    ],
  },
  {
    d: "M318 260 C 420 300, 470 380, 480 470 S 420 640, 330 700",
    cor: "#00DB58",
    o: 0.32,
    nos: [
      [440, 340],
      [480, 470],
      [430, 610],
    ],
  },
  {
    d: "M324 430 C 520 450, 600 520, 640 650 S 700 860, 760 1000",
    cor: "#A78BFA",
    o: 0.4,
    nos: [
      [520, 460],
      [620, 590],
      [690, 820],
    ],
  },
  {
    d: "M480 470 C 600 420, 700 330, 820 300",
    cor: "#00DB58",
    o: 0.2,
    nos: [
      [640, 400],
      [800, 305],
    ],
  },
  { d: "M120 0 C 140 200, 180 330, 306 380", cor: "#00DB58", o: 0.16, nos: [[150, 160]] },
];

export function Ramificacoes({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 1000" className={`pointer-events-none absolute aspect-square ${className}`}>
      <defs>
        <radialGradient id="brilho-ramos" cx="0.45" cy="0.5">
          <stop offset="0" stopColor="#0b3a1f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="450" cy="500" r="500" fill="url(#brilho-ramos)" />
      {RAMOS.map((r) => (
        <g key={r.d}>
          <path
            d={r.d}
            fill="none"
            stroke={r.cor}
            strokeOpacity={r.o}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {r.nos.map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="9"
              fill="#0a0a0a"
              stroke={r.cor}
              strokeOpacity={Math.min(1, r.o + 0.35)}
              strokeWidth="3"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
