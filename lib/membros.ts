// Cadastro e edição de membros: formato do formulário e validação (navegador e servidor).

export type MembroForm = {
  nome: string;
  /** Entrada no CITi, "aaaa-mm". */
  entrada: string;
  /** Saída do CITi ("aaaa-mm-dd") ou "" se ainda está na empresa. */
  saiuEm: string;
  /** Contatos (opcionais). */
  email: string;
  linkedin: string;
  github: string;
};

/** Usuário do GitHub a partir do que foi digitado ("helena-d" ou "https://github.com/helena-d"). */
export function usuarioGithub(texto: string) {
  const t = texto.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/^@/, "").split(/[/?#]/)[0];
  return t;
}

/** Endereço do LinkedIn a partir do que foi digitado ("helena-d", "linkedin.com/in/helena-d" ou o link completo). */
export function enderecoLinkedin(texto: string) {
  const t = texto.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (/linkedin\.com\//i.test(t)) return `https://${t.replace(/^www\./i, "www.")}`;
  return `https://www.linkedin.com/in/${t.replace(/^@/, "")}`;
}

export function validarMembro(m: MembroForm): string[] {
  const erros: string[] = [];
  if (m.nome.trim().split(/\s+/).length < 2) erros.push("Escreva o nome e o sobrenome.");
  if (!/^\d{4}-\d{2}$/.test(m.entrada)) erros.push("Informe o mês de entrada no CITi.");
  if (m.saiuEm && !/^\d{4}-\d{2}-\d{2}$/.test(m.saiuEm)) erros.push("A data de saída está incompleta.");
  if (m.saiuEm && m.saiuEm.slice(0, 7) < m.entrada) erros.push("A saída precisa ser depois da entrada.");
  if (m.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim())) erros.push("O e-mail não parece válido.");
  if (m.linkedin.trim() && !/^(https?:\/\/)?(www\.)?linkedin\.com\/|^[\w-]{3,100}$/i.test(m.linkedin.trim()))
    erros.push("O LinkedIn deve ser o link do perfil (linkedin.com/in/...) ou o nome do perfil.");
  if (m.github.trim() && !/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(usuarioGithub(m.github))) erros.push("O GitHub deve ser o usuário (ex.: helena-d) ou o link do perfil.");
  return erros;
}
