// Convite da reunião da diretoria: data, horário, duração, local e recado.
// Usado no navegador (janela "Marcar reunião") e no servidor (e-mail do convite).
// A conexão com a agenda é um link "Adicionar ao Google Agenda" com o evento já preenchido
// (sem login nem permissão do Google; a pessoa só confirma na agenda dela).

export type Convite = {
  data: string; // "aaaa-mm-dd"
  hora: string; // "HH:MM"
  duracao: number; // minutos
  local: string;
  recado: string;
};

export const DURACOES = [30, 60, 90] as const;
const FUSO = "America/Recife";
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const meioDia = (iso: string) => new Date(`${iso}T12:00:00Z`);
const somar = (iso: string, dias: number) => new Date(meioDia(iso).getTime() + dias * 86400000).toISOString().slice(0, 10);

/** Próxima segunda-feira depois de hoje (sugestão de data): o boletim sai no domingo à noite. */
export function proximaSegunda(hoje: string) {
  let d = somar(hoje, 1);
  while (meioDia(d).getUTCDay() !== 1) d = somar(d, 1);
  return d;
}

/** Hora de término ("HH:MM") somando a duração; passa da meia-noite só no texto, não muda o dia. */
function horaFim(c: Convite) {
  const [h, m] = c.hora.split(":").map(Number);
  const total = h * 60 + m + c.duracao;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const hhmm = (hora: string) => hora.replace(":", "h");

/** "qui, 20/11 · 14h00 às 15h00" */
export function textoQuando(c: Convite) {
  return `${DIAS[meioDia(c.data).getUTCDay()]}, ${c.data.slice(8, 10)}/${c.data.slice(5, 7)} · ${hhmm(c.hora)} às ${hhmm(horaFim(c))}`;
}

/** "qui 20/11, 14h00" (para o assunto do e-mail) */
export function textoCurto(c: Convite) {
  return `${DIAS[meioDia(c.data).getUTCDay()]} ${c.data.slice(8, 10)}/${c.data.slice(5, 7)}, ${hhmm(c.hora)}`;
}

/** Problemas no convite (vazio = pode enviar). */
export function validarConvite(c: Convite, hoje: string): string[] {
  const erros: string[] = [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.data)) erros.push("Escolha a data da reunião.");
  else if (c.data < hoje) erros.push("A data da reunião já passou.");
  if (!/^\d{2}:\d{2}$/.test(c.hora)) erros.push("Escolha o horário.");
  if (!DURACOES.includes(c.duracao as (typeof DURACOES)[number])) erros.push("Escolha a duração.");
  if (c.local.length > 200 || c.recado.length > 500) erros.push("Local ou recado muito longo.");
  return erros;
}

/** Link do Google Agenda com o evento preenchido (horário de Recife). */
export function linkGoogleAgenda(c: Convite, titulo: string, detalhes: string) {
  const inicio = `${c.data.replaceAll("-", "")}T${c.hora.replace(":", "")}00`;
  const [h, m] = c.hora.split(":").map(Number);
  const fimMin = h * 60 + m + c.duracao;
  const dataFim = fimMin >= 24 * 60 ? somar(c.data, 1) : c.data;
  const fim = `${dataFim.replaceAll("-", "")}T${String(Math.floor(fimMin / 60) % 24).padStart(2, "0")}${String(fimMin % 60).padStart(2, "0")}00`;
  const q = new URLSearchParams({ action: "TEMPLATE", text: titulo, dates: `${inicio}/${fim}`, ctz: FUSO, details: detalhes });
  if (c.local.trim()) q.set("location", c.local.trim());
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
