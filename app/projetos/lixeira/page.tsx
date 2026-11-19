// Lixeira: projetos apagados nos últimos 30 dias. Dá para restaurar ou apagar de vez.

import { obterLixeira, obterProjetos } from "@/data";
import { TituloPagina, Voltar } from "@/components/ui";
import { ListaLixeira } from "@/components/projetos/lixeira";

export default async function Lixeira() {
  const [lixeira, [algum]] = await Promise.all([obterLixeira(), obterProjetos()]);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/projetos">Projetos</Voltar>
        <TituloPagina fino="Lixeira" destaque="de projetos." />
        <p className="text-sm text-gray-600">
          Projetos apagados ficam aqui por 30 dias e depois somem de vez, com etapas, tasks, commits e resumos da IA.
        </p>
      </div>
      <ListaLixeira projetos={lixeira} hoje={algum?.hoje ?? ""} />
    </div>
  );
}
