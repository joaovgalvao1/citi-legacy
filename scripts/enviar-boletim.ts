// Monta o boletim semanal com os dados do banco e envia por e-mail (Resend).
//
//   npm run boletim:enviar                    envia para BOLETIM_PARA
//   npm run boletim:enviar -- --html arq.html  só grava o HTML do e-mail, sem enviar (para conferir)

import { writeFileSync } from "node:fs";
import { carregarCommits, carregarResumos, carregarTudo } from "../data/carregar";
import { montarBoletim } from "../lib/boletim";
import { enviarBoletim, htmlBoletim } from "../lib/email";

async function main() {
  const { projetos } = await carregarTudo();
  const resumos = Object.fromEntries(await Promise.all(projetos.map(async (p) => [p.id, await carregarResumos(p.id)] as const)));
  const boletim = montarBoletim(projetos, resumos, await carregarCommits({}));

  const i = process.argv.indexOf("--html");
  if (i > 0) {
    const arquivo = process.argv[i + 1] ?? "boletim.html";
    writeFileSync(arquivo, htmlBoletim(boletim));
    console.log(`HTML do boletim gravado em ${arquivo} (semana ${boletim.semana})`);
  } else {
    const r = await enviarBoletim(boletim);
    console.log(r.enviado ? `boletim enviado (${r.detalhe})` : `boletim NÃO enviado: ${r.detalhe}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
