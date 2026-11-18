// Lista de todas as pessoas que passaram pelos projetos da empresa

import { formatarMesAno, obterPessoas, obterProjetos } from "@/data";
import { ListaMembros, type ResumoMembro } from "@/components/membros/lista";

export default async function Membros() {
  const [pessoas, projetos] = await Promise.all([obterPessoas(), obterProjetos()]);
  const resumos: ResumoMembro[] = pessoas
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      desde: formatarMesAno(p.entrada),
      saiuEm: p.saiuEm ? formatarMesAno(p.saiuEm.slice(0, 7)) : null,
      projetos: projetos.filter((x) => x.membros.some((m) => m.id === p.id)).length,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Membros</h1>
      <ListaMembros membros={resumos} />
    </div>
  );
}
