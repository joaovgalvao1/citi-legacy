// Fundo da página de entrada: órbitas em vetor (anéis com pessoas girando devagar), no lugar da
// imagem de baixa resolução. Nítido em qualquer tela; espalhado ao longo da página para acompanhar
// a rolagem. As animações param com "reduzir movimento" (classes anima-girar*).

type Pessoa = { a: number; r: number; tom?: "verde" | "roxo" | "cinza"; o?: number };

const ANEIS: { r: number; tracejado?: boolean; opacidade: number; giro: "anima-girar" | "anima-girar-reverso"; pessoas: Pessoa[] }[] = [
  {
    r: 130,
    opacidade: 0.35,
    giro: "anima-girar",
    pessoas: [
      { a: 20, r: 9 },
      { a: 200, r: 6, o: 0.7 },
    ],
  },
  {
    r: 230,
    tracejado: true,
    opacidade: 0.22,
    giro: "anima-girar-reverso",
    pessoas: [
      { a: 70, r: 11 },
      { a: 160, r: 7, tom: "roxo", o: 0.8 },
      { a: 300, r: 8, o: 0.6 },
    ],
  },
  {
    r: 340,
    opacidade: 0.14,
    giro: "anima-girar",
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
    giro: "anima-girar-reverso",
    pessoas: [
      { a: 30, r: 8, o: 0.4 },
      { a: 210, r: 10, o: 0.35 },
    ],
  },
];

const COR = { verde: "var(--color-verde)", roxo: "var(--color-roxo)", cinza: "rgb(255 255 255 / 0.25)" };

export function Orbitas({ id, className = "", brilho = 0.22 }: { id: string; className?: string; brilho?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 1000" className={`pointer-events-none absolute ${className}`}>
      <defs>
        <radialGradient id={`brilho-${id}`}>
          <stop offset="0" stopColor="#00DB58" stopOpacity={brilho} />
          <stop offset="0.45" stopColor="#0b3a1f" stopOpacity={brilho * 1.6} />
          <stop offset="1" stopColor="#0a0a0a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="500" cy="500" r="500" fill={`url(#brilho-${id})`} />
      {ANEIS.map((anel) => (
        <g key={anel.r} className={anel.giro} style={{ transformOrigin: "500px 500px", transformBox: "view-box" }}>
          <circle
            cx="500"
            cy="500"
            r={anel.r}
            fill="none"
            stroke="var(--color-verde)"
            strokeOpacity={anel.opacidade}
            strokeWidth="1.5"
            strokeDasharray={anel.tracejado ? "3 9" : undefined}
            vectorEffect="non-scaling-stroke"
          />
          {anel.pessoas.map((p) => {
            const t = (p.a * Math.PI) / 180;
            return (
              <circle
                key={p.a}
                cx={500 + anel.r * Math.cos(t)}
                cy={500 + anel.r * Math.sin(t)}
                r={p.r}
                fill={COR[p.tom ?? "verde"]}
                fillOpacity={p.o ?? 1}
              />
            );
          })}
        </g>
      ))}
      <circle cx="500" cy="500" r="14" fill="var(--color-verde)" fillOpacity="0.9" />
    </svg>
  );
}
