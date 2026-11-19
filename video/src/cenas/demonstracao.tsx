// Demonstração (0:54–2:44): projetos, projeto Mezzalira, push, domingo e reunião.
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";
import { COR, inter, mono } from "../tema";
import { Fundo } from "../pecas";
import { Borrao, Etiqueta, Gravacao, Realce, Trecho, fora, segundos, useSurge } from "../midia";
import { CONSTELACOES, estrelasDe } from "./contexto";
import { LogoGitHub } from "./problema";

/* ---------------------------------------------------------------- 4a. Projetos */

function Regua() {
  const t = segundos();
  const grupos: [string, string, number, number][] = [
    ["Atrasado", COR.vermelho, 1, 0.3],
    ["Atenção", COR.ambar, 3, 1.0],
    ["No prazo", COR.verde, 1, 1.7],
  ];
  return (
    <div style={{ position: "absolute", right: 70, top: 260, display: "flex", flexDirection: "column", gap: 22 }}>
      {grupos.map(([nome, cor, n, em]) => {
        const e = interpolate(t, [em, em + 0.4], [0, 1], fora);
        return (
          <div key={nome} style={{ opacity: e, transform: `translateX(${(1 - e) * 30}px)`, display: "flex", alignItems: "center", gap: 16, background: "rgba(10,10,10,0.88)", border: `2px solid ${cor}`, borderRadius: 18, padding: "16px 24px", fontFamily: inter }}>
            <span style={{ width: 18, height: 18, borderRadius: 9, background: cor, boxShadow: `0 0 18px ${cor}` }} />
            <span style={{ fontSize: 30, fontWeight: 600 }}>{nome}</span>
            <span style={{ fontFamily: mono, fontSize: 30, color: cor }}>{n}</span>
          </div>
        );
      })}
    </div>
  );
}

// tasks concluídas por semana na Plataforma de Voluntariado (dados reais, semanas de 28/09 a 16/11)
const SEMANAS: [string, number][] = [
  ["28/09", 0],
  ["05/10", 0],
  ["12/10", 2],
  ["19/10", 0],
  ["26/10", 1],
  ["02/11", 1],
  ["09/11", 0],
  ["16/11", 0],
];

function GraficoRitmo({ em }: { em: number }) {
  const t = segundos();
  const e = interpolate(t, [em, em + 0.4], [0, 1], fora);
  const linha = interpolate(t, [em + 0.9, em + 2.4], [0, 1], fora);
  const W = 1000;
  const x0 = 60;
  const passo = 62;
  const base = 230;
  const hoje = x0 + SEMANAS.length * passo + 10;
  const prev = W - 70;
  return (
    <div style={{ position: "absolute", left: 80, bottom: 120, width: W, height: 300, opacity: e, transform: `translateY(${(1 - e) * 30}px)`, background: "rgba(14,14,14,0.95)", border: `1px solid ${COR.linha}`, borderRadius: 20, fontFamily: inter }}>
      <div style={{ position: "absolute", left: 28, top: 20, fontFamily: mono, fontSize: 18, letterSpacing: "0.16em", color: COR.cinzaFraco }}>TASKS ENTREGUES POR SEMANA · VOLUNTARIADO</div>
      <svg width={W} height={300} style={{ position: "absolute", left: 0, top: 0 }}>
        {SEMANAS.map(([d, n], i) => {
          const h = n * 50;
          const x = x0 + i * passo;
          return (
            <g key={d}>
              <rect x={x} y={base - h * Math.min(1, linha * 3)} width={40} height={h * Math.min(1, linha * 3)} rx={4} fill={COR.verde} opacity={0.85} />
              <rect x={x} y={base} width={40} height={2} fill="#333" />
              <text x={x + 20} y={base + 28} textAnchor="middle" fontSize={15} fill="#777" fontFamily={mono}>
                {d}
              </text>
            </g>
          );
        })}
        <line x1={x0 + 2.2 * passo} y1={70} x2={x0 + 2.2 * passo} y2={base} stroke="#888" strokeDasharray="4 5" />
        <text x={x0 + 2.2 * passo} y={62} textAnchor="middle" fontSize={17} fill="#aaa">
          prazo 06/11
        </text>
        <line x1={hoje} y1={70} x2={hoje} y2={base} stroke="#fff" strokeOpacity={0.5} />
        <text x={hoje} y={62} textAnchor="middle" fontSize={17} fill="#fff">
          hoje
        </text>
        <line x1={hoje} y1={base - 20} x2={hoje + (prev - hoje) * linha} y2={base - 20} stroke={COR.vermelho} strokeWidth={3} strokeDasharray="8 7" />
        <circle cx={prev} cy={base - 20} r={9} fill={COR.vermelho} opacity={linha >= 1 ? 1 : 0} />
        <text x={prev} y={base - 40} textAnchor="middle" fontSize={24} fontWeight={700} fill={COR.vermelho} opacity={linha >= 1 ? 1 : 0}>
          14/01
        </text>
        <text x={(hoje + prev) / 2} y={base + 28} textAnchor="middle" fontSize={17} fill="#bbb" opacity={linha}>
          6 tasks restantes, no ritmo das últimas 4 semanas
        </text>
      </svg>
    </div>
  );
}

