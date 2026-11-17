// Lista de todas as pessoas que passaram pelos projetos da empresa

import { formatarMesAno, pessoas, projetosDaPessoa } from "@/data";
import { ListaMembros, type ResumoMembro } from "@/components/membros/lista";

export default function Membros() {
  const resumos: ResumoMembro[] = pessoas
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      desde: formatarMesAno(p.entrada),
      saiuEm: p.saiuEm ? formatarMesAno(p.saiuEm.slice(0, 7)) : null,
      projetos: projetosDaPessoa(p.id).length,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Membros</h1>
      <ListaMembros membros={resumos} />
    </div>
  );
}
