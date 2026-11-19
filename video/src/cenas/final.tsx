// Cenas 5, 6 e 7: pessoas (órbita), o uso de IA e o fechamento.
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COR, inter, mono, sorteio } from "../tema";
import { Fundo, Logo, Rotulo, suave, useEntrada } from "../pecas";

const fora = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 5. A órbita de membros girando (quadro a quadro, das capturas) e a órbita de colaboração. */
export function Pessoas({ duracao }: { duracao: number }) {
  const f = useCurrentFrame();
  const quadros = ["orbita-0", "orbita-1", "orbita-2", "orbita-3", "orbita-4", "orbita-5"];
  const fimOrbita = duracao * 0.62;
  const passo = fimOrbita / quadros.length;
  const colab = interpolate(f, [fimOrbita, fimOrbita + 20], [0, 1], fora);
  const zoom = 1.12 - 0.08 * suave(f, [0, fimOrbita], [0, 1]);
  return (
    <AbsoluteFill style={{ background: COR.fundo, fontFamily: inter }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {quadros.map((q, i) => {
          const op = interpolate(f, [i * passo, i * passo + 10, (i + 1) * passo, (i + 1) * passo + 10], [0, 1, 1, i === quadros.length - 1 ? 1 : 0], fora);
          return <Img key={q} src={staticFile(`telas/${q}.png`)} style={{ position: "absolute", inset: 0, width: 1920, height: 1080, opacity: op }} />;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: colab }}>
        <Img src={staticFile("telas/colaboracao.png")} style={{ width: 1920, height: 1080, transform: `scale(${1 + 0.05 * suave(f, [fimOrbita, duracao], [0, 1])})` }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "flex-start", padding: "120px 140px" }}>
        <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 16, padding: "12px 22px", opacity: 1 - colab }}>
          <Rotulo>órbita de membros</Rotulo>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "flex-start", padding: "120px 140px", opacity: colab }}>
        <div style={{ background: "rgba(10,10,10,0.75)", borderRadius: 16, padding: "12px 22px" }}>
          <Rotulo>órbita de colaboração · quem trabalhou com quem</Rotulo>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

const LOG = [
  "16/11 · ideação: a ideia de acompanhar commits e trocas de membros",
  "17/11 · mudança de rota: de passagem de conhecimento para acompanhamento",
  "18/11 · minha hipótese: a Infra/Deploy distorcia a previsão",
  "18/11 · previsão pelo ritmo das últimas 4 semanas",
  "19/11 · decidi: resumo no domingo, reunião na segunda",
  "19/11 · minha ideia: os membros girando num círculo",
  "19/11 · hipótese: o PDF do iPad saía pela impressão",
  "19/11 · PDF gerado no servidor, igual em qualquer aparelho",
];

