// Cena 1: um pulso verde atravessa a tela preta e vira o logo.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COR } from "../tema";
import { Fundo, Logo, suave, useEntrada } from "../pecas";

const L = 1920;
const MEIO = 540;
// traçado de monitor cardíaco: linha reta com batimentos
function tracado() {
  let d = `M0 ${MEIO}`;
  const batidas = [360, 700, 1040, 1380];
  let x = 0;
  for (const b of batidas) {
    d += ` L${b - 40} ${MEIO} L${b - 20} ${MEIO + 30} L${b} ${MEIO - 150} L${b + 22} ${MEIO + 90} L${b + 44} ${MEIO}`;
    x = b + 44;
  }
  return d + ` L${L} ${MEIO}`.replace(String(x), String(x));
}

export function Abertura() {
  const f = useCurrentFrame();
  const desenho = suave(f, [10, 120], [0, 1]);
  const somePulso = interpolate(f, [130, 170], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logo = useEntrada(140, 20);
  const slogan = useEntrada(200, 22);
  const comprimento = 3400;
  return (
    <Fundo brilho={0.12 + logo * 0.2}>
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: somePulso }}>
        <path
          d={tracado()}
          fill="none"
          stroke={COR.verde}
          strokeWidth={5}
          strokeLinejoin="round"
          strokeDasharray={comprimento}
          strokeDashoffset={comprimento * (1 - desenho)}
          style={{ filter: "drop-shadow(0 0 12px rgba(0,219,88,0.8))" }}
        />
        <circle cx={L * desenho} cy={MEIO} r={10} fill={COR.verde} opacity={desenho < 1 ? 1 : 0} />
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
        <div style={{ opacity: logo, transform: `scale(${0.85 + logo * 0.15})` }}>
          <Logo altura={150} />
        </div>
        <div style={{ opacity: slogan, transform: `translateY(${(1 - slogan) * 20}px)`, fontSize: 40, fontWeight: 300, color: COR.cinza }}>
          Todos os projetos do CITi, <span style={{ color: COR.verde, fontWeight: 600 }}>acompanhados semana a semana.</span>
        </div>
      </AbsoluteFill>
    </Fundo>
  );
}
