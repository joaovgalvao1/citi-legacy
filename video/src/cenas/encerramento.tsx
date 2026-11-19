// Pessoas (2:44–3:03), uso de IA (3:03–3:39) e fechamento (3:39–3:53).
import { AbsoluteFill, interpolate } from "remotion";
import { COR, inter, mono } from "../tema";
import { Fundo, Logo } from "../pecas";
import { Aparelho, Etiqueta, Gravacao, Trecho, fora, segundos, useSurge } from "../midia";

/* ---------------------------------------------------------------- Pessoas */

function Legacy({ em }: { em: number }) {
  const t = segundos();
  const e = interpolate(t, [em, em + 1.2], [0, 1], fora);
  return (
    <AbsoluteFill style={{ background: `rgba(10,10,10,${0.78 * e})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: e, fontFamily: inter, fontSize: 150, fontWeight: 500, letterSpacing: `${0.2 + e * 0.25}em`, color: "#fff", textShadow: `0 0 ${60 * e}px rgba(0,219,88,0.55)` }}>LEGACY</div>
    </AbsoluteFill>
  );
}

export function Pessoas() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={3.4}>
        <Gravacao src="membros-orbita" de={5.0} taxa={1.4} />
      </Trecho>
      <Trecho de={3.2} dur={2.0}>
        <Gravacao src="membros-orbita" de={21.6} cams={[[0, 2.2, 460, 210], [1.6, 2.2, 460, 220]]} />
        <Etiqueta em={0.4} style={{ left: 120, bottom: 150 }}>
          e-mail · LinkedIn · GitHub
        </Etiqueta>
      </Trecho>
      <Trecho de={5.0} dur={2.0}>
        <Gravacao src="membros-orbita" de={23.0} cams={[[0, 1.45, 1300, 720]]} />
        <Etiqueta em={0.3} style={{ left: 120, top: 110 }}>
          quem conhece cada parte
        </Etiqueta>
      </Trecho>
      <Trecho de={6.8} dur={2.0}>
        <Gravacao src="membros-orbita" de={35.0} cams={[[0, 1.25, 960, 560]]} />
        <Etiqueta em={0.3} style={{ left: 120, top: 110 }}>
          quem trabalhou com quem
        </Etiqueta>
      </Trecho>
      <Trecho de={8.6} dur={2.2}>
        <Gravacao src="membros-sairam" de={5.4} taxa={1.3} />
      </Trecho>
      <Trecho de={10.6} dur={7.9}>
        <Gravacao src="membros-sairam" de={18.8} cams={[[0, 1.0, 960, 540], [0.9, 1.55, 760, 260], [2.2, 1.55, 760, 260], [3.0, 1.45, 1310, 900]]} />
        <Etiqueta em={1.2} cor={COR.cinza} texto={COR.fundo} style={{ left: 120, top: 110 }}>
          saiu em julho de 2026
        </Etiqueta>
        <Etiqueta em={3.4} style={{ left: 120, top: 180 }}>
          continua referência: Checkout simplificado · 88%
        </Etiqueta>
        <Legacy em={3.6} />
      </Trecho>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- Uso de IA */

function DoisLugares() {
  const produto = useSurge(0.2);
  const dev = useSurge(5.4);
  const t = segundos();
  const apaga = interpolate(t, [5.4, 6.2], [1, 0.45], fora);
  const caixa = { position: "absolute", top: 200, width: 760, height: 620, borderRadius: 28, padding: 44, boxSizing: "border-box", fontFamily: inter } as const;
  return (
    <Fundo brilho={0.1}>
      <div style={{ ...caixa, left: 140, border: `2px solid ${COR.roxo}`, background: "#121018", opacity: produto * apaga }}>
        <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: "0.2em", color: COR.roxo }}>NO PRODUTO</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: COR.roxo, marginTop: 8 }}>Gemini 3.5 Flash-Lite</div>
        <div style={{ fontSize: 44, marginTop: 30, lineHeight: 1.25 }}>Escreve os resumos de domingo de cada projeto</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 40 }}>
          {[0.9, 0.7, 0.8].map((w, i) => (
            <div key={i} style={{ height: 14, width: `${w * 100}%`, background: "#2a2440", borderRadius: 7 }} />
          ))}
        </div>
      </div>
      <div style={{ ...caixa, left: 1020, border: `2px solid ${COR.verde}`, background: "#0f1611", opacity: dev }}>
        <div style={{ fontFamily: mono, fontSize: 24, letterSpacing: "0.2em", color: COR.verde }}>NO DESENVOLVIMENTO</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: COR.verde, marginTop: 8 }}>Claude Opus 5.5 · Claude Code</div>
        <div style={{ fontSize: 44, marginTop: 30, lineHeight: 1.25 }}>Parceira nos três dias do projeto</div>
        <div style={{ fontFamily: mono, fontSize: 26, color: COR.cinza, marginTop: 40, lineHeight: 1.9 }}>
          16/11 ideação
          <br />
          17/11 mudança de rota
          <br />
          18/11 previsão, PDF, órbitas
          <br />
          19/11 entrega
        </div>
      </div>
    </Fundo>
  );
}

function Hipoteses() {
  const t = segundos();
  const cartao = (em: number) => interpolate(t, [em, em + 0.4], [0, 1], fora);
  const linhas: [string, string, string, string, string, number][] = [
    ["EU NOTEI", "A Mezzalira aparecia atrasada demais, sem nenhuma etapa vermelha. Hipótese: a Infra/Deploy tem outro ritmo.", "A IA TESTOU", "3 regras de cálculo em 4 projetos × 3 datas.", "RESULTADO|A minha proposta: etapa contínua usa o ritmo médio das outras.", 0],
    ["EU NOTEI", "O PDF no iPad saía quebrado. Hipótese: o Safari gera pela impressão.", "A IA CONFIRMOU", "e propôs gerar o PDF no servidor.", "EU DECIDI|Usar o mesmo modelo no computador, porque o Firefox também falhava.", 1],
  ];
  const tempos = [
    [0.2, 4.3, 6.3],
    [7.5, 12.9, 14.0],
  ];
  return (
    <Fundo brilho={0.08}>
      {linhas.map(([k1, t1, k2, t2, r, i]) => {
        const [k3, t3] = r.split("|");
        const y = 160 + i * 420;
        const [a, b, c] = tempos[i];
        const est = { position: "absolute", top: y, width: 520, borderRadius: 22, padding: "28px 32px", boxSizing: "border-box", fontFamily: inter, fontSize: 30, lineHeight: 1.4 } as const;
        const rot = { fontFamily: mono, fontSize: 20, letterSpacing: "0.18em", marginBottom: 12 } as const;
        return (
          <div key={i}>
            <div style={{ ...est, left: 90, background: COR.superficie, border: "2px solid #333", opacity: cartao(a), transform: `translateY(${(1 - cartao(a)) * 20}px)` }}>
              <div style={rot}>{k1}</div>
              {t1}
            </div>
            <div style={{ ...est, left: 700, background: COR.superficie, border: `2px solid ${COR.roxo}`, opacity: cartao(b), transform: `translateY(${(1 - cartao(b)) * 20}px)` }}>
              <div style={{ ...rot, color: COR.roxo }}>{k2}</div>
              {t2}
            </div>
            <div style={{ ...est, left: 1310, background: "#0f1f16", border: `2px solid ${COR.verde}`, opacity: cartao(c), transform: `translateY(${(1 - cartao(c)) * 20}px)` }}>
              <div style={{ ...rot, color: COR.verde }}>{k3}</div>
              {t3}
            </div>
            <svg width={1920} height={60} style={{ position: "absolute", left: 0, top: y + 70 }}>
              <line x1={612} y1={30} x2={688} y2={30} stroke="#555" strokeWidth={3} opacity={cartao(b)} />
              <line x1={1222} y1={30} x2={1298} y2={30} stroke="#555" strokeWidth={3} opacity={cartao(c)} />
            </svg>
          </div>
        );
      })}
    </Fundo>
  );
}

const DEVLOG = [
  "## 18/11 · previsão pelo ritmo",
  "- hipótese do autor: Infra/Deploy com ritmo próprio distorce a previsão",
  "- teste: 3 opções × 4 projetos × 3 datas → ritmo médio das outras etapas",
  "## 18/11 · PDF no iPad",
  "- hipótese do autor: Safari imprime em vez de gerar o PDF",
  "- decisão: PDF no servidor, também no computador",
  "## 19/11 · cron de domingo",
  "- erro encontrado: domingo 23h em Recife já é segunda em UTC",
  "## 17/11 · mudança de rota",
  "- decisão do autor: acompanhamento de projetos, nome Legacy mantido",
  "## 18/11 · órbitas",
  "- teste do autor no iPad: a órbita não girava ao deslizar",
  "## 19/11 · documentação",
  "- autor revisou o uso de IA e as hipóteses",
  "## 19/11 · vídeo do pitch",
  "- roteiro discutido trecho a trecho; gravações do autor",
];

function Frases() {
  const t = segundos();
  const f1 = interpolate(t, [0.3, 1.0], [0, 1], fora);
  const f2 = interpolate(t, [2.7, 3.4], [0, 1], fora);
  const decido = interpolate(t, [5.4, 5.9], [0, 1], fora);
  const reg = interpolate(t, [7.1, 7.7], [0, 1], fora);
  return (
    <Fundo brilho={0.06}>
      <div style={{ position: "absolute", left: 60, top: -t * 22, fontFamily: mono, fontSize: 24, lineHeight: 2.1, color: "#262626" }}>
        {[...DEVLOG, ...DEVLOG].map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 26, fontFamily: inter, fontSize: 84, fontWeight: 600, letterSpacing: "-0.02em" }}>
        <div style={{ opacity: f1, transform: `translateY(${(1 - f1) * 24}px)` }}>
          <span style={{ color: COR.verde }}>Eu levanto a hipótese,</span> a IA testa.
        </div>
        <div style={{ opacity: f2, transform: `translateY(${(1 - f2) * 24}px)` }}>
          A IA propõe, <span style={{ color: decido > 0.5 ? COR.verde : "#fff", textShadow: `0 0 ${40 * decido}px rgba(0,219,88,0.5)` }}>eu decido.</span>
        </div>
        <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 400, color: "#8a8a8a", marginTop: 20, opacity: reg }}>DEV_LOG.md · DOCUMENTACAO.md · tudo registrado</div>
      </AbsoluteFill>
    </Fundo>
  );
}

export function UsoDeIA() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={9.9}>
        <DoisLugares />
      </Trecho>
      <Trecho de={9.7} dur={15.9}>
        <Hipoteses />
      </Trecho>
      <Trecho de={25.4} dur={10.6}>
        <Frases />
      </Trecho>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- Fechamento */

function Aparelhos() {
  const t = segundos();
  const afasta = interpolate(t, [4.9, 6.2], [1, 0.4], fora);
  const op = interpolate(t, [5.2, 6.2], [1, 0], fora);
  return (
    <Fundo brilho={0.14}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${afasta})`, opacity: op }}>
        <Aparelho tipo="ipad" de={2.0} taxa={1.35} largura={1160} style={{ left: 140, top: 150 }} />
        <Aparelho tipo="celular" de={1.6} taxa={1.25} largura={360} style={{ left: 1420, top: 110 }} />
      </div>
    </Fundo>
  );
}

