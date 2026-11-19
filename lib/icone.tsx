// Ícone do CITi Legacy (aba do navegador, tela inicial do celular e PWA), gerado em PNG.
// Usa o logo do CITi em vetor (public/marca/citi-logo-verde.svg, o mesmo do site citi.org.br), então
// fica nítido em qualquer tamanho. Nos ícones de app: "citi" com "LEGACY" embaixo, sobre o fundo escuro
// do app com um anel de órbita discreto, dentro da área segura dos ícones "maskable" (80% do centro).
// No favicon (64 px), só o logo, maior: o "LEGACY" ficaria ilegível.

import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

let logo: string | null = null;
const logoSvg = () =>
  (logo ??= `data:image/svg+xml;base64,${readFileSync(path.join(process.cwd(), "public/marca/citi-logo-verde.svg")).toString("base64")}`);

const PROPORCAO = 566 / 1114; // altura / largura do logo

/** `favicon`: fundo arredondado e só o logo; ícones de app ficam quadrados (o sistema recorta). */
export function iconeCiti(tamanho: number, { favicon = false }: { favicon?: boolean } = {}) {
  const largura = Math.round(tamanho * (favicon ? 0.74 : 0.54));
  const anel = Math.round(tamanho * 0.86);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 38%, #0d4f33 0%, #0a0a0a 72%)",
        borderRadius: favicon ? tamanho * 0.22 : 0,
        position: "relative",
      }}
    >
      {!favicon && (
        <div
          style={{
            position: "absolute",
            width: anel,
            height: anel,
            borderRadius: anel,
            border: `${Math.max(1, Math.round(tamanho / 110))}px solid rgba(0, 219, 88, 0.3)`,
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- dentro do ImageResponse (gera o PNG), não é uma página */}
      <img src={logoSvg()} alt="" width={largura} height={Math.round(largura * PROPORCAO)} />
      {!favicon && (
        <div
          style={{
            marginTop: Math.round(tamanho * 0.055),
            fontSize: Math.round(tamanho * 0.075),
            letterSpacing: Math.round(tamanho * 0.03),
            color: "#ffffff",
            // compensa o espaçamento depois da última letra, para o texto ficar centralizado
            paddingLeft: Math.round(tamanho * 0.03),
          }}
        >
          LEGACY
        </div>
      )}
    </div>,
    { width: tamanho, height: tamanho },
  );
}
