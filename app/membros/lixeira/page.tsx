// Lixeira de membros: quem foi apagado nos últimos 30 dias (só pessoas sem commits)

import { obterLixeiraMembros, obterProjetos } from "@/data";
import { TituloPagina, Voltar } from "@/components/ui";
import { ListaLixeiraMembros } from "@/components/membros/lixeira";

export default async function LixeiraMembros() {
  const [lixeira, [algum]] = await Promise.all([obterLixeiraMembros(), obterProjetos()]);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Voltar href="/membros">Membros</Voltar>
        <TituloPagina fino="Lixeira" destaque="de membros." />
        <p className="text-sm text-gray-600">Membros apagados ficam aqui por 30 dias e depois somem de vez.</p>
      </div>
      <ListaLixeiraMembros membros={lixeira} hoje={algum?.hoje ?? ""} />
    </div>
  );
}
