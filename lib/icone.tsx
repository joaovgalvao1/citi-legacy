// Ícone do CITi Legacy (aba do navegador, tela inicial do celular e PWA), gerado em PNG.
// Usa o logo do CITi em vetor (public/marca/citi-logo-verde.svg, o mesmo do site citi.org.br), então
// fica nítido em qualquer tamanho. Nos ícones de app: "citi" com um traço fino e "LEGACY" embaixo, sobre o
// degradê verde do topo do app, dentro da área segura dos ícones "maskable" (80% do centro).
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
  const largura = Math.round(tamanho * (favicon ? 0.74 : 0.6));
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // o mesmo degradê da faixa verde do topo do app, com um brilho suave atrás do logo
        background:
          "radial-gradient(circle at 50% 42%, rgba(0, 219, 88, 0.22) 0%, rgba(0, 219, 88, 0) 46%), linear-gradient(180deg, #0b3a1f 0%, #082414 38%, #0a0a0a 100%)",
        borderRadius: favicon ? tamanho * 0.22 : 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- dentro do ImageResponse (gera o PNG), não é uma página */}
      <img src={logoSvg()} alt="" width={largura} height={Math.round(largura * PROPORCAO)} />
      {!favicon && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* traço fino entre o logo e o nome, como a divisória do logo no cabeçalho */}
          <div
            style={{
              marginTop: Math.round(tamanho * 0.06),
              width: Math.round(tamanho * 0.14),
              height: Math.max(1, Math.round(tamanho / 220)),
              borderRadius: 9,
              background: "rgba(255, 255, 255, 0.35)",
            }}
          />
          <div
            style={{
              marginTop: Math.round(tamanho * 0.045),
              fontSize: Math.round(tamanho * 0.068),
              letterSpacing: Math.round(tamanho * 0.034),
              color: "rgba(255, 255, 255, 0.92)",
              // compensa o espaçamento depois da última letra, para o texto ficar centralizado
              paddingLeft: Math.round(tamanho * 0.034),
            }}
          >
            LEGACY
          </div>
        </div>
      )}
    </div>,
    { width: tamanho, height: tamanho },
  );
}
