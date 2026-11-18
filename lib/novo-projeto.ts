// Cadastro de projeto pelo admin: formato dos dados do formulário e validação.
// Usado no navegador (avisos na hora) e no servidor (a validação que vale).

export type EtapaNova = {
  nome: string;
  descricao: string;
  inicioPrevisto: string;
  fimPrevisto: string;
  /** Um caminho por linha, ex.: "src/agenda/**". */
  caminhos: string;
  /** Uma task por linha. */
  tasks: string;
};

export type ProjetoNovo = {
  nome: string;
  /** Id de um cliente existente, ou "" para cadastrar um novo. */
  clienteId: string;
  clienteNovo: string;
  segmentoNovo: string;
  descricao: string;
  contexto: string;
  inicio: string;
  fimPrevisto: string;
  membros: { pessoaId: string; papel: string }[];
  etapas: EtapaNova[];
};

/** "Agendamento e Pacientes" → "agendamento-e-pacientes". */
export function slug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Caminho sugerido para uma etapa, a partir do nome. */
export const caminhoSugerido = (nomeEtapa: string) => (slug(nomeEtapa) ? `src/${slug(nomeEtapa)}/**` : "");

export const linhas = (texto: string) =>
  texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Lista de problemas (vazia = pode salvar). */
export function validarProjeto(p: ProjetoNovo): string[] {
  const erros: string[] = [];
  if (!p.nome.trim()) erros.push("Dê um nome ao projeto.");
  if (!p.clienteId && !p.clienteNovo.trim()) erros.push("Escolha um cliente ou cadastre um novo.");
  if (!p.descricao.trim()) erros.push("Escreva uma descrição curta do projeto.");
  if (!DATA.test(p.inicio) || !DATA.test(p.fimPrevisto)) erros.push("Preencha o início e o fim previsto do projeto.");
  else if (p.fimPrevisto <= p.inicio) erros.push("O fim previsto do projeto precisa ser depois do início.");
  if (!p.membros.length) erros.push("Escolha pelo menos uma pessoa para a equipe.");
  if (p.membros.some((m) => !m.papel.trim())) erros.push("Informe o papel de cada pessoa da equipe.");
  if (!p.etapas.length) erros.push("Adicione pelo menos uma etapa.");

  const ids = new Set<string>();
  p.etapas.forEach((e, i) => {
    const n = `Etapa ${i + 1}${e.nome.trim() ? ` (${e.nome.trim()})` : ""}`;
    if (!slug(e.nome)) erros.push(`${n}: dê um nome à etapa.`);
    else if (ids.has(slug(e.nome))) erros.push(`${n}: já existe outra etapa com esse nome.`);
    ids.add(slug(e.nome));
    if (!DATA.test(e.inicioPrevisto) || !DATA.test(e.fimPrevisto)) erros.push(`${n}: preencha as datas previstas.`);
    else if (e.fimPrevisto < e.inicioPrevisto) erros.push(`${n}: o fim previsto vem antes do início.`);
    if (!linhas(e.caminhos).length) erros.push(`${n}: informe pelo menos um caminho do repositório.`);
    if (!linhas(e.tasks).length) erros.push(`${n}: escreva pelo menos uma task.`);
  });
  return erros;
}