function CardSobe({ em }: { em: number }) {
  const t = segundos();
  const k = interpolate(t, [em, em + 1.3], [0, 1], { ...fora, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const y = 1150 + (544 - 1150) * k;
  return (
    <>
      <div style={{ position: "absolute", left: 250, top: 536, width: 1420, height: 228, background: COR.fundo, opacity: k < 1 ? 1 : 0 }} />
      <Img src={staticFile("telas/card-voluntariado.png")} style={{ position: "absolute", left: 258, top: y, width: 1404, height: 212, borderRadius: 16, boxShadow: k < 1 ? "0 30px 80px rgba(0,0,0,0.7)" : "none", outline: `3px solid ${COR.vermelho}`, outlineOffset: 0 }} />
    </>
  );
}

export function DemoProjetos() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={3.7}>
        <Gravacao src="projetos" de={20.6} cams={[[0, 1.0, 960, 540]]} />
        <Regua />
      </Trecho>
      <Trecho de={3.5} dur={6.4}>
        <Gravacao
          src="projetos"
          de={2.5}
          cams={[[0, 1.0, 960, 540], [0.9, 1.45, 820, 640]]}
          sobre={
            <>
              <Realce x={456} y={692} w={74} h={34} em={4.2} cor={COR.vermelho} raio={8} />
              <Realce x={648} y={692} w={132} h={34} em={4.7} cor={COR.ambar} raio={8} rotulo="gargalo" lado="baixo" />
            </>
          }
        />
        <Etiqueta em={1.2} style={{ left: 120, top: 120 }}>
          cada batida do pulso é um commit
        </Etiqueta>
        <GraficoRitmo em={1.6} />
      </Trecho>
      <Trecho de={9.7} dur={5.8}>
        <Gravacao
          src="projetos"
          de={3.0}
          cams={[[0, 1.0, 960, 540], [1.6, 1.0, 960, 540], [2.6, 1.55, 1300, 650]]}
          sobre={
            <>
              <CardSobe em={0.1} />
              <Realce x={1010} y={572} w={630} h={166} em={2.8} cor={COR.roxo} rotulo="resumo da semana · IA" />
              <div style={{ position: "absolute", left: 1030, top: 730, height: 5, width: 590 * interpolate(segundos(), [3.4, 4.2], [0, 1], fora), background: COR.roxo, borderRadius: 3 }} />
            </>
          }
        />
        <Etiqueta em={0.6} cor={COR.vermelho} texto="#fff" style={{ left: 120, top: 110 }}>
          o mais crítico sobe para o topo
        </Etiqueta>
      </Trecho>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- 4b. Projeto (Mezzalira) */

function Cadeia({ em }: { em: number }) {
  const t = segundos();
  const itens: [string, string, string][] = [
    ["Etapa · Interface de chat", "60%", "80%"],
    ["Projeto", "59%", "62%"],
    ["Previsão de entrega", "17/12", "08/12"],
    ["Painel de Projetos", "", "atualizado"],
  ];
  return (
    <div style={{ position: "absolute", right: 70, top: 300, display: "flex", flexDirection: "column", gap: 18, fontFamily: inter }}>
      {itens.map(([rot, a, b], i) => {
        const e = interpolate(t, [em + i * 0.45, em + i * 0.45 + 0.35], [0, 1], fora);
        return (
          <div key={rot} style={{ opacity: e, transform: `translateX(${(1 - e) * 30}px)`, width: 560, background: "rgba(12,12,12,0.94)", border: `2px solid ${COR.verde}`, borderRadius: 18, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 26, color: COR.cinza }}>{rot}</span>
            <span style={{ fontFamily: mono, fontSize: 28 }}>
              {a && <span style={{ color: COR.cinzaFraco }}>{a} → </span>}
              <span style={{ color: COR.verde, fontWeight: 500 }}>{b}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DemoProjeto() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={3.4}>
        <Gravacao src="projeto-mezzalira" de={4.0} taxa={1.15} />
      </Trecho>
      <Trecho de={3.2} dur={4.4}>
        <Gravacao
          src="projeto-mezzalira"
          de={10.3}
          cams={[[0, 1.0, 960, 540], [0.8, 1.3, 900, 620]]}
          sobre={
            <>
              <Realce x={1362} y={576} w={34} h={52} em={1.6} rotulo="prazo" raio={8} />
              <Realce x={278} y={584} w={200} h={44} em={3.0} raio={8} rotulo="quem mais sabe: Henrique · 88%" lado="baixo" />
            </>
          }
        />
        <Etiqueta em={2.3} style={{ right: 120, bottom: 150 }}>
          Agente do manual · 5 de 7 tasks
        </Etiqueta>
      </Trecho>
      <Trecho de={7.4} dur={3.4}>
        <Gravacao src="projeto-mezzalira" de={28.4} cams={[[0, 1.25, 760, 820]]} />
      </Trecho>
      <Trecho de={10.6} dur={3.6}>
        <Gravacao src="projeto-mezzalira" de={37.8} cams={[[0, 1.0, 960, 540]]} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,10,10,0) 40%, rgba(10,10,10,0.75) 70%)" }} />
        <Cadeia em={0.3} />
      </Trecho>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- 4c. Push */

function Editor() {
  const t = segundos();
  const linhas = ['"têmpera": "aquecimento seguido de resfriamento rápido",', '"rebarba": "excesso de material na borda da peça",', '"usinagem": "remoção de material para dar forma à peça",'];
  const comando = 'git commit -m "feat(agente-manual): glossário de termos"';
  const dig = comando.slice(0, Math.floor(interpolate(t, [1.5, 2.6], [0, comando.length], fora)));
  const push = "git push".slice(0, Math.floor(interpolate(t, [2.7, 3.1], [0, 8], fora)));
  const janela = { background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" } as const;
  return (
    <Fundo brilho={0.1}>
      <div style={{ ...janela, position: "absolute", left: 120, top: 90, width: 1180, fontFamily: "ui-monospace, Menlo, monospace" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #222", color: "#8a8a8a", fontSize: 22 }}>agentes/manual/glossario.ts</div>
        <div style={{ padding: "18px 24px", fontSize: 26, lineHeight: 1.75 }}>
          <div style={{ color: "#6a6a6a" }}>12  export const glossario = {"{"}</div>
          {linhas.map((l, i) => {
            const e = interpolate(t, [0.2 + i * 0.4, 0.5 + i * 0.4], [0, 1], fora);
            return (
              <div key={i} style={{ opacity: e, background: "#0f2a1a", color: "#7ee2a2", paddingLeft: 8 }}>
                + {l}
              </div>
            );
          })}
          <div style={{ color: "#6a6a6a" }}>16  {"};"}</div>
        </div>
      </div>
      <div style={{ ...janela, position: "absolute", left: 520, top: 610, width: 1280, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 28, padding: "24px 30px", lineHeight: 1.7 }}>
        <div>
          <span style={{ color: COR.verde }}>henrique@citi</span> {dig}
        </div>
        <div style={{ opacity: t > 2.65 ? 1 : 0 }}>
          <span style={{ color: COR.verde }}>henrique@citi</span> {push}
          <span style={{ opacity: t % 0.8 < 0.4 ? 1 : 0 }}>▍</span>
        </div>
        <div style={{ color: "#8a8a8a", opacity: t > 3.5 ? 1 : 0 }}>To github.com:citi/metalurgica-mezzalira.git   a91c3f2 → main</div>
      </div>
    </Fundo>
  );
}

function Webhook() {
  const t = segundos();
  const p1 = interpolate(t, [0.2, 1.6], [0, 1], fora);
  const no = useSurge(0.6);
  const p2 = interpolate(t, [2.0, 3.4], [0, 1], fora);
  const env = useSurge(1.9);
  const ok = interpolate(t, [3.6, 4.0], [0, 1], fora);
  return (
    <Fundo brilho={0.12}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <line x1={80} y1={540} x2={760} y2={540} stroke={COR.verde} strokeWidth={3} strokeDasharray="6 12" opacity={0.5} />
        <circle cx={80 + 680 * p1} cy={540} r={14} fill={COR.verde} opacity={p1 < 1 ? 1 : 0} style={{ filter: "drop-shadow(0 0 12px #00DB58)" }} />
        <line x1={1160} y1={540} x2={1160 + 260 * p2} y2={540} stroke={COR.verde} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", left: 760, top: 400, width: 400, height: 280, opacity: no, transform: `scale(${0.9 + no * 0.1})`, background: "#0d1117", border: "2px solid #30363d", borderRadius: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, fontFamily: inter, fontSize: 40, fontWeight: 600 }}>
        <LogoGitHub tam={90} />
        GitHub
      </div>
      <div style={{ position: "absolute", left: 1420, top: 360, width: 420, opacity: env, transform: `translateX(${(1 - env) * -60}px)`, background: "#0f1510", border: `2px solid ${ok > 0.5 ? COR.verde : "#30363d"}`, borderRadius: 22, padding: "26px 28px", fontFamily: mono }}>
        <svg width={46} height={52} viewBox="0 0 46 52">
          <path d={ok > 0.5 ? "M12 24 V14 a11 11 0 0 1 21 -4" : "M12 24 V14 a11 11 0 0 1 22 0 V24"} fill="none" stroke={ok > 0.5 ? COR.verde : "#c9d1d9"} strokeWidth={5} strokeLinecap="round" />
          <rect x={4} y={24} width={38} height={26} rx={6} fill={ok > 0.5 ? COR.verde : "#c9d1d9"} />
        </svg>
        <div style={{ fontSize: 19, color: "#8a8a8a", marginTop: 12 }}>POST /api/github/webhook</div>
        <div style={{ fontSize: 19, color: "#c9d1d9", marginTop: 6 }}>x-hub-signature-256: sha256=9f3c…</div>
        <div style={{ fontSize: 28, color: COR.verde, fontFamily: inter, fontWeight: 600, marginTop: 16, opacity: ok }}>✓ assinatura conferida</div>
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
        <div style={{ fontFamily: inter, fontSize: 30, color: COR.cinza, opacity: useSurge(1.2) }}>o GitHub avisa na hora · aviso sem assinatura é recusado</div>
      </AbsoluteFill>
    </Fundo>
  );
}

function Regras() {
  const t = segundos();
  const regras: [string, string][] = [
    ["agentes/manual/**", "Agente do manual"],
    ["agentes/dados/**", "Agente de leitura de dados"],
    ["web/chat/**", "Interface de chat"],
  ];
  const corre = interpolate(t, [0.8, 1.8], [0, 1], fora);
  const acende = interpolate(t, [1.8, 2.1], [0, 1], fora);
  return (
    <Fundo brilho={0.12}>
      <div style={{ position: "absolute", left: 110, top: 380, width: 600, background: COR.superficie, border: `1px solid ${COR.linha}`, borderRadius: 20, padding: "24px 28px", fontFamily: mono, opacity: useSurge(0) }}>
        <div style={{ fontSize: 22, color: COR.cinzaFraco }}>a91c3f2 · Henrique Pacheco</div>
        <div style={{ fontSize: 26, marginTop: 14 }}>agentes/manual/glossario.ts</div>
        <div style={{ fontSize: 26, marginTop: 6 }}>agentes/manual/indice.ts</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {regras.map((_, i) => {
          const y = 330 + i * 170;
          const certo = i === 0;
          return <path key={i} d={`M710 520 C 860 520, 900 ${y}, 1060 ${y}`} fill="none" stroke={certo ? COR.verde : "#333"} strokeWidth={certo ? 4 : 2} strokeDasharray="600" strokeDashoffset={600 * (1 - corre)} opacity={certo ? 1 : 0.7} />;
        })}
      </svg>
      {regras.map(([cam, etapa], i) => {
        const certo = i === 0;
        return (
          <div key={cam} style={{ position: "absolute", left: 1060, top: 330 + i * 170 - 56, width: 720, background: certo ? `rgba(0,219,88,${0.06 + 0.1 * acende})` : COR.superficie, border: `2px solid ${certo && acende > 0.5 ? COR.verde : "#2a2a2a"}`, borderRadius: 18, padding: "18px 26px", opacity: certo ? 1 : 0.45 }}>
            <div style={{ fontFamily: mono, fontSize: 24, color: certo ? "#7ee2a2" : "#888" }}>{cam}</div>
            <div style={{ fontFamily: inter, fontSize: 32, fontWeight: 600, marginTop: 4 }}>
              → {etapa} {certo && acende > 0.5 ? "✓" : ""}
            </div>
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
        <div style={{ fontFamily: inter, fontSize: 30, color: COR.cinza, opacity: useSurge(2.2) }}>a etapa vem dos arquivos alterados, não da mensagem</div>
      </AbsoluteFill>
    </Fundo>
  );
}

function Reacoes() {
  const t = segundos();
  const bate = interpolate(t, [0.3, 0.6, 1.2], [0, 1, 0.6], fora);
  const ic = interpolate(t, [1.5, 2.5], [0, 1], fora);
  const estrela = interpolate(t, [3.2, 3.8], [0, 1], fora);
  const pts = estrelasDe(1).map((p) => ({ x: p.x - 760 + 1400, y: p.y - 280 + 420 }));
  const nova = { x: 1660, y: 600 };
  let d = "M0 40";
  for (let i = 0; i < 14; i++) {
    const x = (i / 14) * 620;
    const a = [2, 5, 6, 9, 11].includes(i) ? 20 : i === 13 ? 36 * bate : 0;
    d += ` L${x + 10} 40 L${x + 15} ${40 - a} L${x + 20} ${40 + a * 0.5} L${x + 26} 40`;
  }
  return (
    <Fundo brilho={0.14}>
      <div style={{ position: "absolute", left: 110, top: 200, width: 760, background: COR.superficie, border: `2px solid ${COR.ambar}`, borderRadius: 24, padding: "28px 32px", fontFamily: inter, opacity: useSurge(0) }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 36, fontWeight: 700 }}>Metalúrgica Mezzalira</span>
          <span style={{ fontSize: 22, color: COR.ambar }}>● Atenção</span>
        </div>
        <svg width={680} height={80} style={{ marginTop: 16 }}>
          <path d={d} fill="none" stroke={COR.ambar} strokeWidth={3} strokeLinejoin="round" />
          <circle cx={360 + 286} cy={40} r={10 + bate * 16} fill={COR.ambar} opacity={0.3 * bate} />
        </svg>
        <div style={{ fontSize: 22, color: COR.cinza }}>batida nova no pulso · agora</div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 560, width: 760, background: COR.superficie, border: `1px solid ${COR.linha}`, borderRadius: 24, padding: "26px 32px", fontFamily: inter, opacity: useSurge(1.2) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 32, background: "#1f3d2b", border: `3px solid ${COR.verde}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 24 }}>HP</div>
          <div>
            <div style={{ fontSize: 30, fontWeight: 600 }}>Henrique Pacheco</div>
            <div style={{ fontSize: 22, color: COR.cinza }}>Agente do manual · Índice de Conhecimento</div>
          </div>
        </div>
        <div style={{ marginTop: 20, height: 14, background: "#262626", borderRadius: 7, overflow: "hidden" }}>
          <div style={{ width: `${86 + ic * 2}%`, height: "100%", background: COR.verde, borderRadius: 7 }} />
        </div>
        <div style={{ marginTop: 10, fontFamily: mono, fontSize: 22, color: COR.verde, opacity: ic }}>IC ↑ 88%</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={COR.ambar} strokeOpacity={0.45} strokeWidth={2} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} fill={COR.ambar} />
        ))}
        <line x1={pts[pts.length - 1].x} y1={pts[pts.length - 1].y} x2={nova.x} y2={nova.y} stroke={COR.ambar} strokeDasharray="6 6" strokeOpacity={estrela} strokeWidth={2} />
        <circle cx={nova.x} cy={nova.y} r={40 * estrela} fill={COR.ambar} opacity={0.2 * estrela} />
        <circle cx={nova.x} cy={nova.y} r={11 * estrela} fill="#fff" />
        <text x={nova.x} y={nova.y + 48} textAnchor="middle" fontFamily={mono} fontSize={22} fill="#ddd" opacity={estrela}>
          a91c3f2
        </text>
      </svg>
      <div style={{ position: "absolute", left: 1200, top: 840, fontFamily: inter, fontSize: 28, color: COR.cinza, opacity: estrela }}>segundos depois do push</div>
    </Fundo>
  );
}

export function DemoPush() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={4.8}>
        <Editor />
      </Trecho>
      <Trecho de={4.6} dur={5.8}>
        <Webhook />
      </Trecho>
      <Trecho de={10.2} dur={4.6}>
        <Regras />
      </Trecho>
      <Trecho de={14.6} dur={6.9}>
        <Reacoes />
      </Trecho>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- 4d. Domingo */

function Leitura() {
  const t = segundos();
  const varre = (t * 0.55) % 1;
  const n = Math.min(5, 1 + Math.floor(t / 0.95));
  return (
    <Fundo brilho={0.1}>
      <div style={{ position: "absolute", left: 130, top: 140, fontFamily: mono, opacity: useSurge(0) }}>
        <div style={{ fontSize: 28, color: COR.roxo, letterSpacing: "0.22em" }}>DOMINGO</div>
        <div style={{ fontSize: 150, fontFamily: inter, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1 }}>23:00</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {CONSTELACOES.map((c, i) => {
          const pts = estrelasDe(i).map((p) => ({ x: p.x * 0.62 + 760, y: p.y * 0.8 + 140 }));
          return (
            <g key={i}>
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={c.cor} strokeOpacity={0.45} strokeWidth={2} />
              {pts.map((p, j) => (
                <circle key={j} cx={p.x} cy={p.y} r={5} fill={c.cor} />
              ))}
            </g>
          );
        })}
        <rect x={760} y={100 + varre * 560} width={1080} height={3} fill={COR.roxo} opacity={0.9} />
        <rect x={760} y={100 + varre * 560 - 60} width={1080} height={60} fill={COR.roxo} opacity={0.08} />
      </svg>
      <div style={{ position: "absolute", left: 130, bottom: 190, fontFamily: inter, fontSize: 32, color: COR.roxo }}>✦ a IA lê a semana de cada projeto · {n} de 5</div>
    </Fundo>
  );
}

const RESUMO: [string, string, string][] = [
  ["O que andou", COR.verde, "Henrique Pacheco refatorou a estratégia de chunking por seção no agente do manual e aplicou melhorias na interface pedidas pelo cliente."],
  ["O que travou", COR.vermelho, "O agente de leitura de dados continua sem commits há 27 dias."],
  ["O que fazer primeiro", "#fff", "Yasmin Freitas deve destravar e concluir o limite de linhas retornadas e a origem dos números no agente de dados."],
];

function Escrita() {
  const t = segundos();
  return (
    <Fundo brilho={0.1}>
      {[2, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: 200 + k * 26, top: 230 - k * 26, width: 1520, height: 620, border: "1px solid #2a2a2a", borderRadius: 24, background: "#121212", opacity: 0.25 + (2 - k) * 0.25 }} />
      ))}
      <div style={{ position: "absolute", left: 200, top: 230, width: 1520, height: 620, borderRadius: 24, padding: "34px 40px", boxSizing: "border-box", border: "2px solid transparent", background: `linear-gradient(${COR.superficie}, ${COR.superficie}) padding-box, linear-gradient(120deg, ${COR.roxo}, ${COR.verde}) border-box`, fontFamily: inter }}>
        <div style={{ fontFamily: mono, fontSize: 22, letterSpacing: "0.18em", color: COR.roxo }}>✦ GERADO POR IA · METALÚRGICA MEZZALIRA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, marginTop: 30 }}>
          {RESUMO.map(([tit, cor, txt], i) => {
            const n = Math.floor(interpolate(t, [0.3 + i * 1.5, 1.8 + i * 1.5], [0, txt.length], fora));
            return (
              <div key={tit}>
                <div style={{ fontSize: 30, fontWeight: 700, color: cor }}>{tit}</div>
                <div style={{ fontSize: 28, lineHeight: 1.45, color: COR.cinza, marginTop: 12 }}>
                  {txt.slice(0, n)}
                  {n > 0 && n < txt.length && <span style={{ color: COR.roxo }}>▍</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", right: 200, top: 150, fontFamily: mono, fontSize: 24, color: COR.cinzaFraco, opacity: useSurge(0.5) }}>lembra das 4 semanas anteriores</div>
    </Fundo>
  );
}

function Celular({ children, x, y, w = 520 }: { children: React.ReactNode; x: number; y: number; w?: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: w * 2.05, borderRadius: 70, background: "#1c1c1e", padding: 18, boxSizing: "border-box", boxShadow: "0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 2px #333" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 54, overflow: "hidden", position: "relative", background: "#0b0b12" }}>{children}</div>
    </div>
  );
}

function Envio() {
  const t = segundos();
  const dobra = interpolate(t, [0, 0.8], [0, 1], fora);
  const voa = interpolate(t, [0.9, 1.7], [0, 1], { ...fora, easing: (x) => x * x });
  const notif = interpolate(t, [1.8, 2.2], [0, 1], fora);
  const cores = [COR.vermelho, COR.ambar, COR.ambar, COR.ambar, COR.verde];
  return (
    <Fundo brilho={0.1}>
      <div style={{ position: "absolute", left: 260 + voa * 820, top: 300 - voa * 60, width: 520 - dobra * 300, opacity: 1 - voa * 0.9, transform: `scale(${1 - voa * 0.6})`, background: COR.superficie, border: `1px solid ${COR.linha}`, borderRadius: 18, padding: 26, fontFamily: inter }}>
        <div style={{ fontFamily: mono, fontSize: 18, color: COR.verde, letterSpacing: "0.16em" }}>BOLETIM DA SEMANA</div>
        <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6, opacity: 1 - dobra }}>16/11 a 22/11</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {cores.map((c, i) => (
            <div key={i} style={{ height: 22 - dobra * 8, borderRadius: 4, background: c, opacity: 0.35 }} />
          ))}
        </div>
      </div>
      <Celular x={1180} y={60}>
        <div style={{ textAlign: "center", marginTop: 170, fontFamily: inter, fontSize: 96, fontWeight: 300, color: "#fff" }}>23:02</div>
        <div style={{ textAlign: "center", fontFamily: inter, fontSize: 24, color: "#aaa" }}>domingo, 22 de novembro</div>
        <div style={{ margin: "40px 20px 0", opacity: notif, transform: `translateY(${(1 - notif) * -30}px)`, background: "rgba(255,255,255,0.14)", borderRadius: 26, padding: "18px 20px", fontFamily: inter, color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: "#ccc" }}>
            <span>✉ E-mail</span>
            <span>agora</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 22, marginTop: 6 }}>CITi Legacy</div>
          <div style={{ fontSize: 20, lineHeight: 1.3 }}>CITi Legacy · boletim da semana 16/11 a 22/11 · 1 atrasado</div>
        </div>
      </Celular>
    </Fundo>
  );
}

function EmailAberto() {
  const t = segundos();
  const rola = interpolate(t, [0.8, 4.2], [0, 1], fora);
  return (
    <Fundo brilho={0.1}>
      <Celular x={700} y={60}>
        <div style={{ position: "absolute", left: 0, top: 0, width: "100%", padding: "70px 24px 12px", boxSizing: "border-box", fontFamily: inter, fontSize: 20, color: "#aaa", background: "#0b0b12", zIndex: 1 }}>CITi Legacy · boletim da semana</div>
        <Img src={staticFile("telas/boletim-celular.png")} style={{ position: "absolute", left: 0, top: 110 - 196 - rola * 900, width: 484, height: "auto" }} />
      </Celular>
      <div style={{ position: "absolute", left: 130, top: 470, fontFamily: inter, fontSize: 44, fontWeight: 300, width: 520, opacity: useSurge(0.6) }}>
        antes da <span style={{ fontWeight: 700, color: COR.verde }}>segunda</span> começar
      </div>
    </Fundo>
  );
}

export function DemoDomingo() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      <Trecho de={0} dur={5.8}>
        <Leitura />
      </Trecho>
      <Trecho de={5.5} dur={5.6}>
        <Escrita />
      </Trecho>
      <Trecho de={10.9} dur={2.6}>
        <Envio />
      </Trecho>
      <Trecho de={13.3} dur={4.7}>
        <EmailAberto />
      </Trecho>
    </AbsoluteFill>
  );
}

/* ---------------------------------------------------------------- 4e. Reunião */

function Estacoes({ ativa }: { ativa: number }) {
  const nomes = ["CITi Legacy", "E-mail", "Google Agenda", "Apresentação"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 34, display: "flex", justifyContent: "center", alignItems: "center", gap: 14, fontFamily: inter }}>
      {nomes.map((n, i) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ padding: "8px 20px", borderRadius: 999, fontSize: 24, fontWeight: 600, background: i === ativa ? COR.verde : "rgba(10,10,10,0.85)", color: i === ativa ? COR.fundo : i < ativa ? COR.verde : "#888", border: `1px solid ${i <= ativa ? COR.verde : "#333"}` }}>{n}</span>
          {i < nomes.length - 1 && <span style={{ width: 40, height: 2, background: i < ativa ? COR.verde : "#333" }} />}
        </div>
      ))}
    </div>
  );
}

function PaginasPdf() {
  const t = segundos();
  return (
    <AbsoluteFill style={{ background: "rgba(10,10,10,0.65)" }}>
      {[0, 1, 2, 3].map((i) => {
        const e = interpolate(t, [0.1 + i * 0.15, 0.6 + i * 0.15], [0, 1], fora);
        return <Img key={i} src={staticFile(`telas/reuniao-${i + 1}.png`)} style={{ position: "absolute", left: 560 + i * 120 * e, top: 300 + i * 30 * e, width: 640, height: 360, borderRadius: 10, border: `1px solid ${COR.linha}`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", transform: `rotate(${(i - 1.5) * 6 * e}deg)`, opacity: e }} />;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontFamily: mono, fontSize: 30, color: COR.verde, opacity: interpolate(t, [0.8, 1.1], [0, 1], fora) }}>PDF · 16:9</div>
    </AbsoluteFill>
  );
}

export function DemoReuniao() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, color: COR.branco }}>
      {/* marcar no app */}
      <Trecho de={0} dur={2.6}>
        <Gravacao src="marcar-reuniao" de={9.8} cams={[[0, 1.0, 960, 540], [1.2, 1.5, 960, 640]]} />
      </Trecho>
      <Trecho de={2.4} dur={2.9}>
        <Gravacao src="marcar-reuniao" de={41.6} taxa={1.3} cams={[[0, 1.5, 960, 660]]} />
      </Trecho>
      <Trecho de={5.1} dur={1.6}>
        <Gravacao src="marcar-reuniao" de={49.0} cams={[[0, 1.6, 1020, 990]]} />
      </Trecho>
      {/* e-mail */}
      <Trecho de={6.5} dur={2.2}>
        <Gravacao
          src="reuniao-email"
          de={0.5}
          cams={[[0, 1.0, 960, 540], [1.4, 1.5, 1000, 250]]}
          sobre={
            <>
              <Borrao x={405} y={191} w={1445} h={869} />
              <Realce x={405} y={140} w={1445} h={50} em={0.4} raio={10} rotulo="convite enviado pelo app" lado="baixo" />
            </>
          }
        />
      </Trecho>
      <Trecho de={8.5} dur={2.9}>
        <Gravacao src="reuniao-email" de={7.0} cams={[[0, 1.35, 1165, 640], [1.5, 1.45, 1165, 470], [2.9, 1.45, 1165, 470]]} />
        <Etiqueta em={0.6} style={{ left: 120, top: 120 }}>
          a pauta e o botão para a agenda
        </Etiqueta>
      </Trecho>
      <Trecho de={11.2} dur={1.7}>
        <Gravacao src="reuniao-email" de={24.7} cams={[[0, 1.45, 1100, 640]]} />
      </Trecho>
      <Trecho de={12.7} dur={3.1}>
        <Gravacao src="reuniao-email" de={31.0} cams={[[0, 1.0, 960, 540], [1.0, 1.35, 900, 640]]} />
        <Etiqueta em={0.9} style={{ left: 120, bottom: 150 }}>
          o evento leva o link da apresentação
        </Etiqueta>
      </Trecho>
      <Trecho de={15.6} dur={2.0}>
        <Gravacao src="reuniao-email" de={40.0} cams={[[0, 1.45, 1560, 410]]} />
      </Trecho>
      {/* segunda: slides e PDF */}
      <Trecho de={17.4} dur={5.4}>
        <Gravacao src="reuniao-slides" de={12.6} taxa={1.6} />
        <div style={{ position: "absolute", left: 60, top: 110, fontFamily: mono, fontSize: 26, letterSpacing: "0.2em", color: COR.verde, background: "rgba(10,10,10,0.85)", padding: "8px 16px", borderRadius: 10, opacity: useSurgeEm(0.3) }}>SEGUNDA · 9:00</div>
      </Trecho>
      <Trecho de={22.6} dur={1.6}>
        <Gravacao src="reuniao-slides" de={34.0} />
      </Trecho>
      <Trecho de={23.9} dur={2.6}>
        <Gravacao src="reuniao-slides" de={35.5} />
        <PaginasPdf />
      </Trecho>
      <EstacoesNoTempo />
    </AbsoluteFill>
  );
}

function useSurgeEm(em: number) {
  return useSurge(em);
}

function EstacoesNoTempo() {
  const t = segundos();
  const ativa = t < 6.5 ? 0 : t < 12.7 ? 1 : t < 17.4 ? 2 : 3;
  const op = interpolate(t, [0, 0.5, 25.4, 26], [0, 1, 1, 0], fora);
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <Estacoes ativa={ativa} />
    </AbsoluteFill>
  );
}
