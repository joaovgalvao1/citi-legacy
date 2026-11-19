// Captura as telas do app (servidor local em http://localhost:3000) em 1920×1080 para o vídeo.
// Usa o Playwright já instalado em outro projeto da máquina (caminho em PLAYWRIGHT_CORE).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE ?? "/home/joaovgodoy/Dev/calculadora-ssa/node_modules/playwright-core");

const BASE = process.env.APP_URL ?? "http://localhost:3000";
const OUT = new URL("../public/telas/", import.meta.url).pathname;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
await ctx.addInitScript(() => localStorage.setItem("citi-legacy:sessao", "admin"));
const page = await ctx.newPage();

async function abrir(url) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" }); // esconde o indicador do Next
  await espera(1800);
}
async function foto(nome, opcoes = {}) {
  await page.screenshot({ path: OUT + nome + ".png", ...opcoes });
  console.log("ok", nome);
}

// página inicial (topo) e projetos
await abrir("/");
await foto("inicio");
await abrir("/projetos");
await foto("projetos");
await page.evaluate(() => window.scrollTo({ top: document.querySelector("h2.rotulo")?.getBoundingClientRect().top + scrollY - 140, behavior: "instant" }));
await espera(600);
await foto("projetos-destaque");

// projeto: visão geral (Gantt e etapas)
await abrir("/projetos/clinica-movimento");
await foto("projeto");
await page.evaluate(() => window.scrollBy({ top: 620, behavior: "instant" }));
await espera(600);
await foto("projeto-etapas");

// boletim (PDF na tela)
await abrir("/exportar/boletim");
await foto("boletim");

// modo reunião: capa, panorama e um slide de projeto
await abrir("/reuniao");
await foto("reuniao-1");
for (let i = 2; i <= 4; i++) {
  await page.keyboard.press("ArrowRight");
  await espera(900);
  await foto(`reuniao-${i}`);
}

// membros: órbita em vários passos
await abrir("/membros");
await page.evaluate(() => window.scrollTo({ top: 120, behavior: "instant" }));
await espera(500);
await page.focus('[role="listbox"]');
for (let i = 0; i < 6; i++) {
  await foto(`orbita-${i}`);
  await page.keyboard.press("ArrowRight");
  await espera(900);
}

// perfil e órbita de colaboração
await abrir("/membros/helena-duarte");
await foto("perfil");
await page.evaluate(() => document.querySelector('[aria-label^="Colegas de"]')?.scrollIntoView({ block: "center", behavior: "instant" }));
await espera(900);
await foto("colaboracao");

await browser.close();
