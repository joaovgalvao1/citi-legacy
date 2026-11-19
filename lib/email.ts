// Envio do boletim semanal por e-mail (Resend, pela API HTTP; sem biblioteca).
//
// Variáveis:
//   RESEND_API_KEY  chave do Resend (sem ela, o envio é pulado)
//   BOLETIM_PARA    destinatários, separados por vírgula
//   BOLETIM_DE      remetente (padrão: "CITi Legacy <onboarding@resend.dev>", que só envia
//                   para o e-mail da própria conta Resend enquanto não houver domínio verificado)
//   SITE_URL        endereço do site, para os links (padrão: https://citi-legacy.vercel.app)
//
// Tema: claro ou escuro (padrão escuro, o do cron de sexta). O botão do boletim envia no tema da tela,
// e o link "Ver o boletim em PDF" abre o PDF no mesmo tema (?tema=).

import type { Boletim } from "./boletim";

export type TemaEmail = "claro" | "escuro";

/** Cores do e-mail nos dois temas. Só cores sólidas: leitores de e-mail lidam mal com transparência e gradiente. */
const PALETAS = {
  claro: {
    pagina: "#f2f2f2",
    card: "#ffffff",
    caixa: "#ffffff",
    borda: "#e4e4e4",
    linha: "#eeeeee",
    trilho: "#ececec",
    texto: "#161616",
    texto2: "#2a2a2a",
    suave: "#555555",
    fraco: "#8a8a8a",
    divisoria: "#a6a6a6",
    verde: "#00873a",
    verdeMarca: "#00DB58",
    vermelho: "#d42020",
    ambar: "#b86e00",
    seloVerde: "background:#f3fbf6;color:#00873a;border:1px solid #cdeedb;",
    seloAmbar: "background:#fff6e8;color:#b86e00;border:1px solid #f3c98b;",
    seloVermelho: "background:#fff0f0;color:#d42020;border:1px solid #f5b5b5;",
    bordaIA: "#d9ccfb",
  },
  escuro: {
    pagina: "#0A0A0A",
    card: "#141414",
    caixa: "#0f0f0f",
    borda: "#2a2a2a",
    linha: "#242424",
    trilho: "#2a2a2a",
    texto: "#ffffff",
    texto2: "#d9d9d9",
    suave: "#b3b3b3",
    fraco: "#8a8a8a",
    divisoria: "#5c5c5c",
    verde: "#00DB58",
    verdeMarca: "#00DB58",
    vermelho: "#FF3B3B",
    ambar: "#FFA630",
    seloVerde: "background:#0d2417;color:#00DB58;border:1px solid #145c32;",
    seloAmbar: "background:#2a1f0d;color:#FFA630;border:1px solid #6b4a14;",
    seloVermelho: "background:#2a1212;color:#FF3B3B;border:1px solid #6b2323;",
    bordaIA: "#5b4a8f",
  },
} as const;

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const dataBr = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

export const siteUrl = () => (process.env.SITE_URL || "https://citi-legacy.vercel.app").replace(/\/$/, "");

export function assuntoBoletim(b: Boletim) {
  const atraso = b.numeros.atrasados ? ` · ${b.numeros.atrasados} atrasado${b.numeros.atrasados > 1 ? "s" : ""}` : "";
  return `CITi Legacy · boletim da semana ${ddmm(b.semana)} a ${ddmm(b.fimSemana)}${atraso}`;
}