function Marca() {
  const t = segundos();
  const aneis = interpolate(t, [0, 1.2], [1, 0], { ...fora, easing: (x) => x * x });
  const logo = useSurge(0.3, 0.7);
  const slogan = useSurge(1.2, 0.6);
  const url = useSurge(3.4, 0.5);
  const autor = useSurge(4.0, 0.5);
  return (
    <Fundo brilho={0.12 + logo * 0.18}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {[420, 300, 190].map((r, i) => (
          <circle key={r} cx={960} cy={430} r={r * (0.35 + aneis * 0.65)} fill="none" stroke="#1d5a33" strokeDasharray="3 10" strokeWidth={3} opacity={0.4 + aneis * 0.5 - logo * 0.15 * i} />
        ))}
        <circle cx={960 + 300 * (0.35 + aneis * 0.65)} cy={430} r={8} fill={COR.verde} />
        <circle cx={960 - 212 * (0.35 + aneis * 0.65)} cy={430 + 212 * (0.35 + aneis * 0.65)} r={8} fill={COR.ambar} />
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 120 }}>
        <div style={{ opacity: logo, transform: `scale(${0.85 + logo * 0.15})` }}>
          <Logo altura={150} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, flexDirection: "column", gap: 26 }}>
        <div style={{ opacity: slogan, transform: `translateY(${(1 - slogan) * 20}px)`, fontFamily: inter, fontSize: 54, letterSpacing: "-0.02em" }}>
          <span style={{ fontWeight: 300 }}>Todos os projetos do CITi,</span> <span style={{ fontWeight: 700, color: COR.verde }}>acompanhados semana a semana.</span>
        </div>
        <div style={{ opacity: url, fontFamily: mono, fontSize: 34, color: COR.verde }}>citi-legacy.vercel.app</div>
        <div style={{ opacity: autor, fontFamily: inter, fontSize: 26, color: COR.cinza }}>por João Vitor Godoy</div>
      </AbsoluteFill>
    </Fundo>
  );
}

export function Fechamento() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={6.4}>
        <Aparelhos />
      </Trecho>
      <Trecho de={5.9} dur={9.1} fade={0.3}>
        <Marca />
      </Trecho>
    </AbsoluteFill>
  );
}
