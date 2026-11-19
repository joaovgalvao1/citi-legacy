// Editar membro: nome, entrada e saída (marcar como ex-membro)

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { obterPessoa, obterPessoas, obterProjetos } from "@/data";
import { TituloPagina, Voltar } from "@/components/ui";
import { EsqueletoSobre } from "@/components/ui/esqueletos";
import { FormularioMembro } from "@/components/membros/formulario";

export async function generateStaticParams() {
  return (await obterPessoas()).map((p) => ({ membroId: p.id }));
}

async function Conteudo({ params }: { params: PageProps<"/membros/editar/[membroId]">["params"] }) {
  const { membroId } = await params;
  const [pessoa, [algum]] = await Promise.all([obterPessoa(membroId), obterProjetos()]);
  if (!pessoa) notFound();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href={`/membros/${pessoa.id}`}>{pessoa.nome}</Voltar>
        <TituloPagina fino="Editar" destaque="membro." />
      </div>
      <FormularioMembro hoje={algum?.hoje ?? ""} inicial={{
          id: pessoa.id,
          nome: pessoa.nome,
          entrada: pessoa.entrada,
          saiuEm: pessoa.saiuEm ?? "",
          email: pessoa.email ?? "",
          linkedin: pessoa.linkedin ?? "",
          github: pessoa.github ?? "",
        }} />
    </div>
  );
}

export default function PaginaEditarMembro(props: PageProps<"/membros/editar/[membroId]">) {
  return (
    <Suspense fallback={<EsqueletoSobre />}>
      <Conteudo params={props.params} />
    </Suspense>
  );
}
