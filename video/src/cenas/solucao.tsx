// Trecho 3 (0:37–0:54): os repositórios alimentam o CITi Legacy; as constelações viram cards; a tela real.
import { AbsoluteFill, interpolate } from "remotion";
import { COR, inter, mono } from "../tema";
import { Fundo } from "../pecas";
import { Gravacao, Trecho, fora, segundos, useSurge } from "../midia";
import { CONSTELACOES, estrelasDe } from "./contexto";
import { LogoGitHub } from "./problema";

const REPOS = ["clinica-movimento", "folhagem-cia", "metalurgica-mezzalira", "plataforma-voluntariado", "citi-legacy"];
const SAIDAS: [rotulo: string, valor: string, cor: string, em: number][] = [
  ["Andamento", "59%", COR.ambar, 7.0],
  ["Previsão de entrega", "17/12 · no prazo", COR.verde, 7.9],
  ["Gargalo", "Interface de chat", COR.ambar, 8.8],
];

function Diagrama() {
  const t = segundos();
  const cx = 960;
  const cy = 500;
  const pulso = 1 + 0.06 * Math.max(0, Math.sin(t * 5)) * (t > 4.5 ? 1 : 0);
  const centro = useSurge(0.6, 0.6);
  return (
    <Fundo brilho={0.14}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {REPOS.map((_, i) => {
          const y = 230 + i * 135;
          const linha = interpolate(t, [1.6 + i * 0.2, 3 + i * 0.2], [0, 1], fora);
          const pac = ((t - 2 - i * 0.3) % 1.6) / 1.6;
          const px = 470 + (cx - 120 - 470) * pac;
          const py = y + (cy - y) * (pac * pac * (3 - 2 * pac));
          return (
            <g key={i}>
              <path d={`M470 ${y} C 680 ${y}, 700 ${cy}, ${cx - 120} ${cy}`} fill="none" stroke={COR.verde} strokeOpacity={0.45} strokeWidth={2.5} strokeDasharray="900" strokeDashoffset={900 * (1 - linha)} />
              {t > 2.5 && t < 9.5 && <circle cx={px} cy={py} r={7} fill={COR.verde} style={{ filter: "drop-shadow(0 0 8px #00DB58)" }} />}
            </g>
          );
        })}
        {SAIDAS.map(([, , , em], i) => {
          const y = 330 + i * 170;
          const linha = interpolate(t, [em - 0.6, em], [0, 1], fora);
          return <path key={i} d={`M${cx + 120} ${cy} C ${cx + 250} ${cy}, ${cx + 260} ${y}, ${cx + 380} ${y}`} fill="none" stroke={COR.verde} strokeOpacity={0.5} strokeWidth={2.5} strokeDasharray="500" strokeDashoffset={500 * (1 - linha)} />;
        })}
        <circle cx={cx} cy={cy} r={150 * pulso} fill="none" stroke={COR.verde} strokeOpacity={0.25 * centro} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={104} fill="#0f1f16" stroke={COR.verde} strokeWidth={3} opacity={centro} />
        <path d={`M${cx - 60} ${cy} h22 l12 -32 l16 64 l12 -32 h22`} fill="none" stroke={COR.verde} strokeWidth={5} strokeLinejoin="round" opacity={centro} />
      </svg>
      {REPOS.map((r, i) => {
        const e = interpolate(t, [0.2 + i * 0.15, 0.6 + i * 0.15], [0, 1], fora);
        return (
          <div key={r} style={{ position: "absolute", left: 90, top: 230 + i * 135 - 32, width: 380, height: 64, opacity: e, transform: `translateX(${(1 - e) * -30}px)`, display: "flex", alignItems: "center", gap: 14, padding: "0 20px", boxSizing: "border-box", background: "#0d1117", border: "1px solid #30363d", borderRadius: 12, fontFamily: mono, fontSize: 22, color: "#c9d1d9" }}>
            <LogoGitHub tam={28} />
            {r}
          </div>
        );
      })}
      {SAIDAS.map(([rot, val, cor, em], i) => {
        const e = interpolate(t, [em, em + 0.4], [0, 1], fora);
        return (
          <div key={rot} style={{ position: "absolute", left: cx + 390, top: 330 + i * 170 - 50, width: 440, opacity: e, transform: `translateX(${(1 - e) * 24}px)`, background: COR.superficie, border: `1px solid ${COR.linha}`, borderRadius: 16, padding: "18px 24px", fontFamily: inter }}>
            <div style={{ fontSize: 22, color: COR.cinza }}>{rot}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: cor, marginTop: 4 }}>{val}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: cx + 390, top: 170, fontFamily: mono, fontSize: 22, letterSpacing: "0.18em", color: COR.cinzaFraco, opacity: useSurge(6.6) }}>METALÚRGICA MEZZALIRA</div>
      <div style={{ position: "absolute", left: 90, top: 150, fontFamily: mono, fontSize: 22, letterSpacing: "0.18em", color: COR.cinzaFraco, opacity: useSurge(0.4) }}>COMMITS + TASKS</div>
    </Fundo>
  );
}

