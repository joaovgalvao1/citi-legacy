// Lista de todos os projetos da empresa

import { obterProjetos } from "@/data";
import { formatarData } from "@/data/formatos";
import { alertaDoCard, duracaoEmMeses, progressoProjeto, statusProjeto, textoPrazo } from "@/lib/status";
import { ListaProjetos, type ResumoProjeto } from "@/components/projetos/lista";
import { BotaoLink } from "@/components/ui";

export default async function Projetos() {
  const projetos = await obterProjetos();
  // resumo calculado no servidor: o navegador recebe só o necessário para os cards
  const resumos: ResumoProjeto[] = projetos.map((p) => {
    const meses = duracaoEmMeses(p);
    return {
      id: p.id,
      nome: p.nome,
      cliente: p.cliente.split(" · ")[0],
      subtitulo: p.cliente.split(" · ").slice(1).join(" · "),
      status: statusProjeto(p),
      progresso: progressoProjeto(p),
      prazo: textoPrazo(p),
      alerta: alertaDoCard(p),
      entrega: p.entrega ? `Entregue em ${formatarData(p.entrega)} · ${meses} ${meses === 1 ? "mês" : "meses"}` : null,
      resultado: p.resumoResultado ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Projetos</h1>
        <div className="flex flex-wrap gap-2">
          <BotaoLink href="/exportar/boletim" variante="secundario">
            Boletim da semana (PDF)
          </BotaoLink>
          <BotaoLink href="/projetos/novo">+ Novo projeto</BotaoLink>
        </div>
      </div>
      <ListaProjetos projetos={resumos} />
    </div>
  );
}
