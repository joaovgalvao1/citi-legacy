// Cena 4: demonstração com as telas reais (zoom e destaques) e o push simulado.
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COR, inter, mono } from "../tema";
import { Destaque, Fundo, Rotulo, Tela, suave, useEntrada } from "../pecas";

const fora = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 4a. Projetos: indicadores, destaque com a IA e o semáforo nos cards. */
export function DemoProjetos({ duracao }: { duracao: number }) {
  return (
    <Tela src="projetos-destaque" de={[1, 0, 0]} para={[1.18, -290, -190]} inicio={40} fim={duracao - 60}>
      <Destaque x={400} y={316} w={1120} h={184} inicio={40} cor={COR.vermelho} rotulo="Precisa de você agora" />
      <Destaque x={996} y={336} w={512} h={150} inicio={170} cor={COR.roxo} rotulo="Resumo da semana · IA" />
      <Destaque x={400} y={556} w={552} h={120} inicio={330} cor={COR.ambar} rotulo="Semáforo, pulso e previsão" />
    </Tela>
  );
}

/** 4b. O projeto: Gantt com previsão e o gargalo principal. */
export function DemoProjeto({ duracao }: { duracao: number }) {
  return (
    <Tela src="projeto" de={[1, 0, 0]} para={[1.25, -260, -330]} inicio={30} fim={duracao - 40}>
      <Destaque x={410} y={360} w={420} h={80} inicio={50} cor={COR.vermelho} rotulo="Previsão pelo ritmo real" />
      <Destaque x={1340} y={336} w={170} h={60} inicio={150} cor={COR.ambar} rotulo="Gargalo principal" />
      <Destaque x={600} y={480} w={900} h={340} inicio={260} rotulo="Etapas, prazos e quem mais sabe" />
    </Tela>
  );
}

