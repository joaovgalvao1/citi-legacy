// Webhook do GitHub: a cada push no repositório, o GitHub avisa aqui e o app sincroniza os projetos
// ligados a ele (os commits aparecem no CITi Legacy segundos depois do push).
// Cada aviso é assinado com o GITHUB_WEBHOOK_SECRET; aviso sem assinatura válida é recusado.

import { revalidateTag } from "next/cache";
import { assinaturaValida } from "@/lib/github";
import { projetosDoRepositorio, sincronizarProjeto } from "@/lib/sincronizar";

export async function POST(req: Request) {
  const corpo = await req.text();
  if (!assinaturaValida(corpo, req.headers.get("x-hub-signature-256"))) {
    return Response.json({ erro: "assinatura inválida" }, { status: 401 });
  }

  const evento = req.headers.get("x-github-event");
  if (evento === "ping") return Response.json({ ok: true, mensagem: "webhook conectado ao CITi Legacy" });
  if (evento !== "push") return Response.json({ ok: true, ignorado: evento });

  const { repository } = JSON.parse(corpo) as { repository?: { full_name?: string } };
  const repo = repository?.full_name;
  if (!repo) return Response.json({ erro: "push sem repositório" }, { status: 400 });

  const ids = await projetosDoRepositorio(repo);
  const resultados = [];
  for (const id of ids) {
    try {
      const r = await sincronizarProjeto(id);
      resultados.push({ projeto: id, novos: r.novos, semCadastro: r.semCadastro });
    } catch (e) {
      resultados.push({ projeto: id, erro: e instanceof Error ? e.message : "erro" });
    }
  }
  if (ids.length) revalidateTag("dados", "max");
  return Response.json({ ok: true, repositorio: repo, projetos: resultados });
}
