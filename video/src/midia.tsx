// Peças da versão final: gravações com câmera, fala em trechos, legenda sincronizada,
// desfoque, moldura de aparelho e etiquetas.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing } from "remotion";
import { COR, FPS, inter, mono } from "./tema";

export const fora = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

/** Trecho de uma cena: começa em `de` segundos e dura `dur` segundos. */
export function Trecho({ de, dur, children, fade = 0.35 }: { de: number; dur: number; children: ReactNode; fade?: number }) {
  return (
    <Sequence from={Math.round(de * FPS)} durationInFrames={Math.round(dur * FPS)} layout="none">
      <Fade dur={dur} fade={fade}>
        {children}
      </Fade>
    </Sequence>
  );
}

function Fade({ dur, fade, children }: { dur: number; fade: number; children: ReactNode }) {
  const f = useCurrentFrame() / FPS;
  const op = fade ? interpolate(f, [0, fade, dur - fade, dur], [0, 1, 1, 0], fora) : 1;
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
}

/** Ponto da câmera: no segundo t, escala e ponto focal (cx, cy) em px da gravação. */
export type Cam = [t: number, escala: number, cx: number, cy: number];

export function camera(t: number, cams: Cam[], w = 1920, h = 1080) {
  let a = cams[0];
  let b = cams[cams.length - 1];
  for (let i = 0; i < cams.length - 1; i++) {
    if (t >= cams[i][0] && t <= cams[i + 1][0]) {
      a = cams[i];
      b = cams[i + 1];
      break;
    }
  }
  const k = b[0] === a[0] ? 1 : ease(Math.min(1, Math.max(0, (t - a[0]) / (b[0] - a[0]))));
  const esc = a[1] + (b[1] - a[1]) * k;
  let cx = a[2] + (b[2] - a[2]) * k;
  let cy = a[3] + (b[3] - a[3]) * k;
  // não deixa aparecer borda vazia
  const meiaW = 960 / esc;
  const meiaH = 540 / esc;
  if (esc >= 1) {
    cx = Math.min(w - meiaW, Math.max(meiaW, cx));
    cy = Math.min(h - meiaH, Math.max(meiaH, cy));
  }
  return { esc, x: 960 - cx * esc, y: 540 - cy * esc };
}

/**
 * Gravação de tela com câmera. `de` = segundo da gravação em que começa; `taxa` acelera.
 * `sobre` recebe filhos posicionados em px da gravação (acompanham o zoom).
 */
export function Gravacao({ src, de, taxa = 1, cams = [[0, 1, 960, 540]], sobre, w = 1920, h = 1080 }: { src: string; de: number; taxa?: number; cams?: Cam[]; sobre?: ReactNode; w?: number; h?: number }) {
  const t = useCurrentFrame() / FPS;
  const c = camera(t, cams, w, h);
  return (
    <AbsoluteFill style={{ background: COR.fundo, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `translate(${c.x}px, ${c.y}px) scale(${c.esc})` }}>
        <OffthreadVideo src={staticFile(`gravacoes/${src}.mp4`)} trimBefore={Math.round(de * FPS)} playbackRate={taxa} muted style={{ width: w, height: h }} />
        {sobre}
      </div>
    </AbsoluteFill>
  );
}

/** Fala em trechos: cada trecho [a, b] do arquivo toca no segundo `em` da cena. */
export function Fala({ arquivo, trechos, volume = 1 }: { arquivo: string; trechos: { a: number; b?: number; em: number }[]; volume?: number }) {
  return (
    <>
      {trechos.map((t, i) => (
        <Sequence key={i} from={Math.round(t.em * FPS)} layout="none">
          <Audio src={staticFile(`voz/${arquivo}.mp3`)} trimBefore={Math.round(t.a * FPS)} trimAfter={t.b === undefined ? undefined : Math.round(t.b * FPS)} volume={volume} />
        </Sequence>
      ))}
    </>
  );
}

