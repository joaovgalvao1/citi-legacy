// Fundo da tela de projetos: constelação de commits.
// Cada commit da semana é uma estrela; as estrelas de um mesmo projeto se ligam numa constelação
// na cor da situação dele (mais commits = constelação maior). As constelações ficam espalhadas pelo
// cabeçalho e pelas margens da tela, sem passar por cima do título nem dos indicadores.
// As posições são relativas ao centro da tela (funcionam em qualquer largura) e o sorteio usa uma
// semente fixa (o id do projeto), então a constelação é sempre a mesma. Parada, sem animação.

type Projeto = { id: string; cor: string; commits: number };

// lugares das constelações (dx a partir do centro da tela, y a partir do topo; rx/ry = espalhamento),
// na ordem dos projetos (atrasados primeiro): margem esquerda descendo ao lado dos indicadores,
// logo depois do título, faixa do menu e margem direita
const LUGARES = [
  { dx: -640, y: 165, rx: 50, ry: 85 },
  { dx: -110, y: 100, rx: 70, ry: 20 },
  { dx: 70, y: 82, rx: 75, ry: 26 },
  { dx: 250, y: 95, rx: 85, ry: 30 },
  { dx: 560, y: 105, rx: 110, ry: 55 },
  { dx: 690, y: 210, rx: 40, ry: 50 },
  { dx: -420, y: 40, rx: 90, ry: 22 },
];

const MAX_ESTRELAS = 18;

/** Gerador pseudoaleatório com semente (mulberry32): mesma entrada, mesmas estrelas. */
function sorteio(texto: string) {
  let s = 0;
  for (const c of texto) s = (Math.imul(s, 31) + c.charCodeAt(0)) | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Fora do título e dos indicadores (coordenadas do desenho). */
const livre = (x: number, y: number) => !(x > -600 && x < -160 && y > 95 && y < 175) && !(x > -580 && x < 580 && y > 178);

export function ConstelacaoCommits({ projetos }: { projetos: Projeto[] }) {
  if (!projetos.length) return null;

  const grupos = projetos.slice(0, LUGARES.length).map((p, i) => {
    const rnd = sorteio(p.id);
    const lugar = LUGARES[i];
    const k = Math.max(3, Math.min(p.commits, MAX_ESTRELAS));
    const escala = 0.7 + k / (MAX_ESTRELAS * 2);
    const estrelas: { x: number; y: number; r: number; ang: number }[] = [];
    for (let tent = 0; estrelas.length < k && tent < k * 8; tent++) {
      const ang = rnd() * Math.PI * 2;
      const d = 0.3 + 0.7 * Math.sqrt(rnd());
      const x = lugar.dx + Math.cos(ang) * d * lugar.rx * escala;
      const y = lugar.y + Math.sin(ang) * d * lugar.ry * escala;
      if (livre(x, y)) estrelas.push({ x, y, r: 1.6 + rnd() * 2.4, ang });
    }
    // constelação: liga as estrelas em volta do centro (caminho aberto, como as do céu)
    const ordem = [...estrelas].sort((a, b) => a.ang - b.ang);
    return { p, estrelas, linha: ordem.map((e) => `${r1(e.x)},${r1(e.y)}`).join(" "), apagado: p.commits === 0 };
  });

  // poeira de fundo: estrelas brancas pequenas por toda a faixa, fora do título e dos indicadores
  const rnd = sorteio("poeira");
  const poeira = Array.from({ length: 90 }, () => ({ x: -800 + rnd() * 1600, y: 8 + rnd() * 270, r: 0.6 + rnd() * 0.9 })).filter((e) =>
    livre(e.x, e.y),
  );

  return (
    <svg viewBox="-800 0 1600 560" preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      {poeira.map((e, i) => (
        <circle key={i} cx={r1(e.x)} cy={r1(e.y)} r={r1(e.r)} fill="#fff" fillOpacity="0.28" />
      ))}
      {grupos.map(({ p, estrelas, linha, apagado }) => (
        <g key={p.id} opacity={apagado ? 0.35 : 1}>
          <polyline points={linha} fill="none" stroke={p.cor} strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {estrelas.map((e, i) => (
            <g key={i}>
              <circle cx={r1(e.x)} cy={r1(e.y)} r={r1(e.r * 3)} fill={p.cor} fillOpacity="0.08" />
              <circle cx={r1(e.x)} cy={r1(e.y)} r={r1(e.r)} fill={p.cor} fillOpacity="0.85" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
