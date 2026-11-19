// Cena 2: commits caem como estrelas e formam uma constelação por projeto; planilha e grupo somem.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COR, mono, sorteio } from "../tema";
import { Fundo, Rotulo, suave, useEntrada } from "../pecas";

export const CONSTELACOES = [
  { cor: COR.vermelho, cx: 360, cy: 360, n: 9 },
  { cor: COR.ambar, cx: 760, cy: 280, n: 12 },
  { cor: COR.ambar, cx: 1160, cy: 380, n: 10 },
  { cor: COR.ambar, cx: 1540, cy: 290, n: 14 },
  { cor: COR.verde, cx: 960, cy: 600, n: 11 },
];

export function estrelasDe(i: number) {
  const c = CONSTELACOES[i];
  const r = sorteio(100 + i);
  const pts = Array.from({ length: c.n }, () => {
    const a = r() * Math.PI * 2;
    const d = 40 + r() * 120;
    return { x: c.cx + Math.cos(a) * d * 1.3, y: c.cy + Math.sin(a) * d * 0.8, a, t: r(), raio: 4 + r() * 6 };
  });
  return pts.sort((p, q) => p.a - q.a);
}

function Contador({ valor, rotulo, inicio }: { valor: number; rotulo: string; inicio: number }) {
  const f = useCurrentFrame();
  const e = useEntrada(inicio);
  const n = Math.round(interpolate(f, [inicio, inicio + 45], [0, valor], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ opacity: e, transform: `translateY(${(1 - e) * 20}px)`, textAlign: "center" }}>
      <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 28, color: COR.cinza, marginTop: 8 }}>{rotulo}</div>
    </div>
  );
}

function Riscado({ texto, inicio, x, y }: { texto: string; inicio: number; x: number; y: number }) {
  const f = useCurrentFrame();
  const e = useEntrada(inicio);
  const risco = suave(f, [inicio + 40, inicio + 60], [0, 1]);
  const some = interpolate(f, [inicio + 80, inicio + 100], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: e * some, fontFamily: mono, fontSize: 30, color: COR.cinza, padding: "14px 24px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, background: COR.superficie }}>
      {texto}
      <div style={{ position: "absolute", left: 12, right: 12, top: "50%", height: 3, background: COR.vermelho, transform: `scaleX(${risco})`, transformOrigin: "left" }} />
    </div>
  );
}

export function Contexto() {
  const f = useCurrentFrame();
  const linhas = suave(f, [260, 360], [0, 1]);
  const saiEstrelas = interpolate(f, [440, 480], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Fundo brilho={0.18}>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: saiEstrelas }}>
        {CONSTELACOES.map((c, i) => {
          const pts = estrelasDe(i);
          return (
            <g key={i}>
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={c.cor} strokeOpacity={0.45 * linhas} strokeWidth={2} />
              {pts.map((p, j) => {
                const ini = 20 + i * 25 + p.t * 140;
                const cai = suave(f, [ini, ini + 40], [0, 1]);
                return (
                  <g key={j} opacity={cai}>
                    <circle cx={p.x} cy={p.y - (1 - cai) * 500} r={p.raio * 3} fill={c.cor} opacity={0.12} />
                    <circle cx={p.x} cy={p.y - (1 - cai) * 500} r={p.raio} fill={c.cor} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 200 }}>
        <div style={{ display: "flex", gap: 140, opacity: interpolate(f, [440, 470], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <Contador valor={5} rotulo="projetos em andamento" inicio={300} />
          <Contador valor={21} rotulo="pessoas nas equipes" inicio={325} />
          <Contador valor={892} rotulo="commits analisados" inicio={350} />
        </div>
      </AbsoluteFill>
      <Riscado texto="planilha_status_FINAL_v3.xlsx" inicio={470} x={300} y={420} />
      <Riscado texto="Grupo: “alguém sabe como está o projeto?”" inicio={500} x={980} y={560} />
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 110 }}>
        <Rotulo style={{ opacity: suave(f, [30, 60], [0, 1]) * interpolate(f, [440, 470], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          cada estrela é um commit
        </Rotulo>
      </AbsoluteFill>
    </Fundo>
  );
}
