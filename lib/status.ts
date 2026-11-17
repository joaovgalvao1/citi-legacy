// Status de projetos e etapas, progresso e alertas. Funções puras.
//
// Etapa:
//   Concluída     progresso 100%
//   Não iniciada  progresso 0% e o início previsto ainda não chegou
//   Atrasada      passou do fim previsto sem chegar a 100%
//   Em andamento  o resto
//   + "parada" (sinal extra): em andamento ou atrasada, sem commits há 14 dias ou mais
//
// Projeto:
//   Concluído     entregue
//   Atrasado      passou do fim previsto sem ser entregue
//   Em andamento  o resto
//
// Alertas (só projetos não concluídos), do mais grave para o menos:
//   saída próxima de quem detém o conhecimento (urgência alta/moderada) · etapa atrasada · etapa parada
// Projetos concluídos têm só um aviso informativo: quem mais sabe de uma etapa já saiu da empresa.

import type { Etapa, Projeto } from "@/data";
import { dataReferencia } from "@/data/referencia.json";
import { avaliarEtapa, emPct, type Nivel, type NivelUrgencia } from "./indice";

export const DIAS_PARADA = 14;

const DIA = 86400000;
const data = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime();
export const diasEntre = (de: string, ate: string) => Math.round((data(ate) - data(de)) / DIA);
const hoje = dataReferencia;

export type StatusEtapa = "Concluída" | "Em andamento" | "Atrasada" | "Não iniciada";
export type StatusProjeto = "Concluído" | "Em andamento" | "Atrasado";

export function statusEtapa(projeto: Projeto, etapa: Etapa): StatusEtapa {
  if (etapa.progresso >= 100 || projeto.status === "concluido") return "Concluída";
  if (hoje > etapa.fimPrevisto) return "Atrasada";
  if (etapa.progresso === 0 && hoje < etapa.inicioPrevisto) return "Não iniciada";
  return "Em andamento";
}

/** Dias sem commits numa etapa que ainda não acabou (null se não está parada). */
export function diasParada(projeto: Projeto, etapa: Etapa): number | null {
  if (statusEtapa(projeto, etapa) === "Concluída" || !etapa.ultimoCommit) return null;
  const dias = diasEntre(etapa.ultimoCommit, hoje);
  return dias >= DIAS_PARADA ? dias : null;
}

export function statusProjeto(projeto: Projeto): StatusProjeto {
  if (projeto.status === "concluido") return "Concluído";
  if (hoje > projeto.fimPrevisto) return "Atrasado";
  return "Em andamento";
}

/** Progresso do projeto: média simples do progresso das etapas. */
export function progressoProjeto(projeto: Projeto) {
  return projeto.etapas.reduce((s, e) => s + e.progresso, 0) / projeto.etapas.length;
}

/** Texto do prazo: "faltam 31 dias", "atrasado há 11 dias", "entregue em 20/03/2026". */
export function textoPrazo(projeto: Projeto) {
  if (projeto.entrega) {
    const d = diasEntre(projeto.fimPrevisto, projeto.entrega);
    const quando = projeto.entrega.split("-").reverse().join("/");
    if (d > 0) return `entregue em ${quando}, ${d} dias depois do previsto`;
    if (d < 0) return `entregue em ${quando}, ${-d} dias antes do previsto`;
    return `entregue em ${quando}, no prazo`;
  }
  const d = diasEntre(hoje, projeto.fimPrevisto);
  if (d < 0) return `atrasado há ${-d} dias`;
  return d === 0 ? "prazo termina hoje" : `faltam ${d} dias`;
}

/* ---------- alertas ---------- */

export type Alerta = {
  tipo: "saida" | "atrasada" | "parada" | "conhecimento-saiu";
  etapaId: string;
  texto: string;
  gravidade: number; // maior = mais grave
  risco?: Nivel;
  urgencia?: NivelUrgencia;
};

const pesoUrgencia: Record<NivelUrgencia, number> = { Alta: 30, Moderada: 20, Baixa: 0 };
const pesoRisco: Record<Nivel, number> = { Alto: 3, Moderado: 2, Baixo: 1 };

export function alertas(projeto: Projeto): Alerta[] {
  const lista: Alerta[] = [];
  for (const etapa of projeto.etapas) {
    const av = avaliarEtapa(projeto, etapa.id);
    const quem = av.lider?.membro;

    if (projeto.status === "concluido") {
      if (quem?.saiuEm) {
        lista.push({
          tipo: "conhecimento-saiu",
          etapaId: etapa.id,
          gravidade: 1,
          texto: `Quem mais sabe de ${etapa.nome} (${quem.nome}, IC ${emPct(av.lider!.ic)}) já saiu da empresa`,
        });
      }
      continue;
    }

    if (quem && av.urgencia !== "Baixa") {
      lista.push({
        tipo: "saida",
        etapaId: etapa.id,
        gravidade: pesoUrgencia[av.urgencia] + pesoRisco[av.risco],
        risco: av.risco,
        urgencia: av.urgencia,
        texto: `${quem.nome} sai ${quem.saidaPrevista} · ${etapa.nome} depende de ${quem.nome.split(" ")[0]} (IC ${emPct(av.lider!.ic)})`,
      });
    }
    if (statusEtapa(projeto, etapa) === "Atrasada") {
      const d = diasEntre(etapa.fimPrevisto, hoje);
      lista.push({
        tipo: "atrasada",
        etapaId: etapa.id,
        gravidade: 15 + Math.min(d, 30) / 10,
        texto: `${etapa.nome} está atrasada há ${d} dias, com ${emPct(etapa.progresso)} concluído`,
      });
    }
    const parada = diasParada(projeto, etapa);
    if (parada !== null) {
      lista.push({
        tipo: "parada",
        etapaId: etapa.id,
        gravidade: 10 + Math.min(parada, 30) / 10,
        texto: `${etapa.nome} está sem commits há ${parada} dias`,
      });
    }
  }
  return lista.sort((a, b) => b.gravidade - a.gravidade);
}
