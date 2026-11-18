// Data de hoje no fuso de Recife ("aaaa-mm-dd").
// Nas telas, "hoje" vem junto com o projeto (campo `hoje`, calculado na leitura do banco):
// servidor e navegador usam a mesma data e as páginas em cache se atualizam ao longo do dia.

export function hoje(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Recife", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

export function somarDias(iso: string, n: number) {
  return new Date(new Date(`${iso.slice(0, 10)}T12:00:00Z`).getTime() + n * 86400000).toISOString().slice(0, 10);
}
