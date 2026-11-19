// Trecho 2 (0:09–0:36): os projetos mudam toda semana; planilha, grupo e reunião; GitHub espalhado; a pergunta.
import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { COR, inter, mono } from "../tema";
import { Fundo } from "../pecas";
import { Trecho, fora, segundos, useSurge } from "../midia";
import { CONSTELACOES, estrelasDe } from "./contexto";

export const GITHUB_D =
  "M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.83.57A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12";

export function LogoGitHub({ tam = 28, cor = "#f0f6fc" }: { tam?: number; cor?: string }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d={GITHUB_D} fill={cor} />
    </svg>
  );
}

/* ---------------------------------------------------------------- A. Projetos mudam toda semana */

type Linha = { nome: string; prazo: [string, string, boolean]; escopo: [string, string]; quem: [string, string] };
// dados do protótipo: prazo planejado → previsão; etapa atual → mudança; equipe
const PROJETOS: Linha[] = [
  { nome: "Clínica Movimento", prazo: ["11/12", "31/12", true], escopo: ["Financeiro", "Financeiro"], quem: ["Renata, Igor +3", "Renata, Igor +3"] },
  { nome: "Folhagem & Cia", prazo: ["18/12", "17/12", false], escopo: ["Pedidos e checkout", "+ Relatórios de vendas"], quem: ["Helena, Caio +2", "Helena, Caio +2"] },
  { nome: "Metalúrgica Mezzalira", prazo: ["18/12", "17/12", false], escopo: ["Agente do manual", "Interface de chat"], quem: ["Bruno, Yasmin +2", "Henrique, Clara +2"] },
  { nome: "Plataforma de Voluntariado", prazo: ["06/11", "14/01", true], escopo: ["Inscrições", "Painel da ONG"], quem: ["Otávio, Larissa +1", "Otávio, Larissa +1"] },
  { nome: "CITi Legacy", prazo: ["19/11", "25/11", true], escopo: ["Entrega do desafio", "Entrega do desafio"], quem: ["João", "João"] },
];

const COLS = ["prazo", "escopo", "quem faz o quê"];
const EM_COL = [6.0, 6.7, 7.3];
const SEMANAS = [8.3, 9.0, 9.7];

