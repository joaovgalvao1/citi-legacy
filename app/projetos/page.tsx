// Lista de todos os projetos da empresa (em andamento, atrasados e concluídos)

import { projetos } from "@/data";
import { alertas, progressoProjeto, statusProjeto, textoPrazo } from "@/lib/status";
import { ListaProjetos, type ResumoProjeto } from "@/components/projetos/lista";

export default function Projetos() {
  // resumo calculado no servidor: o navegador recebe só o necessário para a lista
  const resumos: ResumoProjeto[] = projetos.map((p) => {
    const lista = alertas(p);
    return {
      id: p.id,
      nome: p.nome,
      cliente: p.cliente,
      descricao: p.descricao,
      caseReal: p.caseReal,
      status: statusProjeto(p),
      progresso: progressoProjeto(p),
      prazo: textoPrazo(p),
      membros: p.membros.length,
      etapas: p.etapas.length,
      alertaPrincipal: lista[0] ? { texto: lista[0].texto, informativo: lista[0].tipo === "conhecimento-saiu" } : null,
      totalAlertas: lista.filter((a) => a.tipo !== "conhecimento-saiu").length,
    };
  });

  const n = (s: ResumoProjeto["status"]) => resumos.filter((r) => r.status === s).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projetos</h1>
        <p className="text-sm text-gray-600">
          {resumos.length} projetos · {n("Em andamento")} em andamento · {n("Atrasado")} atrasado
          {n("Atrasado") === 1 ? "" : "s"} · {n("Concluído")} concluído{n("Concluído") === 1 ? "" : "s"}
        </p>
      </div>
      <ListaProjetos projetos={resumos} />
    </div>
  );
}
