// Cena 3: as constelações viram os cards da tela de Projetos real.
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COR } from "../tema";
import { Fundo, suave, useEntrada } from "../pecas";
import { CONSTELACOES, estrelasDe } from "./contexto";

// posição de cada card na tela de Projetos (captura em 1920×1080)
const CARDS = [
  { x: 400, y: 600, w: 1120, h: 185 },
  { x: 400, y: 820, w: 552, h: 120 },
  { x: 968, y: 820, w: 552, h: 120 },
  { x: 400, y: 955, w: 552, h: 120 },
  { x: 968, y: 955, w: 552, h: 120 },
];

export function Ideia() {
  const f = useCurrentFrame();
  const junta = suave(f, [20, 120], [0, 1]);
  const card = suave(f, [100, 160], [0, 1]);
  const tela = interpolate(f, [170, 230], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slogan = useEntrada(250);
  return (
    <Fundo brilho={0.25}>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 1 - tela }}>
        {CONSTELACOES.map((c, i) => {
          const alvo = CARDS[i];
          return estrelasDe(i).map((p, j) => {
            const x = p.x + (alvo.x + 40 + (j / c.n) * (alvo.w - 80) - p.x) * junta;
            const y = p.y + (alvo.y + alvo.h / 2 - p.y) * junta;
            return <circle key={`${i}-${j}`} cx={x} cy={y} r={p.raio * (1 - junta * 0.5)} fill={c.cor} />;
          });
        })}
        {CARDS.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx={20} fill={COR.superficie} stroke={CONSTELACOES[i].cor} strokeOpacity={0.5} opacity={card} />
        ))}
      </svg>
      <AbsoluteFill style={{ opacity: tela }}>
        <Img src={staticFile("telas/projetos.png")} style={{ width: 1920, height: 1080 }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,0) 30%, rgba(10,10,10,0.92) 85%)" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 250 }}>
        <div style={{ opacity: slogan, transform: `translateY(${(1 - slogan) * 24}px)`, fontSize: 56, letterSpacing: "-0.03em", textAlign: "center" }}>
          <span style={{ fontWeight: 300 }}>Todos os projetos do CITi,</span>{" "}
          <span style={{ fontWeight: 700, color: COR.verde }}>acompanhados semana a semana.</span>
        </div>
      </AbsoluteFill>
    </Fundo>
  );
}