/** Legenda com tempos explícitos (segundos da cena). */
export function Legenda({ frases }: { frases: [texto: string, de: number, ate: number][] }) {
  const t = useCurrentFrame() / FPS;
  const atual = frases.find(([, de, ate]) => t >= de && t < ate);
  if (!atual) return null;
  const [texto, de, ate] = atual;
  const op = interpolate(t, [de, de + 0.2, ate - 0.2, ate], [0, 1, 1, 0], fora);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46, pointerEvents: "none" }}>
      <div
        style={{
          opacity: op,
          maxWidth: 1500,
          textAlign: "center",
          fontFamily: inter,
          fontSize: 32,
          lineHeight: 1.35,
          color: "#fff",
          background: "rgba(10,10,10,0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "12px 26px",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
}

/** Retângulo desfocado (para esconder dados pessoais), em px da gravação. */
export function Borrao({ x, y, w, h, escuro = 0.5 }: { x: number; y: number; w: number; h: number; escuro?: number }) {
  return <div style={{ position: "absolute", left: x, top: y, width: w, height: h, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: `rgba(10,10,10,${escuro})` }} />;
}

/** Caixa de destaque que acende no segundo `em` da cena. */
export function Realce({ x, y, w, h, em, cor = COR.verde, rotulo, raio = 14, lado = "cima" }: { x: number; y: number; w: number; h: number; em: number; cor?: string; rotulo?: string; raio?: number; lado?: "cima" | "baixo" }) {
  const t = useCurrentFrame() / FPS;
  const e = interpolate(t, [em, em + 0.35], [0, 1], { ...fora, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity: e, transform: `scale(${0.97 + e * 0.03})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: raio, border: `3px solid ${cor}`, boxShadow: `0 0 36px ${cor}66` }} />
      {rotulo && (
        <div style={{ position: "absolute", [lado === "cima" ? "bottom" : "top"]: h + 12, left: 0, background: cor, color: COR.fundo, fontFamily: inter, fontWeight: 600, fontSize: 24, padding: "6px 16px", borderRadius: 999, whiteSpace: "nowrap" }}>
          {rotulo}
        </div>
      )}
    </div>
  );
}

/** Etiqueta (pílula) que entra no segundo `em`. */
export function Etiqueta({ children, em, style, cor = COR.verde, texto = COR.fundo }: { children: ReactNode; em: number; style?: CSSProperties; cor?: string; texto?: string }) {
  const t = useCurrentFrame() / FPS;
  const e = interpolate(t, [em, em + 0.35], [0, 1], { ...fora, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ position: "absolute", opacity: e, transform: `translateY(${(1 - e) * 14}px)`, background: cor, color: texto, fontFamily: inter, fontWeight: 600, fontSize: 26, padding: "8px 20px", borderRadius: 999, whiteSpace: "nowrap", ...style }}>
      {children}
    </div>
  );
}

/** Aparece (opacidade e subida) a partir do segundo `em`. */
export function useSurge(em: number, dur = 0.45) {
  const t = useCurrentFrame() / FPS;
  return interpolate(t, [em, em + dur], [0, 1], { ...fora, easing: Easing.out(Easing.cubic) });
}

export function segundos() {
  return useCurrentFrame() / FPS;
}

/** Barra de status limpa (cobre a original das gravações do iPad e do celular). */
export function BarraStatus({ largura, altura, hora = "9:41", fonte = 26 }: { largura: number; altura: number; hora?: string; fonte?: number }) {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: largura, height: altura, background: "#000", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${altura * 0.9}px`, boxSizing: "border-box", fontFamily: inter, fontWeight: 600, fontSize: fonte, color: "#fff" }}>
      <span>{hora}</span>
      <span style={{ display: "flex", gap: fonte * 0.5, alignItems: "center" }}>
        <span style={{ display: "inline-flex", gap: 3, alignItems: "flex-end" }}>
          {[0.4, 0.6, 0.8, 1].map((k) => (
            <span key={k} style={{ width: fonte * 0.18, height: fonte * 0.7 * k, background: "#fff", borderRadius: 2 }} />
          ))}
        </span>
        <span style={{ width: fonte * 1.6, height: fonte * 0.75, border: "2px solid #fff", borderRadius: 5, position: "relative" }}>
          <span style={{ position: "absolute", inset: 2, right: "18%", background: "#fff", borderRadius: 2 }} />
        </span>
      </span>
    </div>
  );
}

/** Aparelho com a gravação dentro (iPad em paisagem ou celular em retrato). */
export function Aparelho({ tipo, de, taxa = 1, largura, style }: { tipo: "ipad" | "celular"; de: number; taxa?: number; largura: number; style?: CSSProperties }) {
  const W = tipo === "ipad" ? 2360 : 1170;
  const H = tipo === "ipad" ? 1640 : 2532;
  const k = largura / W;
  const borda = tipo === "ipad" ? 26 : 22;
  const barra = tipo === "ipad" ? 52 : 140;
  return (
    <div style={{ position: "absolute", width: largura + borda * 2, height: H * k + borda * 2, borderRadius: tipo === "ipad" ? 46 : 64, background: "#1c1c1e", boxShadow: "0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 2px #333", padding: borda, boxSizing: "border-box", ...style }}>
      <div style={{ width: largura, height: H * k, borderRadius: tipo === "ipad" ? 24 : 46, overflow: "hidden", position: "relative", background: "#000" }}>
        <div style={{ width: W, height: H, transform: `scale(${k})`, transformOrigin: "0 0", position: "relative" }}>
          <OffthreadVideo src={staticFile(`gravacoes/${tipo}.mp4`)} trimBefore={Math.round(de * FPS)} playbackRate={taxa} muted style={{ width: W, height: H }} />
          <BarraStatus largura={W} altura={barra} fonte={tipo === "ipad" ? 30 : 44} />
        </div>
      </div>
    </div>
  );
}

export function Mono({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <span style={{ fontFamily: mono, ...style }}>{children}</span>;
}
