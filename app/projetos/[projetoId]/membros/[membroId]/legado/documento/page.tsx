// Tela 4 — Legado gerado

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatarMesAno, getMembro, getProjeto, nomeEtapa, projetos } from "@/data";
import { Botao, BotaoLink, Voltar } from "@/components/wireframe";
import { etapasLideradas } from "@/lib/indice";

export function generateStaticParams() {
  return projetos.flatMap((p) => p.membros.map((m) => ({ projetoId: p.id, membroId: m.id })));
}

async function LegadoGeradoConteudo({ params }: { params: PageProps<"/projetos/[projetoId]/membros/[membroId]/legado/documento">["params"] }) {
  const { projetoId, membroId } = await params;
  const projeto = getProjeto(projetoId);
  const membro = getMembro(projetoId, membroId);
  if (!projeto || !membro) notFound();

  const etapas =
    etapasLideradas(projeto, membro)
      .map((id) => nomeEtapa(projeto, id))
      .join(", ") || "várias etapas";

  const secoes = [
    {
      titulo: "Contexto",
      texto: `${membro.nome} atuou como ${membro.papel.toLowerCase()} no projeto ${projeto.nome} (${projeto.cliente.split(" · ")[1] ?? projeto.cliente}) desde ${formatarMesAno(membro.entrada)}, concentrando conhecimento em ${etapas}. [texto de exemplo]`,
    },
    {
      titulo: "Decisões e porquês",
      texto: "[lista das principais decisões técnicas, cada uma com o motivo e a alternativa descartada]",
    },
    {
      titulo: "Pontos de atenção",
      texto: "[riscos conhecidos, gambiarras temporárias, partes frágeis do código]",
    },
    {
      titulo: "Pessoas a procurar",
      texto: "[quem do time ou do cliente sabe o quê]",
    },
    {
      titulo: "Próximos passos",
      texto: "[o que quem assume deve estudar e fazer primeiro]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Voltar href={`/projetos/${projeto.id}`}>{projeto.nome}</Voltar>
        <div className="flex gap-2">
          <Botao variante="secundario" disabled title="Disponível nas próximas etapas">
            Copiar
          </Botao>
          <Botao variante="secundario" disabled title="Disponível nas próximas etapas">
            Baixar
          </Botao>
          <BotaoLink href={`/projetos/${projeto.id}`}>Voltar ao painel</BotaoLink>
        </div>
      </div>

      <article className="mx-auto max-w-2xl border border-gray-400 bg-white px-6 py-8 shadow-sm sm:px-10">
        <header className="mb-6 border-b border-gray-300 pb-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Legado</p>
          <h1 className="text-2xl font-bold">
            Legado de {membro.nome} · {projeto.nome}
          </h1>
          <p className="text-sm text-gray-600">
            {membro.papel} · {etapas} · registrado em [data]
          </p>
        </header>
        <div className="space-y-5">
          {secoes.map((s) => (
            <section key={s.titulo}>
              <h2 className="mb-1 font-semibold">{s.titulo}</h2>
              <p className="text-sm leading-relaxed text-gray-700">{s.texto}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

export default function LegadoGerado(props: PageProps<"/projetos/[projetoId]/membros/[membroId]/legado/documento">) {
  return (
    <Suspense fallback={<p className="text-sm text-gray-500">Carregando…</p>}>
      <LegadoGeradoConteudo params={props.params} />
    </Suspense>
  );
}
