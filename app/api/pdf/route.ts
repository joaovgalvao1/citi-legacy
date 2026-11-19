// GET /api/pdf?pagina=reuniao | boletim | projeto&id=<projeto>[&tema=claro|escuro]
//
// Gera o PDF no servidor: um Chromium sem tela abre a própria página de exportação do app e
// "imprime" do mesmo jeito que o Chrome do computador (slides em 16:9, folhas A4 com o fundo até
// a borda). Serve para o iPad/iPhone, onde o Safari só gera PDF pela impressão, que força A4,
// margens brancas e cabeçalho/rodapé próprios. Só aceita as páginas de exportação conhecidas.
//
// Na Vercel usa o Chromium do @sparticuz/chromium; no computador, o Chrome indicado em CHROME_PATH
// (ou o mesmo pacote, se rodar no Linux).

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

const PAGINAS = {
  reuniao: () => ({ caminho: "/reuniao", nome: "Reunião da diretoria" }),
  boletim: () => ({ caminho: "/exportar/boletim", nome: "Boletim da semana" }),
  projeto: (id: string) => ({ caminho: `/exportar/${encodeURIComponent(id)}`, nome: `Resumo do projeto ${id}` }),
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pagina = url.searchParams.get("pagina") as keyof typeof PAGINAS | null;
  const id = url.searchParams.get("id") ?? "";
  const tema = url.searchParams.get("tema") === "claro" ? "claro" : "escuro";
  if (!pagina || !(pagina in PAGINAS) || (pagina === "projeto" && !/^[a-z0-9-]{1,80}$/.test(id))) {
    return Response.json({ erro: "página inválida" }, { status: 400 });
  }
  const { caminho, nome } = PAGINAS[pagina](id);
  const destino = `${url.origin}${caminho}${pagina === "reuniao" ? "" : `?tema=${tema}`}`;

  const browser = await puppeteer.launch({
    args: process.env.CHROME_PATH ? ["--no-sandbox"] : await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
    executablePath: process.env.CHROME_PATH || (await chromium.executablePath()),
    headless: "shell",
    defaultViewport: { width: 1280, height: 900, deviceScaleFactor: 1 },
  });
  try {
    const page = await browser.newPage();
    // a área interna é protegida por um login de demonstração guardado no navegador
    await page.evaluateOnNewDocument(() => localStorage.setItem("citi-legacy:sessao", "admin"));
    await page.goto(destino, { waitUntil: "networkidle0", timeout: 40000 });
    await page.emulateMediaType("print");
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    const arquivo = `${(await page.title()) || nome}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${arquivo.normalize("NFD").replace(/[̀-ͯ]/g, "")}"; filename*=UTF-8''${encodeURIComponent(arquivo)}`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}
