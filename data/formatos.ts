// Formatação de datas (sem dependências: pode ser usada no navegador).

/** "2025-03" → "mar/2025" */
export function formatarMesAno(aaaaMm: string) {
  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const [ano, mes] = aaaaMm.split("-");
  return `${meses[Number(mes) - 1]}/${ano}`;
}

/** "2026-11-06" → "06/11/2026" */
export function formatarData(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}