function Valor({ antes, depois, muda, alerta, troca }: { antes: string; depois: string; muda: number; alerta?: boolean; troca?: boolean }) {
  const t = segundos();
  if (antes === depois) return <span>{antes}</span>;
  const k = interpolate(t, [muda, muda + 0.35], [0, 1], fora);
  if (troca)
    return (
      <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
        <span style={{ opacity: 1 - k, transform: `translateY(${-k * 20}px)`, display: "inline-block" }}>{antes}</span>
        <span style={{ position: "absolute", left: 0, top: 0, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, color: COR.ambar, fontWeight: 600 }}>{depois}</span>
      </span>
    );
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 12 }}>
      <span style={{ position: "relative", color: k > 0 ? COR.cinzaFraco : "#fff" }}>
        {antes}
        <span style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${k * 100}%`, background: alerta ? COR.vermelho : COR.ambar }} />
      </span>
      <span style={{ opacity: k, transform: `translateX(${(1 - k) * -10}px)`, color: alerta ? COR.vermelho : COR.ambar, fontWeight: 600 }}>{depois}</span>
    </span>
  );
}

function Semanas() {
  const t = segundos();
  const sem = 46 + SEMANAS.filter((s) => t >= s).length;
  const pulso = SEMANAS.some((s) => t >= s && t < s + 0.25) ? 1 : 0;
  return (
    <div style={{ position: "absolute", left: 130, top: 90, display: "flex", alignItems: "center", gap: 18, fontFamily: mono, fontSize: 26, letterSpacing: "0.18em", color: COR.verde, opacity: useSurge(0.2) }}>
      SEMANA
      <span style={{ display: "inline-block", minWidth: 60, fontSize: 40, color: "#fff", transform: `scale(${1 + pulso * 0.15})` }}>{sem}</span>
    </div>
  );
}

function Projetos() {
  const t = segundos();
  const grade = "560px 330px 1fr 1fr";
  // índice da semana em que cada linha muda
  const mudaEm = [SEMANAS[0], SEMANAS[1], SEMANAS[1], SEMANAS[0], SEMANAS[2]];
  const toda = useSurge(8.1);
  return (
    <Fundo brilho={0.1}>
      <Semanas />
      <div style={{ position: "absolute", left: 130, right: 130, top: 190, fontFamily: inter }}>
        <div style={{ display: "grid", gridTemplateColumns: grade, alignItems: "end", height: 54, borderBottom: `1px solid ${COR.linha}`, fontFamily: mono, fontSize: 20, letterSpacing: "0.16em", textTransform: "uppercase" }}>
          <span style={{ color: COR.cinzaFraco }}>projeto</span>
          {COLS.map((c, i) => {
            const e = interpolate(t, [EM_COL[i], EM_COL[i] + 0.3], [0, 1], fora);
            return (
              <span key={c} style={{ color: e > 0.5 ? COR.verde : COR.cinzaFraco, opacity: 0.35 + e * 0.65, textShadow: e > 0.5 ? "0 0 18px rgba(0,219,88,0.6)" : "none" }}>
                {c}
              </span>
            );
          })}
        </div>
        {PROJETOS.map((p, i) => {
          const e = interpolate(t, [0.6 + i * 0.45, 1.0 + i * 0.45], [0, 1], fora);
          const cel = (k: number, conteudo: ReactNode) => {
            const c = interpolate(t, [EM_COL[k] + 0.1 + i * 0.06, EM_COL[k] + 0.4 + i * 0.06], [0, 1], fora);
            return <span style={{ opacity: c, transform: `translateY(${(1 - c) * 10}px)` }}>{conteudo}</span>;
          };
          return (
            <div key={p.nome} style={{ display: "grid", gridTemplateColumns: grade, alignItems: "center", height: 108, borderBottom: `1px solid ${COR.linha}`, fontSize: 34, opacity: e, transform: `translateX(${(1 - e) * -30}px)` }}>
              <span style={{ fontWeight: 700, fontSize: 38 }}>{p.nome}</span>
              {cel(0, <Valor antes={p.prazo[0]} depois={p.prazo[1]} muda={mudaEm[i]} alerta={p.prazo[2]} />)}
              {cel(1, <Valor antes={p.escopo[0]} depois={p.escopo[1]} muda={mudaEm[i] + 0.15} troca />)}
              {cel(2, <Valor antes={p.quem[0]} depois={p.quem[1]} muda={mudaEm[i] + 0.3} troca />)}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 130, bottom: 205, fontFamily: inter, fontSize: 46, fontWeight: 300, opacity: toda, transform: `translateY(${(1 - toda) * 16}px)` }}>
        atenção <b style={{ fontWeight: 700, color: COR.verde }}>toda semana</b>
      </div>
    </Fundo>
  );
}

/* ---------------------------------------------------------------- B. Planilha, grupo e reunião */

function Painel({ em, x, nome, children, style }: { em: number; x: number; nome: string; children: ReactNode; style?: CSSProperties }) {
  const t = segundos();
  const e = interpolate(t, [em, em + 0.45], [0, 1], { ...fora, easing: (k) => 1 - Math.pow(1 - k, 3) });
  // no fim, os três tremem de leve, como notificações acumulando
  const treme = t > 5.9 ? Math.sin(t * 60 + x) * 2 * interpolate(t, [5.9, 6.3, 7.0], [0, 1, 0.6], fora) : 0;
  return (
    <div style={{ position: "absolute", left: x + treme, top: 150 + (1 - e) * 60, width: PAINEL_W, opacity: e }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, fontFamily: mono, fontSize: 26, letterSpacing: "0.22em", textTransform: "uppercase", color: COR.cinza }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: COR.vermelho, boxShadow: `0 0 12px ${COR.vermelho}` }} />
        {nome}
      </div>
      <div style={{ height: PAINEL_H, borderRadius: 22, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.65)", boxSizing: "border-box", ...style }}>{children}</div>
    </div>
  );
}

const PAINEL_W = 540;
const PAINEL_H = 640;
const XS = [90, 690, 1290];

const PLANILHA = [
  ["Clínica Movimento", "Em dia", "28/10"],
  ["Folhagem & Cia", "Atenção?", "21/10"],
  ["Metalúrgica Mezzalira", "???", "03/10"],
  ["Plat. de Voluntariado", "", "14/10"],
];

const MENSAGENS: [string, string, boolean, number][] = [
  ["alguém sabe como tá a Clínica?", "23:41", false, 2.1],
  ["o prazo do financeiro é sexta né", "23:42", false, 2.5],
  ["vou ver e te falo", "23:58", false, 2.9],
  ["pessoal, preciso dos status até amanhã", "00:20", true, 3.3],
];

function Rituais() {
  const t = segundos();
  const dig = "atualizado?".slice(0, Math.floor(interpolate(t, [1.1, 1.9], [0, 11], fora)));
  const naoLidas = Math.round(interpolate(t, [2.0, 6.5], [12, 47], fora));
  const arial = "Arial, Helvetica, sans-serif";
  const borda = "1px solid #2b2b2b";
  const celula = { padding: "16px 14px", borderRight: borda, borderBottom: borda, whiteSpace: "nowrap", overflow: "hidden" } as const;
  const sextas = ["06/11", "13/11", "20/11", "27/11"];
  return (
    <Fundo brilho={0.08}>
      {/* planilha */}
      <Painel em={0.6} x={XS[0]} nome="planilha" style={{ background: "#141414", border: borda, fontFamily: arial, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px", background: "#1b1b1b", color: "#8a8a8a", fontSize: 19, borderBottom: borda }}>acompanhamento_FINAL_v3 (1).xlsx</div>
        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 116px 146px", fontSize: 21, color: "#d4d4d4" }}>
          {["", "A", "B", "C"].map((c) => (
            <div key={c} style={{ ...celula, padding: "8px 10px", background: "#1b1b1b", color: "#777", fontSize: 17, textAlign: "center" }}>
              {c}
            </div>
          ))}
          {["1", "Projeto", "Status", "Atualiz."].map((c, i) => (
            <div key={c} style={{ ...celula, background: i === 0 ? "#1b1b1b" : "#181818", color: i === 0 ? "#777" : "#aaa", fontWeight: 700, fontSize: i === 0 ? 17 : 20 }}>
              {c}
            </div>
          ))}
          {PLANILHA.map(([p, s, d], i) => (
            <>
              <div key={`n${i}`} style={{ ...celula, background: "#1b1b1b", color: "#777", fontSize: 17, textAlign: "center" }}>{i + 2}</div>
              <div key={`p${i}`} style={celula}>{p}</div>
              <div key={`s${i}`} style={{ ...celula, ...(s === "Em dia" ? { background: "#123b22", color: "#7ee2a2" } : s === "Atenção?" ? { background: "#3d2e0e", color: COR.ambar } : {}) }}>{s}</div>
              <div key={`d${i}`} style={{ ...celula, color: COR.vermelho }}>{d}</div>
            </>
          ))}
          <div style={{ ...celula, background: "#1b1b1b", color: "#777", fontSize: 17, textAlign: "center" }}>6</div>
          <div style={celula}>CITi Legacy</div>
          <div style={celula} />
          <div style={{ ...celula, outline: `3px solid ${COR.verde}`, outlineOffset: -3, color: "#fff" }}>
            {dig}
            {t % 0.8 < 0.45 ? "|" : ""}
          </div>
        </div>
        <div style={{ flex: 1, backgroundImage: "linear-gradient(#2b2b2b 1px, transparent 1px)", backgroundSize: "100% 54px", opacity: 0.6 }} />
        <div style={{ padding: "14px 18px", borderTop: borda, background: "#1b1b1b", fontSize: 18, color: COR.vermelho }}>última atualização: há 23 dias</div>
      </Painel>
      {/* grupo */}
      <Painel em={1.8} x={XS[1]} nome="grupo" style={{ background: "#111", border: "2px solid #2a2a2a", fontFamily: arial, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 16, borderBottom: "1px solid #2a2a2a" }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: "#333", color: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>DP</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 25, color: "#eee", fontWeight: 700 }}>Diretoria · projetos</div>
            <div style={{ fontSize: 17, color: "#8a8a8a" }}>Helena, Caio, Lívia, Davi, +5</div>
          </div>
          <div style={{ background: COR.vermelho, color: "#fff", borderRadius: 999, padding: "4px 14px", fontSize: 22, fontWeight: 700 }}>{naoLidas}</div>
        </div>
        {MENSAGENS.map(([txt, hora, minha, em]) => {
          const e = interpolate(t, [em, em + 0.2], [0, 1], fora);
          return (
            <div key={txt} style={{ opacity: e, transform: `scale(${0.9 + e * 0.1})`, transformOrigin: minha ? "right" : "left", maxWidth: "82%", width: "fit-content", marginLeft: minha ? "auto" : 0, marginTop: 16, background: minha ? "#1f3d2b" : "#262626", color: "#eee", borderRadius: 18, padding: "13px 17px", fontSize: 23, lineHeight: 1.3 }}>
              {txt} <span style={{ fontSize: 16, color: "#8a8a8a", marginLeft: 6 }}>{hora}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 20, fontSize: 19, color: "#8a8a8a", opacity: t > 3.6 ? (t % 0.8 < 0.55 ? 1 : 0.3) : 0 }}>Caio está digitando…</div>
      </Painel>
      {/* reunião (agenda no modo escuro) */}
      <Painel em={3.2} x={XS[2]} nome="reunião" style={{ background: "#1b1c20", border: "1px solid #2f3036", fontFamily: arial, color: "#e8eaed" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #2f3036", fontSize: 19, color: "#9aa0a6", display: "flex", justifyContent: "space-between" }}>
          <span>Agenda</span>
          <span>sexta-feira</span>
        </div>
        <div style={{ position: "relative", padding: "10px 20px 0 76px", height: 330 }}>
          {["16:00", "17:00", "18:00", "19:00", "20:00"].map((h, i) => (
            <div key={h} style={{ position: "absolute", left: 18, right: 18, top: 14 + i * 74, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 50, fontSize: 15, color: "#9aa0a6" }}>{h}</span>
              <span style={{ flex: 1, height: 1, background: "#2f3036" }} />
            </div>
          ))}
          <div style={{ position: "absolute", left: 80, right: 20, top: 88, height: 148, background: "#1e2a44", borderLeft: "6px solid #8ab4f8", borderRadius: 10, padding: "14px 16px", boxSizing: "border-box" }}>
            <div style={{ fontSize: 25, fontWeight: 700 }}>Reunião de status dos projetos</div>
            <div style={{ fontSize: 19, color: "#aecbfa", marginTop: 8 }}>17h – 19h · ↻ toda semana</div>
            <div style={{ fontSize: 19, color: "#9aa0a6", marginTop: 6 }}>pauta: “ver como está cada projeto”</div>
          </div>
        </div>
        <div style={{ padding: "18px 20px", borderTop: "1px solid #2f3036" }}>
          <div style={{ fontSize: 16, color: "#9aa0a6", marginBottom: 12 }}>repete toda sexta</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {sextas.map((d, i) => {
              const e = interpolate(t, [3.7 + i * 0.2, 3.9 + i * 0.2], [0, 1], fora);
              return (
                <div key={d} style={{ opacity: 0.25 + e * 0.75, background: "#1e2a44", border: "1px solid #3b4a6b", borderRadius: 8, padding: "10px 0", textAlign: "center", fontSize: 18, color: "#aecbfa" }}>
                  {d}
                </div>
              );
            })}
          </div>
        </div>
      </Painel>
    </Fundo>
  );
}

/* ---------------------------------------------------------------- C. GitHub espalhado */

type Janela2 = { repo: string; linhas: [string, string?][] };
const JANELAS: Janela2[] = [
  { repo: "citi/clinica-movimento", linhas: [["4d7c6c1", "chore(infra): homologação"], ["fe3c891", "feat(unidades): usabilidade"], ["171 commits · 5 autores"]] },
  { repo: "citi/folhagem-cia", linhas: [["6c04dc4", "fix(pedidos): pedido duplicado"], ["0199cb7", "fix(estoque): teste quebrado"], ["11 tasks abertas"]] },
  { repo: "citi/metalurgica-mezzalira", linhas: [["f890f0e", "refactor(agente-manual)"], ["56d119d", "fix(infra): revisão do PR #83"], ["133 commits · 4 autores"]] },
  { repo: "citi/plataforma-voluntariado", linhas: [["8761da6", "feat(inscricoes) · 22:58"], ["6948dc2", "refactor(certificados)"], ["6 tasks abertas"]] },
  { repo: "joaovgalvao1/citi-legacy", linhas: [["f4cf5c4", "Marcar reunião: convite"], ["de81e98", "Membros: contatos"], ["49 commits · 1 autor"]] },
];
const GIROS = [-2, 1.5, -1, 2, -1.5, 1];

function GitHub() {
  const t = segundos();
  const caixa = { background: "#0d1117", border: "1px solid #30363d", borderRadius: 16, padding: "22px 26px", fontFamily: "ui-monospace, 'SFMono-Regular', Menlo, monospace", color: "#c9d1d9", boxShadow: "0 24px 70px rgba(0,0,0,0.55)" } as const;
  return (
    <Fundo brilho={0.06}>
      <div style={{ position: "absolute", left: 90, right: 90, top: 120, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 34 }}>
        {[...JANELAS, null].map((j, i) => {
          const e = interpolate(t, [0.15 + i * 0.22, 0.5 + i * 0.22], [0, 1], fora);
          const est = { ...caixa, height: 235, boxSizing: "border-box" as const, opacity: e, transform: `rotate(${GIROS[i]}deg) translateY(${(1 - e) * 30 + Math.sin(t * 1.4 + i) * 4}px)` };
          if (!j)
            return (
              <div key="log" style={{ ...est, fontSize: 24, lineHeight: 1.9, color: "#8b949e" }}>
                git log --since=&quot;1 week&quot;
                <br />
                git log --since=&quot;1 week&quot;
                <br />
                git log --since=&quot;1 week&quot;<span style={{ color: COR.verde, opacity: t % 1 < 0.5 ? 1 : 0 }}>▍</span>
              </div>
            );
          return (
            <div key={j.repo} style={est}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 23, marginBottom: 16 }}>
                <LogoGitHub tam={32} />
                {j.repo}
              </div>
              {j.linhas.map(([a, b]) =>
                b ? (
                  <div key={a} style={{ fontSize: 21, lineHeight: 1.75 }}>
                    <span style={{ color: "#8b949e" }}>{a}</span> {b}
                  </div>
                ) : (
                  <div key={a} style={{ fontSize: 21, lineHeight: 1.75, color: a.includes("tasks") ? COR.ambar : "#8b949e" }}>
                    {a}
                  </div>
                ),
              )}
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 190 }}>
        <div style={{ fontFamily: mono, fontSize: 28, color: "#8b949e", opacity: useSurge(1.6) }}>5 projetos em andamento · 892 commits · nenhuma visão de conjunto</div>
      </AbsoluteFill>
    </Fundo>
  );
}

/* ---------------------------------------------------------------- D. A pergunta */

function Pergunta() {
  const t = segundos();
  const pergunta = useSurge(0.4, 0.7);
  return (
    <Fundo brilho={0.16}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {CONSTELACOES.map((c, i) => {
          const pts = estrelasDe(i);
          const linhas = interpolate(t, [1 + i * 0.15, 2.2 + i * 0.15], [0, 1], fora);
          return (
            <g key={i}>
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={c.cor} strokeOpacity={0.45 * linhas} strokeWidth={2} />
              {pts.map((p, j) => {
                const e = interpolate(t, [p.t * 1.2, p.t * 1.2 + 0.4], [0, 1], fora);
                return (
                  <g key={j} opacity={e}>
                    <circle cx={p.x} cy={p.y + (1 - e) * 120} r={p.raio * 3} fill={c.cor} opacity={0.12} />
                    <circle cx={p.x} cy={p.y + (1 - e) * 120} r={p.raio} fill={c.cor} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 250 }}>
        <div style={{ opacity: pergunta, transform: `translateY(${(1 - pergunta) * 20}px)`, fontFamily: inter, fontSize: 60, fontWeight: 300, letterSpacing: "-0.02em", textAlign: "center" }}>
          E se o próprio <span style={{ fontWeight: 700, color: COR.verde }}>código</span> contasse como está cada projeto?
        </div>
      </AbsoluteFill>
    </Fundo>
  );
}

export function Problema() {
  return (
    <AbsoluteFill style={{ background: COR.fundo, fontFamily: inter, color: COR.branco }}>
      <Trecho de={0} dur={10.9} fade={0.4}>
        <Projetos />
      </Trecho>
      <Trecho de={10.6} dur={7.3}>
        <Rituais />
      </Trecho>
      <Trecho de={17.6} dur={5.0}>
        <GitHub />
      </Trecho>
      <Trecho de={22.3} dur={4.7}>
        <Pergunta />
      </Trecho>
    </AbsoluteFill>
  );
}
