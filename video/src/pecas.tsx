// Peças comuns das cenas: fundo, entrada/saída suave, rótulo, logo, legenda e destaque.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { COR, inter, mono } from "./tema";

/** Fundo escuro do app com o brilho verde do topo. */
export function Fundo({ children, brilho = 0.35 }: { children?: ReactNode; brilho?: number }) {
  return (
    <AbsoluteFill style={{ background: COR.fundo, fontFamily: inter, color: COR.branco }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 80% 55% at 50% -10%, rgba(0,219,88,${brilho}) 0%, rgba(11,58,31,${brilho * 0.8}) 35%, rgba(10,10,10,0) 75%)` }}
      />
      {children}
    </AbsoluteFill>
  );
}

/** Cena com entrada e saída em fade (para a sequência não ter cortes secos). */
export function Cena({ children, duracao, entrada = 12, saida = 12 }: { children: ReactNode; duracao: number; entrada?: number; saida?: number }) {
  const f = useCurrentFrame();
  const opacidade = interpolate(f, [0, entrada, duracao - saida, duracao], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: opacidade }}>{children}</AbsoluteFill>;
}

export function Rotulo({ children, cor = COR.verde, style }: { children: ReactNode; cor?: string; style?: CSSProperties }) {
  return <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", color: cor, ...style }}>{children}</div>;
}

export function Logo({ altura = 90, comLegacy = true }: { altura?: number; comLegacy?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: altura * 0.32 }}>
      <Img src={staticFile("marca/citi-logo-verde.svg")} style={{ height: altura }} />
      {comLegacy && (
        <>
          <div style={{ width: 2, height: altura * 0.75, background: "rgba(255,255,255,0.35)" }} />
          <div style={{ fontSize: altura * 0.36, letterSpacing: "0.35em", fontWeight: 500 }}>LEGACY</div>
        </>
      )}
    </div>
  );
}

/** Aparece com mola a partir de `inicio` (frames). */
export function useEntrada(inicio: number, amortecimento = 18) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - inicio, fps, config: { damping: amortecimento } });
}

export const suave = (f: number, de: [number, number], para: [number, number]) =>
  interpolate(f, de, para, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.22, 1, 0.36, 1) });

/** Legenda da narração, embaixo, com troca suave entre as frases. */
export function Legenda({ frases, duracao }: { frases: string[]; duracao: number }) {
  const f = useCurrentFrame();
  // tempo de cada frase proporcional ao tamanho do texto
  const total = frases.reduce((a, t) => a + t.length, 0);
  let inicio = 0;
  const blocos = frases.map((t) => {
    const fim = inicio + (t.length / total) * (duracao - 20);
    const b = { t, de: inicio + 10, ate: fim + 10 };
    inicio = fim;
    return b;
  });
  const atual = blocos.find((b) => f >= b.de && f < b.ate);
  if (!atual) return null;
  const op = interpolate(f, [atual.de, atual.de + 8, atual.ate - 8, atual.ate], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 54, pointerEvents: "none" }}>
      <div
        style={{
          opacity: op,
          maxWidth: 1400,
          textAlign: "center",
          fontFamily: inter,
          fontSize: 34,
          lineHeight: 1.35,
          fontWeight: 400,
          color: "#fff",
          background: "rgba(10,10,10,0.78)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          padding: "14px 28px",
        }}
      >
        {atual.t}
      </div>
    </AbsoluteFill>
  );
}

/** Caixa de destaque verde sobre uma tela (coordenadas em px da tela 1920×1080). */
export function Destaque({ x, y, w, h, inicio, cor = COR.verde, rotulo }: { x: number; y: number; w: number; h: number; inicio: number; cor?: string; rotulo?: string }) {
  const e = useEntrada(inicio, 16);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: e, transform: `scale(${0.96 + e * 0.04})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: `3px solid ${cor}`, boxShadow: `0 0 40px ${cor}66` }} />
      {rotulo && (
        <div
          style={{
            position: "absolute",
            top: -54,
            left: 0,
            background: cor,
            color: COR.fundo,
            fontFamily: inter,
            fontWeight: 600,
            fontSize: 26,
            padding: "6px 16px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {rotulo}
        </div>
      )}
    </div>
  );
}

/** Tela real do app com zoom/pan suave (Ken Burns): de [escala, x, y] para [escala, x, y]. */
export function Tela({ src, de, para, inicio = 0, fim, children }: { src: string; de: [number, number, number]; para: [number, number, number]; inicio?: number; fim: number; children?: ReactNode }) {
  const f = useCurrentFrame();
  const t = suave(f, [inicio, fim], [0, 1]);
  const esc = de[0] + (para[0] - de[0]) * t;
  const x = de[1] + (para[1] - de[1]) * t;
  const y = de[2] + (para[2] - de[2]) * t;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: COR.fundo, fontFamily: inter }}>
      <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${esc})`, transformOrigin: "0 0" }}>
        <Img src={staticFile(`telas/${src}.png`)} style={{ width: 1920, height: 1080 }} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
