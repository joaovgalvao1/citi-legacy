// Exportar em PDF: no Safari (iPad, iPhone e Mac) o PDF é gerado no servidor (app/api/pdf), porque
// a impressão do Safari força A4 com margens brancas e cabeçalho/rodapé próprios e ignora o 16:9 dos
// slides. Nos outros navegadores, a impressão do próprio navegador ("Salvar como PDF"), que é instantânea
// e já sai igual ao PDF do servidor.

/** Safari de verdade (o Chrome e o Edge também dizem "Safari" no userAgent, por isso o filtro). */
export function ehSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|EdgiOS|Edg|OPR|Android/i.test(ua);
}

export function exportarPdf(
  pedido: { pagina: "reuniao" } | { pagina: "boletim"; tema: string } | { pagina: "projeto"; id: string; tema: string },
) {
  if (!ehSafari()) return window.print();
  const q = new URLSearchParams(pedido as Record<string, string>);
  // abre o PDF pronto (no iPad, com o botão de compartilhar para salvar em Arquivos ou enviar)
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- é um arquivo (rota de API), não uma página
  window.location.href = `/api/pdf?${q.toString()}`;
}
