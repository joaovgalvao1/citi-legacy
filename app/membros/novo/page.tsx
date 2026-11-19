// Adicionar membro (sem commits ainda; entra nas equipes ao criar ou editar um projeto)

import { obterProjetos } from "@/data";
import { TituloPagina, Voltar } from "@/components/ui";
import { FormularioMembro } from "@/components/membros/formulario";

export default async function NovoMembro() {
  const [algum] = await obterProjetos();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/membros">Membros</Voltar>
        <TituloPagina fino="Adicionar" destaque="membro." />
      </div>
      <FormularioMembro hoje={algum?.hoje ?? ""} />
    </div>
  );
}
