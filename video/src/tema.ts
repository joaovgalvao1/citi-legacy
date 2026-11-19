// Identidade do CITi Legacy no vídeo: as mesmas cores e fontes do app.
import { loadFont as carregarInter } from "@remotion/google-fonts/InterTight";
import { loadFont as carregarMono } from "@remotion/google-fonts/IBMPlexMono";

export const inter = carregarInter("normal", { weights: ["300", "400", "500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const mono = carregarMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;

export const COR = {
  fundo: "#0a0a0a",
  superficie: "#141414",
  linha: "rgba(255,255,255,0.08)",
  verde: "#00DB58",
  ambar: "#FFA630",
  vermelho: "#FF3B3B",
  roxo: "#A78BFA",
  branco: "#ffffff",
  cinza: "rgba(255,255,255,0.6)",
  cinzaFraco: "rgba(255,255,255,0.4)",
};

export const FPS = 30;
export const s = (segundos: number) => Math.round(segundos * FPS);

/** Gerador pseudoaleatório com semente: o vídeo sai sempre igual. */
export function sorteio(semente: number) {
  let x = semente | 0;
  return () => {
    x = (x + 0x6d2b79f5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
