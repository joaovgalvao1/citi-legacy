# CITi Legacy

> Quem sai deixa um legado. Quem chega não começa do zero.

Protótipo para o desafio **Inovação no PS** do CITi. O CITi Legacy mostra ao diretor de projetos quem detém o conhecimento de cada etapa de um projeto, a partir dos commits. Quando um membro vai sair, a IA faz perguntas específicas a ele e gera o **Legado** daquele membro: um documento de passagem de conhecimento para a equipe.

## Estado atual

**Etapa 2: média fidelidade.** As telas já têm gráficos reais (barras de IC e linha do tempo de commits), interações e o legado montado a partir das respostas. Os dados são fictícios, de 3 projetos (Folhagem & Cia, Clínica Movimento e Metalúrgica Mezzalira). A interface ainda está em tons de cinza, sem identidade visual e sem IA; as duas entram na etapa 3.

| Tela | Rota |
|---|---|
| Início | `/` |
| Projetos da diretoria | `/projetos` |
| Painel do projeto | `/projetos/[projetoId]` |
| Etapa do projeto | `/projetos/[projetoId]/etapas/[etapaId]` |
| Registrar legado | `/projetos/[projetoId]/membros/[membroId]/legado` |
| Legado gerado | `/projetos/[projetoId]/membros/[membroId]/legado/documento` |

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Dados

Os dados são fictícios e gerados por `npm run dados` a partir de `scripts/cenarios.mjs`: 13 personagens inventados e 456 commits.

### Índice de Conhecimento (IC)

O app mostra um único número por membro e etapa: o **IC**, exibido em % (de 0% a 100%). Ele diz quanto do conhecimento da etapa está com cada pessoa. Em cada etapa, a soma dos IC é 100%. O IC é a média ponderada da fatia do membro em quatro sinais tirados dos commits:

| Sinal | Peso | O que mede |
|---|---|---|
| Linhas efetivas | 50% | Linhas adicionadas que continuam no código hoje |
| Commits | 20% | Frequência de envolvimento |
| Linhas brutas | 15% | Volume de alterações (adicionadas + removidas) |
| Linhas efetivas recentes | 15% | Linhas efetivas com meia-vida de 45 dias: conhecimento esfria |

- **Concentração (HHI)** é a soma dos (IC/100)² da etapa. Vai de 0% a 100%, e 100% significa que uma pessoa sabe tudo.

### Risco e urgência

Cada etapa recebe duas classificações independentes:

| | Alto(a) | Moderado(a) | Baixo(a) |
|---|---|---|---|
| **Risco**, pela concentração do IC | ≥ 70% | ≥ 45% | < 45% |
| **Urgência**, pela saída de quem tem o maior IC | sai em até 21 dias | sai em até 60 dias | sai depois disso ou **não tem data de saída** |

- Só geram alerta as etapas com urgência alta ou moderada.
- Registrar o legado de quem tem o maior IC marca a etapa como **mitigada**.

## Funcionalidades

- **Painel do projeto:**
  - barras de IC por etapa;
  - matriz membro × etapa (passar o mouse destaca linha e coluna; clicar abre a etapa);
  - linha do tempo de commits por semana, com detalhe ao passar o mouse.
- **Destaque de membro:** clicar num membro destaca a contribuição dele em todos os gráficos da página.
- **Página da etapa:**
  - ranking por IC, risco e urgência;
  - linha do tempo só da etapa;
  - "Como o IC foi calculado", com os 4 sinais de cada membro, os pesos e a contribuição de cada um.
- **Legado:**
  - as perguntas são agrupadas por seção, e o rascunho é salvo a cada tecla;
  - o documento é montado com as respostas;
  - dá para copiar e baixar em `.md`;
  - o "Voltar" leva para a página de onde você veio.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · deploy na Vercel.

## Estrutura

```
app/                       rotas (uma pasta por tela)
components/ui/             peças de interface (Caixa, Selo, Alerta, botões)
components/graficos/       barras de IC, linha do tempo, cores dos membros, destaque
components/painel/         painel, página da etapa, matriz e cálculo do IC
components/risco/          selos e alertas de risco e urgência
components/legado/         botões, formulário (com rascunho) e documento do legado
data/*.json                dados fictícios gerados (projetos, commits, análises)
data/index.ts              leitura dos JSONs no formato usado pelas telas
data/commits.ts            commits e perguntas do legado (só no servidor)
lib/indice.ts              IC, risco e urgência
lib/legados.ts             legados, rascunhos e origem no armazenamento do navegador
scripts/                   cenários e gerador dos dados (npm run dados)
DEV_LOG.md                 como a IA foi usada em cada etapa
```
