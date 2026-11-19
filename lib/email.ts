// Envio do boletim semanal por e-mail (Resend, pela API HTTP; sem biblioteca).
//
// Variáveis:
//   RESEND_API_KEY  chave do Resend (sem ela, o envio é pulado)
//   BOLETIM_PARA    destinatários, separados por vírgula
//   BOLETIM_DE      remetente (padrão: "CITi Legacy <onboarding@resend.dev>", que só envia
//                   para o e-mail da própria conta Resend enquanto não houver domínio verificado)
//   SITE_URL        endereço do site, para os links (padrão: https://citi-legacy.vercel.app)

import type { Boletim } from "./boletim";

const VERDE = "#00DB58";
const VERDE_ESCURO = "#00873a";
const AMBAR = "#b86e00";
const VERMELHO = "#d42020";

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ddmm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const dataBr = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

export const siteUrl = () => (process.env.SITE_URL || "https://citi-legacy.vercel.app").replace(/\/$/, "");

export function assuntoBoletim(b: Boletim) {
  const atraso = b.numeros.atrasados ? ` · ${b.numeros.atrasados} atrasado${b.numeros.atrasados > 1 ? "s" : ""}` : "";
  return `CITi Legacy · boletim da semana ${ddmm(b.semana)} a ${ddmm(b.fimSemana)}${atraso}`;
}

