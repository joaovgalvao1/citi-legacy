// Lista de todas as pessoas que passaram pelos projetos da empresa

import Link from "next/link";
import { formatarMesAno, obterLixeiraMembros, obterPessoas, obterProjetos } from "@/data";
import { ListaMembros, type ResumoMembro } from "@/components/membros/lista";
import { BotaoLink, TituloPagina } from "@/components/ui";

export default async function Membros() {
  const [pessoas, projetos, lixeira] = await Promise.all([obterPessoas(), obterProjetos(), obterLixeiraMembros()]);
  const resumos: ResumoMembro[] = pessoas
    .map((p) => {
      // participações, da mais recente para a mais antiga
      const participacoes = projetos
        .flatMap((projeto) => projeto.membros.filter((m) => m.id === p.id).map((membro) => ({ projeto, membro })))
        .sort((a, b) => b.projeto.inicio.localeCompare(a.projeto.inicio));
      const maior = [...participacoes].sort((a, b) => b.membro.icProjeto - a.membro.icProjeto)[0];
      return {
        id: p.id,
        nome: p.nome,
        // cargo: o papel no projeto mais recente
        cargo: participacoes[0]?.membro.papel ?? "Sem projeto ainda",
        desde: formatarMesAno(p.entrada),
        saiuEm: p.saiuEm ? formatarMesAno(p.saiuEm.slice(0, 7)) : null,
        projetos: participacoes.length,
        maiorIc: maior ? { valor: maior.membro.icProjeto, projeto: maior.projeto.nome } : null,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <TituloPagina rotulo={`${resumos.length} pessoas`} fino="Membros" destaque="do CITi." />
        <div className="flex flex-wrap items-center gap-2">
          {/* a lixeira só aparece quando tem algo dentro */}
          {lixeira.length > 0 && (
            <Link
              href="/membros/lixeira"
              className="rounded-full border border-dashed border-vermelho/40 px-4 py-2 text-sm text-gray-700 transition-colors hover:border-vermelho hover:text-vermelho"
            >
              Lixeira · {lixeira.length}
            </Link>
          )}
          <BotaoLink href="/membros/novo">+ Adicionar membro</BotaoLink>
        </div>
      </div>
      <ListaMembros membros={resumos} />
    </div>
  );
}
