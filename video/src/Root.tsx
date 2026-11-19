// Vídeo do pitch do CITi Legacy (versão final): cenas, narração (ElevenLabs) e legendas.
// Os tempos de cada cena seguem a duração real de cada fala (video/NARRACAO.md).
import { Audio, Composition, Sequence, staticFile, interpolate, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";
import { FPS, s } from "./tema";
import { Cena } from "./pecas";
import { Fala, Legenda } from "./midia";
import { Abertura } from "./cenas/abertura";
import { Problema } from "./cenas/problema";
import { Solucao } from "./cenas/solucao";
import { DemoDomingo, DemoProjeto, DemoProjetos, DemoPush, DemoReuniao } from "./cenas/demonstracao";
import { Fechamento, Pessoas, UsoDeIA } from "./cenas/encerramento";

type Trecho = { a: number; b?: number; em: number };
type Def = { dur: number; el: ReactNode; voz: string; fala: Trecho[]; leg: [string, number, number][] };
const tudo = (em: number): Trecho[] => [{ a: 0, em }];

const CENAS: Def[] = [
  {
    dur: 9,
    el: <Abertura />,
    voz: "01-abertura",
    fala: tudo(0.6),
    leg: [
      ["Todo projeto do CITi tem um ritmo.", 0.6, 2.9],
      ["E todo esse trabalho já está registrado num lugar: no código.", 2.9, 6.6],
    ],
  },
  {
    dur: 27,
    el: <Problema />,
    voz: "02-contexto",
    fala: tudo(1.0),
    leg: [
      ["Acompanhar vários projetos ao mesmo tempo, com prazos, escopo e quem está fazendo o quê, exige atenção toda semana.", 1.0, 10.2],
      ["Normalmente, isso vira planilha, cobrança de status no grupo e reunião só para saber como está cada projeto.", 10.2, 17.6],
      ["Enquanto isso, o trabalho de verdade já está registrado no GitHub, só que espalhado em repositórios, branches e commits.", 17.6, 22.3],
      ["E se o próprio código contasse como está cada projeto?", 22.3, 25.4],
    ],
  },
  {
    dur: 18,
    el: <Solucao />,
    voz: "03-ideia",
    fala: tudo(0.5),
    leg: [
      ["O CITi Legacy faz esse acompanhamento direto do código.", 0.5, 3.6],
      ["A equipe trabalha normalmente no GitHub, e a plataforma transforma commits e tasks em andamento, previsão de entrega e prioridades.", 3.6, 9.8],
      ["Sem planilha, sem ninguém preencher nada.", 9.8, 14.9],
    ],
  },
  {
    dur: 15.5,
    el: <DemoProjetos />,
    voz: "04-projetos",
    fala: tudo(0.5),
    leg: [
      ["Cada projeto ganha uma cor, pela situação real.", 0.5, 3.3],
      ["A previsão usa o ritmo das últimas semanas e aponta o gargalo, antes de virar atraso.", 3.3, 9.6],
      ["E o projeto mais crítico sobe para o topo, já com o resumo da IA.", 9.6, 14.2],
    ],
  },
  {
    dur: 14,
    el: <DemoProjeto />,
    voz: "05-projeto",
    fala: [
      { a: 0, b: 4.48, em: 2.6 },
      { a: 4.48, em: 8.0 },
    ],
    leg: [
      ["Dentro do projeto, cada etapa tem prazo, tasks e quem mais conhece aquela parte.", 2.6, 7.1],
      ["Marcou uma task, tudo se atualiza.", 8.0, 10.5],
    ],
  },
  {
    dur: 21.5,
    el: <DemoPush />,
    voz: "06-push",
    fala: tudo(2.0),
    leg: [
      ["Quando alguém faz um push, o GitHub avisa o CITi Legacy na hora,", 2.0, 6.0],
      ["com uma assinatura que garante que o aviso é verdadeiro.", 6.0, 9.25],
      ["Pelos arquivos que mudaram, o commit entra sozinho na etapa certa.", 9.25, 13.56],
      ["O pulso do projeto bate, o conhecimento de quem fez cresce, e uma estrela nova acende.", 13.56, 19.4],
    ],
  },
  {
    dur: 18,
    el: <DemoDomingo />,
    voz: "07-domingo",
    fala: tudo(0.8),
    leg: [
      ["Todo domingo, às onze da noite, a IA lê a semana de cada projeto,", 0.8, 5.3],
      ["lembrando das anteriores, e escreve o que andou, o que travou e o que fazer primeiro.", 5.3, 10.7],
      ["Os resumos viram um boletim, que chega por e-mail antes da segunda começar.", 10.7, 15.3],
    ],
  },
  {
    dur: 26.5,
    el: <DemoReuniao />,
    voz: "08-reuniao",
    fala: [
      { a: 0, b: 4.36, em: 0.5 },
      { a: 4.36, b: 8.18, em: 6.6 },
      { a: 8.18, b: 10.84, em: 12.8 },
      { a: 10.84, b: 13.22, em: 17.6 },
      { a: 13.22, b: 15.13, em: 20.2 },
      { a: 15.13, em: 22.4 },
    ],
    leg: [
      ["Para a reunião de segunda, a diretoria marca o horário no próprio app.", 0.5, 4.9],
      ["O convite chega por e-mail, com a pauta e um botão para a agenda.", 6.6, 10.5],
      ["E o evento já leva o link da apresentação.", 12.8, 15.5],
      ["Na hora da reunião, é só abrir... os slides estão prontos.", 17.6, 22.2],
      ["E dá para baixar tudo num arquivo.", 22.4, 25.0],
    ],
  },
  {
    dur: 18.5,
    el: <Pessoas />,
    voz: "09-pessoas",
    fala: tudo(0.6),
    leg: [
      ["Também dá para ver as pessoas por trás dos projetos:", 0.6, 3.2],
      ["quem conhece cada parte e quem trabalhou com quem.", 3.2, 6.8],
      ["E quando alguém sai, o conhecimento não vai embora: o histórico fica.", 6.8, 12.4],
      ["É daí... que vem o nome Legacy.", 12.4, 15.2],
    ],
  },
  {
    dur: 36,
    el: <UsoDeIA />,
    voz: "10-ia",
    fala: tudo(1.0),
    leg: [
      ["A IA está em dois lugares. No produto, ela escreve os resumos de domingo.", 1.0, 5.6],
      ["No desenvolvimento, foi minha parceira nos três dias do projeto.", 5.6, 9.7],
      ["Quando a previsão da Mezzalira parecia errada, levantei a hipótese,", 9.7, 14.0],
      ["e a IA testou três regras até confirmar a minha.", 14.0, 17.2],
      ["Quando a exportação no iPad saía quebrada, desconfiei da impressão;", 17.2, 22.6],
      ["a IA confirmou, e eu decidi levar a solução para o computador também.", 22.6, 25.4],
      ["Na ideação, eu levanto a hipótese e a IA testa.", 25.4, 28.1],
      ["Na construção do código, a IA propõe e eu decido.", 28.1, 32.6],
      ["E está tudo registrado.", 32.6, 34.2],
    ],
  },
  {
    dur: 15,
    el: <Fechamento />,
    voz: "11-fechamento",
    fala: tudo(0.8),
    leg: [
      ["Funciona no computador e instalado como app, no iPad e no celular.", 0.8, 6.1],
      ["CITi Legacy. Todos os projetos do CITi, acompanhados semana a semana.", 6.1, 9.6],
    ],
  },
];

export const DURACAO_TOTAL = CENAS.reduce((a, c) => a + s(c.dur), 0);

function Trilha() {
  const f = useCurrentFrame();
  // trilha baixa por baixo da voz; sobe um pouco no fim
  const vol = interpolate(f, [0, s(2), DURACAO_TOTAL - s(16), DURACAO_TOTAL - s(9), DURACAO_TOTAL - s(1), DURACAO_TOTAL], [0, 0.12, 0.12, 0.2, 0.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Audio src={staticFile("som/trilha.wav")} volume={vol} loop />;
}

function Pitch() {
  let inicio = 0;
  return (
    <>
      <Trilha />
      {CENAS.map((c, i) => {
        const de = inicio;
        const dur = s(c.dur);
        inicio += dur;
        return (
          <Sequence key={i} from={de} durationInFrames={dur}>
            <Cena duracao={dur} entrada={i === 0 ? 1 : 10} saida={i === CENAS.length - 1 ? 20 : 10}>
              {c.el}
            </Cena>
            <Fala arquivo={c.voz} trechos={c.fala} />
            <Legenda frases={c.leg} />
          </Sequence>
        );
      })}
    </>
  );
}

export function Root() {
  return <Composition id="Pitch" component={Pitch} durationInFrames={DURACAO_TOTAL} fps={FPS} width={1920} height={1080} />;
}