/** HTML do e-mail: tabelas e estilos embutidos (o que os leitores de e-mail aceitam). */
export function htmlBoletim(b: Boletim, site = siteUrl()) {
  const numero = (valor: number, rotulo: string, alerta: "" | "ambar" | "vermelho" = "") => `
    <td width="25%" style="padding:4px;">
      <div style="border:1px solid #e4e4e4;border-radius:10px;padding:12px;">
        <div style="font:600 22px/1 'Courier New',monospace;color:${alerta && valor > 0 ? (alerta === "vermelho" ? VERMELHO : AMBAR) : "#161616"};">${valor}</div>
        <div style="font:11px/1.3 Arial,sans-serif;color:#666;margin-top:6px;">${esc(rotulo)}</div>
      </div>
    </td>`;

  const projeto = (p: Boletim["projetos"][number]) => {
    const atrasado = p.status === "Atrasado";
    const atencao = !atrasado && p.alertas.length > 0;
    const secoes = p.resumo
      ? p.resumo.secoes
          .map(
            (s) => `
        <p style="margin:12px 0 4px;font:700 10px/1.2 Arial,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:${/andou/i.test(s.titulo) ? VERDE_ESCURO : /travou/i.test(s.titulo) ? VERMELHO : "#161616"};">${esc(s.titulo)}</p>
        <ul style="margin:0;padding-left:18px;font:13px/1.45 Arial,sans-serif;color:#2a2a2a;">
          ${s.itens.map((i) => `<li style="margin:2px 0;">${esc(i)}</li>`).join("")}
        </ul>`,
          )
          .join("")
      : `<p style="font:12px Arial,sans-serif;color:#666;">Ainda não há resumo da IA para esta semana.</p>`;
    const alertas = p.alertas.length
      ? `<p style="margin:10px 0 0;font:12px/1.5 Arial,sans-serif;color:${AMBAR};">${p.alertas.map((a) => `<span style="color:${/atrasad/.test(a) ? VERMELHO : AMBAR};">▲ ${esc(a)}</span>`).join("<br>")}</p>`
      : "";
    return `
    <tr><td style="padding:8px 0;">
      <div style="border:1px solid #e4e4e4;border-radius:12px;padding:16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td>
            <div style="font:700 16px Arial,sans-serif;color:#161616;">${esc(p.nome)}</div>
            <div style="font:12px Arial,sans-serif;color:#8a8a8a;margin-top:2px;">${esc(p.cliente)}</div>
          </td>
          <td align="right" valign="top">
            <span style="display:inline-block;border-radius:99px;padding:3px 10px;font:600 11px Arial,sans-serif;${
              atrasado
                ? `background:#fff0f0;color:${VERMELHO};border:1px solid #f5b5b5;`
                : atencao
                  ? `background:#fff6e8;color:${AMBAR};border:1px solid #f3c98b;`
                  : `background:#f3fbf6;color:${VERDE_ESCURO};border:1px solid #cdeedb;`
            }">${atrasado ? "Atrasado" : atencao ? "Atenção" : "No prazo"}</span>
          </td>
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;"><tr>
          <td><div style="height:6px;background:#ececec;border-radius:99px;"><div style="height:6px;width:${Math.round(p.progresso)}%;background:${atrasado ? "#FF3B3B" : atencao ? "#FFA630" : VERDE};border-radius:99px;"></div></div></td>
          <td width="210" align="right" style="white-space:nowrap;padding-left:10px;font:12px 'Courier New',monospace;color:#555;">${Math.round(p.progresso)}% · ${esc(p.prazo)}</td>
        </tr></table>
        ${alertas}
        <div style="border:1px solid #d9ccfb;border-radius:8px;padding:10px 14px 12px;margin-top:12px;">
          ${p.resumo && p.resumo.fonte !== "regras" ? `<div style="font:700 10px Arial,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:${VERDE_ESCURO};">✦ Gerado por IA</div>` : ""}
          ${secoes}
        </div>
        <p style="margin:12px 0 0;font:12px Arial,sans-serif;"><a href="${site}/projetos/${p.id}" style="color:${VERDE_ESCURO};">Abrir o projeto →</a></p>
      </div>
    </td></tr>`;
  };

  const concluidos = b.concluidos.length
    ? `<p style="margin:24px 0 6px;font:700 10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#8a8a8a;">Legado · projetos concluídos</p>
       <p style="margin:0;font:13px/1.6 Arial,sans-serif;color:#444;">${b.concluidos
         .map((c) => `${esc(c.nome)} <span style="color:#8a8a8a;">· entregue em ${dataBr(c.entrega)}</span>`)
         .join("<br>")}</p>`
    : "";

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(assuntoBoletim(b))}</title></head>
<body style="margin:0;background:#0A0A0A;padding:24px 12px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:14px;">
      <tr><td style="padding:28px 28px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid ${VERDE};"><tr>
          <td style="padding-bottom:14px;"><img src="${site}/marca/citi-logo-verde.png" alt="CITi" height="26" style="vertical-align:middle;"><span style="display:inline-block;width:1px;height:20px;background:#a6a6a6;margin:0 12px;vertical-align:middle;"></span><span style="font:500 11px Arial,sans-serif;letter-spacing:3.5px;text-transform:uppercase;color:#161616;vertical-align:middle;">Legacy</span></td>
          <td align="right" style="padding-bottom:14px;font:700 10px Arial,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:${VERDE_ESCURO};">Boletim semanal</td>
        </tr></table>
        <h1 style="margin:22px 0 6px;font:700 24px Arial,sans-serif;color:#161616;">Semana de ${ddmm(b.semana)} a ${ddmm(b.fimSemana)}</h1>
        <p style="margin:0 0 16px;font:13px/1.5 Arial,sans-serif;color:#555;">O que andou, o que travou e o que fazer primeiro em cada projeto em andamento, resumido pela IA a partir dos commits e das tasks.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${numero(b.numeros.andamento, "em andamento")}${numero(b.numeros.atrasados, "atrasados", "vermelho")}${numero(b.numeros.etapasParadas, "etapas paradas", "ambar")}${numero(b.numeros.commitsSemana, "commits na semana")}
        </tr></table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">${b.projetos.map(projeto).join("")}</table>
        ${concluidos}
        <p style="margin:24px 0 0;text-align:center;">
          <a href="${site}/exportar/boletim" style="display:inline-block;background:${VERDE};color:#0a0a0a;font:700 14px Arial,sans-serif;text-decoration:none;padding:11px 22px;border-radius:99px;">Ver o boletim em PDF</a>
        </p>
      </td></tr>
      <tr><td style="padding:20px 28px 26px;font:11px/1.5 Arial,sans-serif;color:#8a8a8a;border-top:1px solid #eee;">
        Resumos gerados por IA toda sexta-feira às 23h, com memória das semanas anteriores. CITi Legacy · uso interno.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

/** Envia o boletim. Sem RESEND_API_KEY ou BOLETIM_PARA, não envia e diz o motivo. */
export async function enviarBoletim(b: Boletim): Promise<{ enviado: boolean; detalhe: string }> {
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
      html: htmlBoletim(b),
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
