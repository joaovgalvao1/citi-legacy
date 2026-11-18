// POST /api/resumo  { projetoId, marcadas? }
// Devolve o resumo do projeto (Gemini → Groq → resumo automático pelas regras).
// "marcadas" são as tasks marcadas/desmarcadas no navegador, para o resumo refletir o estado atual.

import { getProjeto } from "@/data";
import { gerarResumo } from "@/lib/resumo";

type Corpo = { projetoId?: string; marcadas?: Record<string, boolean> };

export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return Response.json({ erro: "Corpo inválido" }, { status: 400 });
  }
  const original = corpo.projetoId ? getProjeto(corpo.projetoId) : undefined;
  if (!original) return Response.json({ erro: "Projeto não encontrado" }, { status: 404 });

  // aplica as tasks marcadas no navegador (mesma regra de lib/tasks.ts)
  const marcadas = corpo.marcadas ?? {};
  const projeto = {
    ...original,
    etapas: original.etapas.map((e) => {
      const tasks = e.tasks.map((t, i) => {
        const v = marcadas[`${original.id}/${e.id}/${i}`];
        return typeof v === "boolean" ? { ...t, feita: v } : t;
      });
      return { ...e, tasks, progresso: Math.round((tasks.filter((t) => t.feita).length / tasks.length) * 100) };
    }),
  };

  const resumo = await gerarResumo(projeto);
  return Response.json(resumo);
}
