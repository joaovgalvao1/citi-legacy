// Exportar em PDF: em todos os navegadores (computador, iPad e celular) o PDF é gerado no servidor
// (app/api/pdf), por um Chromium sem tela que abre a própria página de exportação. Assim o arquivo sai
// sempre igual: slides em 16:9 e folhas A4 com o fundo até a borda, sem depender da impressão de cada
// navegador (o Firefox e o Safari tratavam margens, tamanho de página e fundo cada um de um jeito).

export function exportarPdf(pedido: { pagina: "reuniao" } | { pagina: "boletim"; tema: string } | { pagina: "projeto"; id: string; tema: string }) {
  const url = `/api/pdf?${new URLSearchParams(pedido as Record<string, string>).toString()}`;
  // abre o PDF pronto numa aba nova (no iPad, com o botão de compartilhar para salvar ou enviar);
  // se o navegador bloquear a aba, abre na mesma
  // (sem "noopener" na chamada: com ele o window.open sempre devolve null e não daria para saber se abriu)
  const aba = window.open(url, "_blank");
  if (aba) aba.opener = null;
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- é um arquivo (rota de API), não uma página
  else window.location.href = url;
}
