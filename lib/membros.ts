// Cadastro e edição de membros: formato do formulário e validação (navegador e servidor).

export type MembroForm = {
  nome: string;
  /** Entrada no CITi, "aaaa-mm". */
  entrada: string;
  /** Saída do CITi ("aaaa-mm-dd") ou "" se ainda está na empresa. */
  saiuEm: string;
};

export function validarMembro(m: MembroForm): string[] {
  const erros: string[] = [];
  if (m.nome.trim().split(/\s+/).length < 2) erros.push("Escreva o nome e o sobrenome.");
  if (!/^\d{4}-\d{2}$/.test(m.entrada)) erros.push("Informe o mês de entrada no CITi.");
  if (m.saiuEm && !/^\d{4}-\d{2}-\d{2}$/.test(m.saiuEm)) erros.push("A data de saída está incompleta.");
  if (m.saiuEm && m.saiuEm.slice(0, 7) < m.entrada) erros.push("A saída precisa ser depois da entrada.");
  return erros;
}
