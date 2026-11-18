// Cálculos a partir dos commits: Índice de Conhecimento (IC), concentração, atividade semanal
// e primeiro/último commit de cada etapa. Funções puras, usadas pela camada de dados.
//
// IC (0 a 100) de um membro numa etapa = média ponderada das fatias dele em:
//   linhas efetivas (50%) · commits (20%) · linhas brutas (15%) ·
//   linhas efetivas recentes (15%, com meia-vida de 45 dias)
// Em cada etapa, a soma dos IC dos membros é 100.
// Concentração = soma dos (IC/100)² da etapa (índice HHI): 1 = uma pessoa sabe tudo.

export type Sinais = { efetivas: number; commits: number; brutas: number; recentes: number };
export type Semana = { semana: string; commits: Record<string, number> };

export type CommitBase = {
  autor: string;
  data: string;
  etapas: string[];
  adicionadas: number;
  removidas: number;
  efetivas: number;
};

export const PESOS_IC: Sinais = { efetivas: 0.5, commits: 0.2, brutas: 0.15, recentes: 0.15 };
const MEIA_VIDA_DIAS = 45;
const DIA = 86400000;

const paraData = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00-03:00`);

export function indiceConhecimento(lista: CommitBase[], membroIds: string[], referencia: string) {
  const ref = paraData(referencia).getTime();
  const sinais: Record<keyof Sinais, (k: CommitBase) => number> = {
    efetivas: (k) => k.efetivas,
    commits: () => 1,
    brutas: (k) => k.adicionadas + k.removidas,
    recentes: (k) => k.efetivas * Math.pow(0.5, (ref - new Date(k.data).getTime()) / DIA / MEIA_VIDA_DIAS),
  };
  const ic: Record<string, number> = Object.fromEntries(membroIds.map((id) => [id, 0]));
  const fatias: Record<string, Sinais> = Object.fromEntries(
    membroIds.map((id) => [id, { efetivas: 0, commits: 0, brutas: 0, recentes: 0 }]),
  );
  for (const sinal of Object.keys(sinais) as (keyof Sinais)[]) {
    const f = sinais[sinal];
    const total = lista.reduce((s, k) => s + f(k), 0);
    if (!total) continue;
    for (const k of lista) {
      if (!(k.autor in ic)) continue;
      ic[k.autor] += (PESOS_IC[sinal] * f(k)) / total;
      fatias[k.autor][sinal] += (100 * f(k)) / total;
    }
  }
  for (const id of membroIds) {
    ic[id] = Math.round(ic[id] * 1000) / 10;
    for (const s of Object.keys(sinais) as (keyof Sinais)[]) fatias[id][s] = Math.round(fatias[id][s] * 10) / 10;
  }
  return { ic, fatias };
}

export const concentracao = (ic: Record<string, number>) =>
  Math.round(Object.values(ic).reduce((s, v) => s + (v / 100) ** 2, 0) * 100) / 100;

/** Segunda-feira da semana de uma data ("aaaa-mm-dd"). */
export function inicioDaSemana(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - dow * DIA).toISOString().slice(0, 10);
}

/** Todas as semanas (segundas-feiras) de `inicio` até `fim`, inclusive. */
export function listaSemanas(inicio: string, fim: string) {
  const lista: string[] = [];
  for (let d = new Date(`${inicioDaSemana(inicio)}T12:00:00Z`); d.toISOString().slice(0, 10) <= fim; d = new Date(d.getTime() + 7 * DIA)) {
    lista.push(d.toISOString().slice(0, 10));
  }
  return lista;
}

/** Commits por semana e por membro. */
export function semanasDe(lista: CommitBase[], semanas: string[], membroIds: string[]): Semana[] {
  const mapa = new Map(semanas.map((s) => [s, Object.fromEntries(membroIds.map((id) => [id, 0])) as Record<string, number>]));
  for (const k of lista) {
    const linha = mapa.get(inicioDaSemana(k.data));
    if (linha && k.autor in linha) linha[k.autor] += 1;
  }
  return semanas.map((semana) => ({ semana, commits: mapa.get(semana)! }));
}
