// Sincroniza com o GitHub um projeto (ou todos com repositório vinculado) no banco de DATABASE_URL.
// Uso: npm run banco:sincronizar -- [projetoId]   (precisa de GITHUB_TOKEN)

import { projetosComRepositorio, sincronizarProjeto } from "@/lib/sincronizar";

async function principal() {
  const alvo = process.argv[2];
  const ids = alvo ? [alvo] : await projetosComRepositorio();
  for (const id of ids) {
    const r = await sincronizarProjeto(id);
    console.log(`${id}: ${r.novos} commits novos de ${r.repositorio}`, r.semCadastro.length ? { semCadastro: r.semCadastro } : "");
  }
}

principal()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