/** 6. O uso de IA: no produto (resumo com memória) e no desenvolvimento (DEV_LOG). */
export function UsoDeIA({ duracao }: { duracao: number }) {
  const f = useCurrentFrame();
  const esq = useEntrada(10);
  const dir = useEntrada(40);
  const frase = useEntrada(duracao - 330, 16);
  const rolagem = suave(f, [60, duracao - 120], [0, 1]);
  return (
    <Fundo brilho={0.18}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 100 }}>
        <Rotulo>a IA em dois lugares</Rotulo>
      </AbsoluteFill>
      {/* no produto */}
      <div style={{ position: "absolute", left: 140, top: 200, width: 760, opacity: esq }}>
        <div style={{ fontSize: 44, fontWeight: 700 }}>No produto</div>
        <div style={{ fontSize: 26, color: COR.cinza, marginTop: 6 }}>resume a semana lembrando das anteriores</div>
        {["semana de 02/11", "semana de 09/11", "semana de 16/11"].map((s, i) => {
          const e = suave(f, [80 + i * 50, 120 + i * 50], [0, 1]);
          return (
            <div
              key={s}
              style={{
                marginTop: 22,
                marginLeft: i * 34,
                opacity: e * (0.45 + i * 0.27),
                borderRadius: 18,
                padding: "18px 24px",
                border: "2px solid transparent",
                background: `linear-gradient(${COR.superficie}, ${COR.superficie}) padding-box, linear-gradient(120deg, ${COR.roxo}, ${COR.verde}) border-box`,
                fontSize: 24,
              }}
            >
              <span style={{ fontFamily: mono, color: COR.roxo, fontSize: 20 }}>✦ {s.toUpperCase()}</span>
              <div style={{ color: COR.cinza, marginTop: 6 }}>o que andou · o que travou · o que fazer primeiro</div>
            </div>
          );
        })}
      </div>
      {/* no desenvolvimento */}
      <div style={{ position: "absolute", left: 1010, top: 200, width: 770, opacity: dir }}>
        <div style={{ fontSize: 44, fontWeight: 700 }}>No desenvolvimento</div>
        <div style={{ fontSize: 26, color: COR.cinza, marginTop: 6 }}>3 dias · cada passo registrado no DEV_LOG</div>
        <div style={{ marginTop: 22, height: 400, overflow: "hidden", borderRadius: 18, border: `1px solid ${COR.linha}`, background: "#0f0f0f", position: "relative" }}>
          <div style={{ transform: `translateY(${-rolagem * 230}px)`, padding: 26, fontFamily: mono, fontSize: 22, lineHeight: 2 }}>
            {LOG.map((l) => (
              <div key={l} style={{ color: l.includes("minha") || l.includes("decidi") || l.includes("hipótese") ? COR.verde : COR.cinza }}>
                {l}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0f0f0f 0%, rgba(15,15,15,0) 18%, rgba(15,15,15,0) 82%, #0f0f0f 100%)" }} />
        </div>
      </div>
      {/* frase */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
        <div style={{ opacity: frase, transform: `scale(${0.9 + frase * 0.1})`, fontSize: 64, letterSpacing: "-0.03em" }}>
          “<span style={{ fontWeight: 300 }}>A IA propõe,</span> <span style={{ fontWeight: 700, color: COR.verde }}>eu decido.</span>”
        </div>
      </AbsoluteFill>
    </Fundo>
  );
}

/** 7. Fechamento: o app instalado no iPad e a órbita se fechando no logo. */
export function Fechamento({ duracao }: { duracao: number }) {
  const f = useCurrentFrame();
  const ipad = useEntrada(0);
  const toque = suave(f, [110, 130], [0, 1]);
  const sai = interpolate(f, [170, 210], [1, 0], fora);
  const aneis = suave(f, [190, 300], [1, 0]);
  const logo = useEntrada(290, 20);
  const url = useEntrada(330);
  const r = sorteio(7);
  const apps = Array.from({ length: 15 }, () => `hsl(${Math.floor(r() * 360)} 18% ${18 + r() * 10}%)`);
  return (
    <Fundo brilho={0.2 + logo * 0.15}>
      {/* iPad */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: sai }}>
        <div style={{ width: 760, height: 560, borderRadius: 48, border: "14px solid #1c1c1c", background: "linear-gradient(160deg, #0b3a1f, #0a0a0a 70%)", transform: `scale(${0.9 + ipad * 0.1})`, opacity: ipad, padding: 50, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 34, alignContent: "start" }}>
          {apps.map((c, i) =>
            i === 7 ? (
              <div key={i} style={{ textAlign: "center" }}>
                <Img src={staticFile("marca/icone.png")} style={{ width: 78, height: 78, borderRadius: 18, transform: `scale(${1 - toque * 0.12 + (toque === 1 ? 0.12 : 0)})`, boxShadow: `0 0 ${30 * toque}px ${COR.verde}` }} />
                <div style={{ fontSize: 13, color: "#fff", marginTop: 6 }}>CITi Legacy</div>
              </div>
            ) : (
              <div key={i} style={{ width: 78, height: 78, borderRadius: 18, background: c, opacity: 0.6 }} />
            ),
          )}
        </div>
      </AbsoluteFill>
      {/* órbita fechando */}
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: f > 170 ? 1 : 0 }}>
        {[420, 320, 220].map((raio, i) => (
          <circle key={raio} cx={960} cy={480} r={raio * aneis + 40} fill="none" stroke={COR.verde} strokeOpacity={(0.35 - i * 0.08) * Math.min(1, aneis * 3)} strokeWidth={2} strokeDasharray={i === 1 ? "6 12" : undefined} />
        ))}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34, paddingBottom: 120 }}>
        <div style={{ opacity: logo, transform: `scale(${0.85 + logo * 0.15})` }}>
          <Logo altura={140} />
        </div>
        <div style={{ opacity: url, fontSize: 40, fontWeight: 300, color: COR.cinza }}>
          Todos os projetos do CITi, <span style={{ color: COR.verde, fontWeight: 600 }}>acompanhados semana a semana.</span>
        </div>
        <div style={{ opacity: url, fontFamily: mono, fontSize: 30, color: COR.branco, marginTop: 10 }}>citi-legacy.vercel.app</div>
      </AbsoluteFill>
    </Fundo>
  );
}
