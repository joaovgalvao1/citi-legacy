// Tela 4 — Legado gerado

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { formatarMesAno, getMembro, getProjeto, nomeEtapa, projetos } from "@/data";
import { emPct, etapasLideradas } from "@/lib/indice";
import { BotaoVoltarOrigem, VoltarOrigem } from "@/components/legado/acoes";
import { DocumentoLegado } from "@/components/legado/documento";

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
      .join(", ") || "partes de várias etapas";

  const padrao = { href: `/projetos/${projeto.id}`, rotulo: projeto.nome };

  return (
    <div className="space-y-4">
      <VoltarOrigem padrao={padrao} />
      <DocumentoLegado
        projetoId={projeto.id}
        membroId={membro.id}
        cabecalho={{
          membroNome: membro.nome,
          projetoNome: projeto.nome,
          subtitulo: `${membro.papel} · ${etapas}`,
          contexto: `${membro.nome} atuou como ${membro.papel.toLowerCase()} no projeto ${projeto.nome} (${projeto.cliente.split(" · ")[1] ?? projeto.cliente}) desde ${formatarMesAno(membro.entrada)}${membro.saidaPrevista ? ` e sai ${membro.saidaPrevista}` : ""}. Tem ${emPct(membro.icProjeto)} do conhecimento do projeto e é quem mais conhece ${etapas}.`,
        }}
        acoesExtras={<BotaoVoltarOrigem padrao={padrao} />}
      />
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
