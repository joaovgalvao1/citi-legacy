// Fundo da tela de projetos: um grafo de commits de verdade, no estilo do Git.
// Cada projeto em andamento é um ramo que sai do tronco à esquerda; cada nó é um dia com commits
// nas últimas 4 semanas (maior = mais commits), na cor da situação do projeto. Onde dois projetos
// tiveram commits no mesmo dia, um traço liga os ramos (como um merge). Atrás do cabeçalho,
// esmaecido para baixo; parado (sem animação), então não pesa.

type Ramo = { id: string; cor: string; pulso: number[] };

const L = 1200;
const A = 440;
const INICIO = 250; // onde os nós começam (depois das curvas de saída do tronco)
const TRONCO = 52;

export function GrafoCommits({ ramos }: { ramos: Ramo[] }) {
  if (!ramos.length) return null;
  const dias = ramos[0].pulso.length;
  const n = ramos.length;
  // faixas compactas: ficam na altura do título e dos indicadores, onde há vãos para aparecer
  const yDe = (i: number) => (n === 1 ? 110 : 84 + (i * 110) / (n - 1));
  const xDe = (d: number) => INICIO + (d / Math.max(1, dias - 1)) * (L - INICIO - 50);

  // ligações entre ramos vizinhos nos dias em que os dois tiveram commits (no máximo 2 por par)
  const ligacoes = ramos.slice(0, -1).flatMap((r, i) => {
    const prox = ramos[i + 1];
    return r.pulso
      .map((v, d) => (v && prox.pulso[d] ? d : -1))
      .filter((d) => d >= 0)
      .filter((_, k, lista) => k === 0 || k === lista.length - 1)
      .map((d) => ({ d, i }));
  });

  return (
    <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      {/* tronco */}
      <path
        d={`M-20 ${TRONCO} L${L + 20} ${TRONCO}`}
        stroke="#00DB58"
        strokeOpacity="0.28"
        strokeWidth="2"
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
      {[60, 140].map((x) => (
        <circle key={x} cx={x} cy={TRONCO} r="5" fill="#0a0a0a" stroke="#00DB58" strokeOpacity="0.5" strokeWidth="2" />
      ))}
      {ramos.map((r, i) => {
        const y = yDe(i);
        const saida = 110 + i * 22;
        return (
          <g key={r.id}>
            {/* ramo: sai do tronco e corre até hoje */}
            <path
              d={`M${saida} ${TRONCO} C ${saida + 60} ${TRONCO}, ${saida + 40} ${y}, ${saida + 110} ${y} L ${L - 40} ${y}`}
              stroke={r.cor}
              strokeOpacity="0.38"
              strokeWidth="1.6"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={saida} cy={TRONCO} r="4" fill={r.cor} fillOpacity="0.7" />
            {/* commits: um nó por dia com commits */}
            {r.pulso.map((v, d) =>
              v ? (
                <circle
                  key={d}
                  cx={xDe(d)}
                  cy={y}
                  r={3 + Math.min(v, 9) * 0.75}
                  fill="#0a0a0a"
                  stroke={r.cor}
                  strokeOpacity={0.45 + Math.min(v, 9) * 0.05}
                  strokeWidth="2"
                />
              ) : null,
            )}
          </g>
        );
      })}
      {/* merges entre ramos vizinhos */}
      {ligacoes.map(({ d, i }) => {
        const x = xDe(d);
        const y1 = yDe(i);
        const y2 = yDe(i + 1);
        return (
          <path
            key={`${i}-${d}`}
            d={`M${x} ${y1 + 6} C ${x + 18} ${(y1 + y2) / 2}, ${x - 18} ${(y1 + y2) / 2}, ${x} ${y2 - 6}`}
            stroke="#A78BFA"
            strokeOpacity="0.4"
            strokeWidth="1.4"
            fill="none"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {/* hoje */}
      <line
        x1={L - 40}
        x2={L - 40}
        y1={TRONCO}
        y2={A}
        stroke="#fff"
        strokeOpacity="0.18"
        strokeDasharray="3 6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
