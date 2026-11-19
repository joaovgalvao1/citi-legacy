// Service worker do CITi Legacy (PWA): habilita a instalação e mostra uma página simples quando
// o aparelho está sem internet. Não guarda dados dos projetos em cache: tudo vem sempre do servidor.
const PAGINA_OFFLINE = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CITi Legacy · sem conexão</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:24px}b{color:#00DB58}p{color:#9a9a9a}</style></head><body><div><h1>Sem <b>conexão.</b></h1><p>O CITi Legacy precisa de internet para mostrar os projetos. Tente de novo quando a conexão voltar.</p></div></body></html>`;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => new Response(PAGINA_OFFLINE, { headers: { "Content-Type": "text/html; charset=utf-8" } })),
  );
});
