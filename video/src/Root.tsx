// Vídeo do pitch do CITi Legacy: as cenas em sequência, com a legenda da narração.
// Os tempos seguem video/ROTEIRO.md (cerca de 3:50). Para trocar a voz depois, basta
// acrescentar o áudio em <Audio> e ajustar as durações em CENAS.
import { Composition, Sequence } from "remotion";
import type { ReactNode } from "react";
import { FPS, s } from "./tema";
import { Cena, Legenda } from "./pecas";
import { Abertura } from "./cenas/abertura";
import { Contexto } from "./cenas/contexto";
import { Ideia } from "./cenas/ideia";
import { DemoDomingo, DemoProjeto, DemoProjetos, DemoPush, DemoSegunda } from "./cenas/demo";
import { Fechamento, Pessoas, UsoDeIA } from "./cenas/final";

type Def = { dur: number; el: (d: number) => ReactNode; fala: string[] };

const CENAS: Def[] = [
  { dur: s(15), el: () => <Abertura />, fala: ["Todo projeto do CITi tem um ritmo.", "E todo esse trabalho já está registrado num lugar: no código."] },
  {
    dur: s(25),
    el: () => <Contexto />,
    fala: [
      "Acompanhar vários projetos ao mesmo tempo (prazos, escopo, quem está fazendo o quê) exige atenção toda semana.",
      "Normalmente, isso vira planilha, cobrança de status no grupo e reunião só para saber como está cada projeto.",
    ],
  },
  {
    dur: s(20),
    el: () => <Ideia />,
    fala: [
      "O CITi Legacy faz esse acompanhamento direto do código.",
      "A equipe trabalha normalmente no GitHub, e a plataforma transforma commits e tasks em andamento, previsão de entrega e prioridades.",
      "Sem planilha, sem ninguém preencher nada.",
    ],
  },
  {
    dur: s(20),
    el: (d) => <DemoProjetos duracao={d} />,
    fala: [
      "Cada projeto ganha uma cor pela situação real.",
      "A previsão usa o ritmo das últimas semanas e aponta o gargalo antes de virar atraso.",
      "E o projeto mais crítico sobe para o topo, já com o resumo da IA.",
    ],
  },
  {
    dur: s(20),
    el: (d) => <DemoProjeto duracao={d} />,
    fala: ["Dentro do projeto, cada etapa tem prazo, tasks e quem mais conhece aquela parte.", "Marcou uma task, tudo se atualiza."],
  },
  {
    dur: s(18),
    el: () => <DemoPush />,
    fala: ["E quando alguém faz um push, o GitHub avisa na hora.", "O commit entra na etapa certa pelos arquivos que alterou."],
  },
  {
    dur: s(17),
    el: () => <DemoDomingo />,
    fala: ["Todo domingo à noite, a IA lê a semana de cada projeto: o que andou, o que travou e o que fazer primeiro.", "E o boletim chega por e-mail."],
  },
  { dur: s(15), el: (d) => <DemoSegunda duracao={d} />, fala: ["E na segunda, a reunião da diretoria já chega montada, em slides ou em PDF."] },
  {
    dur: s(25),
    el: (d) => <Pessoas duracao={d} />,
    fala: [
      "Também dá para ver as pessoas por trás dos projetos: quem conhece cada parte e quem trabalhou com quem.",
      "Quando a equipe muda, o histórico fica. É daí que vem o nome Legacy.",
    ],
  },
  {
    dur: s(35),
    el: (d) => <UsoDeIA duracao={d} />,
    fala: [
      "A IA está em dois lugares.",
      "No produto, ela resume a semana com memória das anteriores.",
      "E no desenvolvimento, que levou três dias, trabalhei com uma regra: a IA propõe, eu decido.",
      "A ideia, as hipóteses e o rumo foram meus, e cada passo está registrado.",
    ],
  },
  { dur: s(20), el: (d) => <Fechamento duracao={d} />, fala: ["CITi Legacy.", "Todos os projetos do CITi, acompanhados semana a semana."] },
];

export const DURACAO_TOTAL = CENAS.reduce((a, c) => a + c.dur, 0);

function Pitch() {
  let inicio = 0;
  return (
    <>
      {CENAS.map((c, i) => {
        const de = inicio;
        inicio += c.dur;
        return (
          <Sequence key={i} from={de} durationInFrames={c.dur}>
            <Cena duracao={c.dur} entrada={i === 0 ? 1 : 12}>
              {c.el(c.dur)}
            </Cena>
            <Legenda frases={c.fala} duracao={c.dur} />
          </Sequence>
        );
      })}
    </>
  );
}

export function Root() {
  return <Composition id="Pitch" component={Pitch} durationInFrames={DURACAO_TOTAL} fps={FPS} width={1920} height={1080} />;
}
