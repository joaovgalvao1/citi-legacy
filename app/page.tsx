// Página inicial — apresenta o CITi Legacy antes da lista de projetos

import { BotaoLink, Caixa, Placeholder } from "@/components/ui";

const passos = [
  {
    titulo: "Mapear quem sabe o quê",
    texto: "A partir dos commits, o CITi Legacy mostra quem detém o conhecimento de cada etapa do projeto.",
  },
  {
    titulo: "Perguntar a quem vai sair",
    texto: "Quando um membro está de saída, a IA gera perguntas específicas sobre o que só ele sabe.",
  },
  {
    titulo: "Gerar o Legado",
    texto: "As respostas viram um documento de passagem de conhecimento para a equipe que fica.",
  },
];

export default function Inicio() {
  return (
    <div className="space-y-10 py-4">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-gray-500">CITi Legacy</p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold sm:text-4xl">
          Quem sai deixa um legado. Quem chega não começa do zero.
        </h1>
        <p className="mx-auto max-w-xl text-gray-600">
          Todo semestre membros saem da empresa júnior. O código fica, mas o porquê das decisões vai
          embora junto com eles.
        </p>
        <div>
          <BotaoLink href="/projetos">Ver projetos da diretoria</BotaoLink>
        </div>
      </section>

      <Placeholder texto="imagem/ilustração do produto: painel com o selo 'Legado registrado'" altura="h-48" />

      <Caixa titulo="Como funciona">
        <ol className="grid gap-4 sm:grid-cols-3">
          {passos.map((passo, i) => (
            <li key={passo.titulo} className="space-y-1 border border-gray-300 p-3">
              <div className="text-sm text-gray-500">Passo {i + 1}</div>
              <div className="font-semibold">{passo.titulo}</div>
              <p className="text-sm text-gray-600">{passo.texto}</p>
            </li>
          ))}
        </ol>
      </Caixa>
    </div>
  );
}
