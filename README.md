# CITi Legacy

> Quem sai deixa um legado. Quem chega não começa do zero.

Protótipo para o desafio **Inovação no PS** do CITi. O CITi Legacy mostra ao diretor de projetos quem detém o conhecimento de cada etapa de um projeto, a partir dos commits. Quando um membro vai sair, a IA faz perguntas específicas a ele e gera o **Legado** daquele membro: um documento de passagem de conhecimento para a equipe.

## Estado atual

**Etapa 1: baixa fidelidade (wireframe navegável).** São 6 telas em tons de cinza, com dados fictícios de 3 projetos (Folhagem & Cia, Clínica Movimento e Metalúrgica Mezzalira) e sem IA.

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

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · deploy na Vercel.

## Estrutura

```
app/                    rotas (uma pasta por tela)
components/wireframe/   peças visuais do wireframe
data/*.json             dados fictícios gerados (projetos, commits, análises)
data/index.ts           leitura dos JSONs no formato usado pelas telas
data/commits.ts         commits e perguntas do legado derivadas deles (só no servidor)
scripts/                cenários e gerador dos dados (npm run dados)
components/risco.tsx    selos e alertas de risco (somem quando o legado é registrado)
components/painel.tsx   painel e página de etapa (IC, matriz, membros)
lib/indice.ts           leitura do Índice de Conhecimento e do risco
lib/legados.ts          registro de legados no localStorage
DEV_LOG.md              como a IA foi usada em cada etapa
```