/** HTML do e-mail: tabelas e estilos embutidos (o que os leitores de e-mail aceitam), no tema claro ou escuro. */
export function htmlBoletim(b: Boletim, site = siteUrl(), tema: TemaEmail = "escuro") {
  const c = PALETAS[tema];
  const numero = (valor: number, rotulo: string, alerta: "" | "ambar" | "vermelho" = "") => `
    <td width="25%" style="padding:4px;">
      <div style="border:1px solid ${c.borda};border-radius:10px;padding:12px;">
        <div style="font:600 22px/1 'Courier New',monospace;color:${alerta && valor > 0 ? (alerta === "vermelho" ? c.vermelho : c.ambar) : c.texto};">${valor}</div>
        <div style="font:11px/1.3 Arial,sans-serif;color:${c.suave};margin-top:6px;">${esc(rotulo)}</div>
      </div>
    </td>`;

  const projeto = (p: Boletim["projetos"][number]) => {
    const atrasado = p.nivel === "vermelho";
    const atencao = p.nivel === "ambar";
    const secoes = p.resumo
      ? p.resumo.secoes
          .map(
            (s) => `
        <p style="margin:12px 0 4px;font:700 10px/1.2 Arial,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:${/andou/i.test(s.titulo) ? c.verde : /travou/i.test(s.titulo) ? c.vermelho : c.texto};">${esc(s.titulo)}</p>
        <ul style="margin:0;padding-left:18px;font:13px/1.45 Arial,sans-serif;color:${/andou/i.test(s.titulo) ? c.verdeMarca : /travou/i.test(s.titulo) ? c.vermelho : c.texto};">
          ${s.itens.map((i) => `<li style="margin:2px 0;"><span style="color:${c.texto2};">${esc(i)}</span></li>`).join("")}
        </ul>`,
          )
          .join("")
      : `<p style="font:12px Arial,sans-serif;color:${c.suave};">Ainda não há resumo da IA para esta semana.</p>`;
    const alertas = p.alertas.length
      ? `<p style="margin:10px 0 0;font:12px/1.5 Arial,sans-serif;color:${c.ambar};">${p.alertas.map((a) => `<span style="color:${/atrasad/.test(a) ? c.vermelho : c.ambar};">▲ ${esc(a)}</span>`).join("<br>")}</p>`
      : "";
    return `
    <tr><td style="padding:8px 0;">
      <div style="border:1px solid ${c.borda};border-radius:12px;padding:16px;background:${c.card};">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <div style="font:700 16px Arial,sans-serif;color:${c.texto};">${esc(p.nome)}</div>
            <div style="font:12px Arial,sans-serif;color:${c.fraco};margin-top:2px;">${esc(p.cliente)}</div>
          </td>
          <td align="right" valign="top">
            <span style="display:inline-block;border-radius:99px;padding:3px 10px;font:600 11px Arial,sans-serif;${
              atrasado ? c.seloVermelho : atencao ? c.seloAmbar : c.seloVerde
            }">${atrasado ? "Atrasado" : atencao ? "Atenção" : "No prazo"}</span>
          </td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;"><tr>
          <td><div style="height:6px;background:${c.trilho};border-radius:99px;"><div style="height:6px;width:${Math.round(p.progresso)}%;background:${atrasado ? "#FF3B3B" : atencao ? "#FFA630" : "#00DB58"};border-radius:99px;"></div></div></td>
          <td width="210" align="right" style="white-space:nowrap;padding-left:10px;font:12px 'Courier New',monospace;color:${c.suave};">${Math.round(p.progresso)}% · ${esc(p.prazo)}</td>
        </tr></table>
        <p style="margin:4px 0 0;text-align:right;font:700 12px 'Courier New',monospace;color:${p.previsao.tom === "vermelho" ? c.vermelho : p.previsao.tom === "ambar" ? c.ambar : c.verde};">${esc(p.previsao.texto)} <span style="font-weight:400;color:${c.fraco};">· ritmo das últimas 4 semanas</span></p>
        ${alertas}
        <div style="border:1px solid ${c.bordaIA};border-radius:8px;padding:10px 14px 12px;margin-top:12px;background:${c.caixa};">
          ${p.resumo && p.resumo.fonte !== "regras" ? `<div style="font:700 10px Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:${c.verde};">✦ Gerado por IA</div>` : ""}
          ${secoes}
        </div>
        <p style="margin:12px 0 0;font:12px Arial,sans-serif;"><a href="${site}/projetos/${p.id}" style="color:${c.verde};">Abrir o projeto →</a></p>
      </div>
    </td></tr>`;
  };

  const concluidos = b.concluidos.length
    ? `<p style="margin:24px 0 6px;font:700 10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:${c.fraco};">Legado · projetos concluídos</p>
       <p style="margin:0;font:13px/1.6 Arial,sans-serif;color:${c.texto2};">${b.concluidos
         .map((pc) => `${esc(pc.nome)} <span style="color:${c.fraco};">· entregue em ${dataBr(pc.entrega)}</span>`)
         .join("<br>")}</p>`
    : "";

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="${tema === "escuro" ? "dark" : "light"}"><meta name="supported-color-schemes" content="${tema === "escuro" ? "dark" : "light"}"><title>${esc(assuntoBoletim(b))}</title></head>
<body style="margin:0;background:${c.pagina};padding:24px 12px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${c.pagina};"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:${c.card};border-radius:14px;border:1px solid ${c.borda};">
      <tr><td style="padding:28px 28px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid ${c.verdeMarca};"><tr>
          <td style="padding-bottom:14px;"><img src="${site}/marca/citi-logo-verde.png" alt="CITi" height="26" style="vertical-align:middle;"><span style="display:inline-block;width:1px;height:20px;background:${c.divisoria};margin:0 12px;vertical-align:middle;"></span><span style="font:500 11px Arial,sans-serif;letter-spacing:3.5px;text-transform:uppercase;color:${c.texto};vertical-align:middle;">Legacy</span></td>
          <td align="right" style="padding-bottom:14px;font:700 10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:${c.verde};">Boletim semanal</td>
        </tr></table>
        <h1 style="margin:22px 0 6px;font:700 24px Arial,sans-serif;color:${c.texto};">Semana de ${ddmm(b.semana)} a ${ddmm(b.fimSemana)}</h1>
        <p style="margin:0 0 16px;font:13px/1.5 Arial,sans-serif;color:${c.suave};">O que andou, o que travou e o que fazer primeiro em cada projeto em andamento, resumido pela IA a partir dos commits e das tasks.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${numero(b.numeros.andamento, "em andamento")}${numero(b.numeros.atrasados, "atrasados", "vermelho")}${numero(b.numeros.etapasParadas, "etapas paradas", "ambar")}${numero(b.numeros.commitsSemana, "commits na semana")}
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${b.projetos.map(projeto).join("")}</table>
        ${concluidos}
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${site}/exportar/boletim?tema=${tema}" style="display:inline-block;background:${c.verdeMarca};color:#0a0a0a;font:700 14px Arial,sans-serif;text-decoration:none;padding:11px 22px;border-radius:99px;">Ver o boletim em PDF</a>
        </p>
      </td></tr>
      <tr><td style="padding:20px 28px 26px;font:11px/1.5 Arial,sans-serif;color:${c.fraco};border-top:1px solid ${c.linha};">
        Resumos gerados por IA toda sexta-feira às 23h, com memória das semanas anteriores. CITi Legacy · uso interno.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

/** Envia o boletim. Sem RESEND_API_KEY ou BOLETIM_PARA, não envia e diz o motivo. */
export async function enviarBoletim(b: Boletim, tema: TemaEmail = "escuro"): Promise<{ enviado: boolean; detalhe: string }> {
  const chave = process.env.RESEND_API_KEY;
  const para = (process.env.BOLETIM_PARA ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!chave) return { enviado: false, detalhe: "RESEND_API_KEY não configurada" };
  if (!para.length) return { enviado: false, detalhe: "BOLETIM_PARA não configurado" };

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.BOLETIM_DE || "CITi Legacy <onboarding@resend.dev>",
      to: para,
      subject: assuntoBoletim(b),
      html: htmlBoletim(b, siteUrl(), tema),
    }),
    signal: AbortSignal.timeout(15000),
  });
  const corpo = (await r.json().catch(() => ({}))) as { id?: string; message?: string };
  return r.ok ? { enviado: true, detalhe: `id ${corpo.id}` } : { enviado: false, detalhe: `Resend ${r.status}: ${corpo.message ?? "erro"}` };
}

/** Destinatários com o e-mail parcialmente oculto, para mostrar na tela ("jv***@cin.ufpe.br"). */
export function destinatariosMascarados() {
  return (process.env.BOLETIM_PARA ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((e) => e.replace(/^(.{2})[^@]*/, "$1***"))
    .join(", ");
}
