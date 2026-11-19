// Cadastro de projeto pelo admin

import { obterClientes, obterPessoas, obterProjetos } from "@/data";
import { TituloPagina, Voltar } from "@/components/ui";
import { FormularioNovoProjeto } from "@/components/projetos/novo-projeto";

export default async function NovoProjeto() {
  // "hoje" vem da leitura em cache (a mesma data usada no resto do app)
  const [clientes, pessoas, [algum]] = await Promise.all([obterClientes(), obterPessoas(), obterProjetos()]);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/projetos">Projetos</Voltar>
        <TituloPagina fino="Novo" destaque="projeto." />
        <p className="text-sm text-gray-600">
          Cadastre o projeto, a equipe e as etapas. Cada etapa aponta para as pastas do repositório que ela cobre, e o progresso vem das tasks.
        </p>
      </div>
      <FormularioNovoProjeto
        clientes={clientes}
        pessoas={pessoas.filter((p) => !p.saiuEm).map((p) => ({ id: p.id, nome: p.nome }))}
        hoje={algum?.hoje ?? ""}
      />
    </div>
  );
}
