// Lista de todas as pessoas que passaram pelos projetos da empresa

import Link from "next/link";
import { formatarMesAno, pessoas, projetosDaPessoa } from "@/data";
import { Selo } from "@/components/ui";

export default function Membros() {
  const lista = pessoas
    .map((p) => ({ pessoa: p, projetos: projetosDaPessoa(p.id) }))
    .sort((a, b) => Number(!!a.pessoa.saiuEm) - Number(!!b.pessoa.saiuEm) || a.pessoa.nome.localeCompare(b.pessoa.nome));
  const ativos = lista.filter((x) => !x.pessoa.saiuEm).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Membros</h1>
        <p className="text-sm text-gray-600">
          {lista.length} pessoas · {ativos} na empresa · {lista.length - ativos} já saíram
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map(({ pessoa, projetos }) => (
          <li key={pessoa.id}>
            <Link href={`/membros/${pessoa.id}`} className="block h-full space-y-1 border border-gray-400 bg-white p-3 hover:border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{pessoa.nome}</span>
                {pessoa.saiuEm ? (
                  <Selo>Saiu em {formatarMesAno(pessoa.saiuEm.slice(0, 7))}</Selo>
                ) : pessoa.saidaPrevista ? (
                  <Selo forte>Sai {pessoa.saidaPrevista}</Selo>
                ) : null}
              </div>
              <div className="text-xs text-gray-500">Desde {formatarMesAno(pessoa.entrada)}</div>
              <div className="text-sm text-gray-600">{projetos.map((x) => x.projeto.nome).join(" · ")}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