/** 4c. Do push ao painel (simulado): terminal → luz → nó novo e pulso. */
export function DemoPush() {
  const f = useCurrentFrame();
  const comando = "git push origin main";
  const digitado = comando.slice(0, Math.floor(interpolate(f, [30, 90], [0, comando.length], fora)));
  const saida = f > 110;
  const luz = suave(f, [130, 200], [0, 1]);
  const no = useEntrada(200, 10);
  const pulso = suave(f, [210, 330], [0, 1]);
  const term = useEntrada(0);
  const painel = useEntrada(20);
  // traçado do pulso, com um batimento novo no fim
  const pts = Array.from({ length: 14 }, (_, i) => i);
  const L = 560;
  let d = "M0 40";
  pts.forEach((i) => {
    const x = (i / 14) * L;
    const a = [2, 5, 6, 9, 11].includes(i) ? 22 : i === 13 ? 34 * pulso : 0;
    d += ` L${x + 10} 40 L${x + 15} ${40 - a} L${x + 20} ${40 + a * 0.5} L${x + 26} 40`;
  });
  return (
    <Fundo brilho={0.2}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
        <Rotulo>do push ao painel, na hora</Rotulo>
      </AbsoluteFill>
      {/* terminal */}
      <div style={{ position: "absolute", left: 140, top: 300, width: 700, opacity: term, transform: `translateX(${(1 - term) * -40}px)`, borderRadius: 22, background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.12)", overflow: "hidden", fontFamily: mono }}>
        <div style={{ padding: "16px 22px", display: "flex", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
        <div style={{ padding: 30, fontSize: 30, lineHeight: 1.6 }}>
          <div style={{ color: COR.cinzaFraco }}>~/clinica-movimento</div>
          <div>
            <span style={{ color: COR.verde }}>$ </span>
            {digitado}
            <span style={{ opacity: f % 30 < 15 ? 1 : 0 }}>▍</span>
          </div>
          {saida && (
            <div style={{ color: COR.cinza, fontSize: 24 }}>
              → main · feat(financeiro): relatório por unidade
              <br />
              <span style={{ color: COR.verde }}>✓ enviado</span>
            </div>
          )}
        </div>
      </div>
      {/* linha de luz */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="luz" x1="0" x2="1">
            <stop offset="0" stopColor={COR.verde} stopOpacity="0" />
            <stop offset="1" stopColor={COR.verde} />
          </linearGradient>
        </defs>
        <path d="M840 470 C 960 470, 1000 520, 1110 520" fill="none" stroke="url(#luz)" strokeWidth={6} strokeDasharray="400" strokeDashoffset={400 * (1 - luz)} style={{ filter: "drop-shadow(0 0 10px #00DB58)" }} />
        <circle cx={840 + 270 * luz} cy={470 + 50 * luz} r={10} fill={COR.verde} opacity={luz > 0 && luz < 1 ? 1 : 0} />
      </svg>
      {/* card do projeto no painel */}
      <div style={{ position: "absolute", left: 1110, top: 340, width: 680, opacity: painel, transform: `translateX(${(1 - painel) * 40}px)`, borderRadius: 22, background: COR.superficie, border: `1px solid ${COR.linha}`, padding: 32, fontFamily: inter }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 70, height: 70, borderRadius: 16, background: "rgba(255,166,48,0.14)", color: COR.ambar, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28 }}>CM</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>Clínica Movimento</div>
            <div style={{ fontSize: 24, color: COR.cinza }}>
              etapa <span style={{ color: COR.branco }}>Financeiro</span> · commit novo
            </div>
          </div>
          <div style={{ fontSize: 22, color: COR.verde, opacity: no, fontFamily: mono }}>+1 commit</div>
        </div>
        <svg width={L + 40} height={80} style={{ marginTop: 22 }}>
          <path d={d} fill="none" stroke={COR.ambar} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={L + 26} cy={40} r={8 + no * 8} fill={COR.ambar} opacity={0.25 * no} />
          <circle cx={L + 26} cy={40} r={7} fill={COR.ambar} opacity={no} />
        </svg>
      </div>
    </Fundo>
  );
}

const RESUMO = [
  ["O que andou", "Sofia e Mateus ajustaram a usabilidade da etapa de unidades; o financeiro ganhou testes."],
  ["O que travou", "Pacientes e prontuário continua atrasada há 20 dias e sem commits há 27 dias."],
  ["O que fazer primeiro", "Concluir a regra de escopo por unidade e o relatório do Financeiro."],
];

/** 4d. Domingo à noite: a IA escreve o resumo e o boletim chega por e-mail. */
export function DemoDomingo() {
  const f = useCurrentFrame();
  const relogio = useEntrada(0);
  const caixa = useEntrada(30);
  const email = useEntrada(330, 14);
  const texto = RESUMO.map(([t, x]) => `${t}. ${x}`).join("\n");
  const n = Math.floor(interpolate(f, [60, 300], [0, texto.length], fora));
  let resta = n;
  return (
    <Fundo brilho={0.16}>
      <div style={{ position: "absolute", left: 140, top: 130, opacity: relogio, fontFamily: mono }}>
        <div style={{ fontSize: 26, color: COR.cinzaFraco, letterSpacing: "0.2em" }}>DOMINGO</div>
        <div style={{ fontSize: 120, fontWeight: 500, letterSpacing: "-0.03em", color: COR.branco }}>23:00</div>
      </div>
      {/* resumo da IA */}
      <div
        style={{
          position: "absolute",
          left: 140,
          top: 380,
          width: 1000,
          opacity: caixa,
          borderRadius: 22,
          padding: 36,
          border: "2px solid transparent",
          background: `linear-gradient(${COR.superficie}, ${COR.superficie}) padding-box, linear-gradient(120deg, ${COR.roxo}, ${COR.verde}) border-box`,
        }}
      >
        <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: "0.2em", color: COR.roxo }}>✦ GERADO POR IA · CLÍNICA MOVIMENTO</div>
        {RESUMO.map(([t, x], i) => {
          const linha = `${t}. ${x}`;
          const mostra = Math.max(0, Math.min(linha.length, resta));
          resta -= linha.length + 1;
          if (!mostra) return null;
          const tit = linha.slice(0, Math.min(mostra, t.length + 1));
          const corpo = mostra > t.length + 1 ? linha.slice(t.length + 1, mostra) : "";
          return (
            <div key={i} style={{ marginTop: 22, fontSize: 30, lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: [COR.verde, COR.vermelho, COR.branco][i] }}>{tit}</span>
              <span style={{ color: COR.cinza }}>{corpo}</span>
            </div>
          );
        })}
      </div>
      {/* e-mail */}
      <div style={{ position: "absolute", right: 140, top: 300, width: 560, opacity: email, transform: `translateY(${(1 - email) * 60}px) rotate(${(1 - email) * 4}deg)`, borderRadius: 22, background: "#121212", border: `1px solid ${COR.linha}`, overflow: "hidden" }}>
        <div style={{ padding: "22px 28px", borderBottom: `1px solid ${COR.linha}`, fontSize: 24 }}>
          <div style={{ color: COR.cinzaFraco, fontSize: 20 }}>Nova mensagem · CITi Legacy</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>Boletim da semana · 16/11 a 22/11</div>
        </div>
        <Img src={staticFile("telas/boletim.png")} style={{ width: 560, height: 315, objectFit: "cover", objectPosition: "50% 8%" }} />
      </div>
    </Fundo>
  );
}

/** 4e. Segunda de manhã: o modo reunião passando os slides e o PDF. */
export function DemoSegunda({ duracao }: { duracao: number }) {
  const f = useCurrentFrame();
  const slides = ["reuniao-1", "reuniao-2", "reuniao-3", "reuniao-4"];
  const passo = (duracao - 120) / slides.length;
  const titulo = useEntrada(0);
  const pdf = useEntrada(duracao - 110, 14);
  return (
    <Fundo brilho={0.16}>
      <div style={{ position: "absolute", left: 140, top: 90, opacity: titulo, fontFamily: mono }}>
        <div style={{ fontSize: 24, color: COR.cinzaFraco, letterSpacing: "0.2em" }}>SEGUNDA · 9:00 · REUNIÃO DA DIRETORIA</div>
      </div>
      <div style={{ position: "absolute", left: 240, top: 170, width: 1440, height: 810, borderRadius: 20, overflow: "hidden", border: `1px solid ${COR.linha}`, boxShadow: "0 40px 120px rgba(0,0,0,0.6)" }}>
        {slides.map((s, i) => {
          const op = interpolate(f, [i * passo, i * passo + 12, (i + 1) * passo, (i + 1) * passo + 12], [0, 1, 1, i === slides.length - 1 ? 1 : 0], fora);
          return <Img key={s} src={staticFile(`telas/${s}.png`)} style={{ position: "absolute", inset: 0, width: 1440, height: 810, objectFit: "cover", opacity: op }} />;
        })}
      </div>
      {/* PDF saindo */}
      <div style={{ position: "absolute", right: 120, bottom: 150, opacity: pdf, transform: `translateY(${(1 - pdf) * 40}px)` }}>
        {[2, 1, 0].map((k) => (
          <div key={k} style={{ position: "absolute", right: k * 22, bottom: k * 22, width: 300, height: 170, borderRadius: 12, background: "#0f0f0f", border: `1px solid ${COR.linha}`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }} />
        ))}
        <div style={{ position: "relative", width: 300, height: 170, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: 26, color: COR.verde }}>
          PDF · 16:9
        </div>
      </div>
    </Fundo>
  );
}