// cores reais do semáforo de cada projeto (tela de Projetos)
const CARDS = [
  { nome: "Plataforma de Voluntariado", cor: COR.vermelho, x: 300, y: 300, w: 1320, h: 170 },
  { nome: "Clínica Movimento", cor: COR.ambar, x: 300, y: 500, w: 650, h: 130 },
  { nome: "Metalúrgica Mezzalira", cor: COR.ambar, x: 970, y: 500, w: 650, h: 130 },
  { nome: "CITi Legacy", cor: COR.ambar, x: 300, y: 650, w: 650, h: 130 },
  { nome: "Folhagem & Cia", cor: COR.verde, x: 970, y: 650, w: 650, h: 130 },
];
const ORDEM = [0, 1, 2, 3, 4]; // CONSTELACOES: vermelho, âmbar, âmbar, âmbar, verde

function Cards() {
  const t = segundos();
  const junta = interpolate(t, [0, 1.1], [0, 1], { ...fora });
  const card = interpolate(t, [0.8, 1.4], [0, 1], fora);
  return (
    <Fundo brilho={0.16}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {CONSTELACOES.map((c, i) => {
          const alvo = CARDS[ORDEM[i]];
          return estrelasDe(i).map((p, j) => {
            const x = p.x + (alvo.x + 50 + (j / c.n) * (alvo.w - 100) - p.x) * junta;
            const y = p.y + (alvo.y + alvo.h / 2 - p.y) * junta;
            return <circle key={`${i}-${j}`} cx={x} cy={y} r={p.raio * (1 - junta * 0.5)} fill={c.cor} opacity={1 - card * 0.8} />;
          });
        })}
      </svg>
      {CARDS.map((c) => (
        <div key={c.nome} style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, opacity: card, background: COR.superficie, border: `2px solid ${c.cor}`, borderRadius: 20, display: "flex", alignItems: "center", gap: 18, padding: "0 32px", boxSizing: "border-box", fontFamily: inter }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: c.cor, boxShadow: `0 0 16px ${c.cor}` }} />
          <span style={{ fontSize: 34, fontWeight: 700 }}>{c.nome}</span>
        </div>
      ))}
    </Fundo>
  );
}


function TelaReal() {
  const slogan = useSurge(1.0, 0.6);
  return (
    <AbsoluteFill>
      <Gravacao src="projetos" de={0.5} cams={[[0, 1.0, 960, 540], [5, 1.06, 960, 470]]} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,10,0) 35%, rgba(10,10,10,0.94) 82%)" }} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
        <div style={{ opacity: slogan, transform: `translateY(${(1 - slogan) * 24}px)`, fontFamily: inter, fontSize: 58, letterSpacing: "-0.03em", textAlign: "center" }}>
          <span style={{ fontWeight: 300 }}>Todos os projetos do CITi,</span> <span style={{ fontWeight: 700, color: COR.verde }}>acompanhados semana a semana.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function Solucao() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco, fontFamily: inter }}>
      <Trecho de={0} dur={10.6}>
        <Diagrama />
      </Trecho>
      <Trecho de={10.9} dur={2.1}>
        <Cards />
      </Trecho>
      <Trecho de={12.6} dur={5.4}>
        <TelaReal />
      </Trecho>
    </AbsoluteFill>
  );
}
