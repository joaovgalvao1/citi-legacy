# CITi Legacy

> Todo projeto deixa um legado. Quem chega não começa do zero.

Protótipo para o desafio **Inovação no PS** do CITi. O CITi Legacy é um **visualizador interno de todos os projetos da empresa**, em andamento e concluídos.

- **Projetos em andamento:** acompanhamento de progresso, prazo e atividade, e alertas de etapa atrasada, etapa parada e saída próxima de quem detém o conhecimento.
- **Projetos concluídos:** o legado da empresa, isto é, o que foi feito, quando, por quem e quem procurar hoje.

Tudo é calculado a partir dos commits.

## Estado atual

**Etapa 2: média fidelidade.** As telas têm gráficos reais e interações. A interface ainda está em tons de cinza; a identidade visual do CITi e o resumo gerado por IA entram na etapa 3.

| Tela | Rota |
|---|---|
| Início | `/` |
| Projetos (filtros e busca) | `/projetos` |
| Painel do projeto | `/projetos/[projetoId]` |
| Etapa do projeto | `/projetos/[projetoId]/etapas/[etapaId]` |
| Membros | `/membros` |
| Página do membro | `/membros/[membroId]` |

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000. Para gerar os dados de novo: `npm run dados`.

## Dados

São gerados por `npm run dados` a partir de `scripts/cenarios.mjs`. A data de referência ("hoje") é 17/11/2026.

| Projeto | Status | Origem |
|---|---|---|
| Folhagem & Cia | Em andamento | contexto do treinamento |
| Clínica Movimento (BV/CF) | Em andamento | contexto do treinamento |
| Metalúrgica Mezzalira | Em andamento | contexto do treinamento |
| Plataforma de Voluntariado | Atrasado | inventado |
| Neoenergia · GALT | Concluído | **case real do CITi** |
| Riachuelo · plataforma omnichannel | Concluído | **case real do CITi** |

Nos cases reais, o contexto e os resultados vêm do material do CITi. **Pessoas, commits, prazos e progresso das etapas são fictícios em todos os projetos**: 20 pessoas e 808 commits. Algumas pessoas participam de mais de um projeto, e três já saíram da empresa.

### Status

- **Etapa:**
  - **concluída** quando chega a 100%;
  - **atrasada** quando passa do fim previsto sem chegar a 100%;
  - **não iniciada** antes do início previsto, com 0%;
  - **em andamento** no resto;
  - além disso, ela fica **parada** quando passa 14 dias ou mais sem commits sem estar concluída.
- **Projeto:** **concluído** (entregue), **atrasado** (passou do fim previsto) ou **em andamento**.
- **Progresso do projeto:** a média do progresso das etapas. O progresso de cada etapa é informado pelo gerente do projeto.

### Índice de Conhecimento (IC)

Um único número por membro e etapa, em %, que diz quanto do conhecimento da etapa está com cada pessoa. Em cada etapa, a soma dos IC é 100%. O IC é a média ponderada da fatia do membro em quatro sinais tirados dos commits:

| Sinal | Peso | O que mede |
|---|---|---|
| Linhas efetivas | 50% | Linhas adicionadas que continuam no código hoje |
| Commits | 20% | Frequência de envolvimento |
| Linhas brutas | 15% | Volume de alterações (adicionadas + removidas) |
| Linhas efetivas recentes | 15% | Linhas efetivas com meia-vida de 45 dias: conhecimento esfria |

**Concentração (HHI)** é a soma dos (IC/100)² da etapa. Uma concentração de 100% significa que uma pessoa sabe tudo.

### Risco, urgência e alertas

| | Alto(a) | Moderado(a) | Baixo(a) |
|---|---|---|---|
| **Risco**, pela concentração do IC | ≥ 70% | ≥ 45% | < 45% |
| **Urgência**, pela saída de quem tem o maior IC | sai em até 21 dias | sai em até 60 dias | sai depois disso ou **não tem data de saída** |

**Alertas em projetos não concluídos:**
- saída próxima de quem detém o conhecimento (urgência alta ou moderada);
- etapa atrasada;
- etapa parada.

**Em projetos concluídos**, há só um aviso informativo: quando quem mais sabe de uma etapa já saiu da empresa, a página da etapa indica a próxima pessoa a procurar.

## Funcionalidades

- **Projetos:** filtros (todos, em andamento, atrasados, concluídos) e busca por nome ou cliente. Cada card mostra progresso, prazo e o alerta principal.
- **Painel do projeto:**
  - andamento (progresso, prazo, etapas por status);
  - cronograma (previsto × progresso × período real de commits, com a linha de hoje);
  - conhecimento e risco por etapa;
  - matriz membro × etapa;
  - atividade semanal;
  - equipe;
  - contexto e resultados (nos cases reais).
- **Destaque de membro:** clicar num membro destaca a contribuição dele em todos os gráficos da página.
- **Página da etapa:**
  - andamento e prazo;
  - quem detém o conhecimento, com risco e urgência (nos concluídos, "quem procurar");
  - atividade;
  - "Como o IC foi calculado".
- **Página do membro:** projetos de que participou (papel, IC, período, etapas), atividade mensal por projeto e últimos commits.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · deploy na Vercel. Os gráficos são componentes próprios (SVG/CSS), sem biblioteca.

## Estrutura

```
app/                       rotas (uma pasta por tela)
components/ui/             peças de interface (Caixa, Selo, Alerta, botões, barra de progresso)
components/graficos/       barras de IC, linha do tempo, cronograma, cores, destaque
components/painel/         painel, página da etapa, matriz e cálculo do IC
components/projetos/       lista de projetos com filtros e busca
components/membro/         atividade do membro
components/risco/          selos de status, risco e urgência e lista de alertas
data/*.json                dados gerados (projetos e pessoas, commits, análises, data de referência)
data/index.ts              leitura dos JSONs no formato usado pelas telas
data/commits.ts            consultas aos commits (só no servidor)
lib/indice.ts              IC, risco e urgência
lib/status.ts              status de etapas e projetos, progresso, prazo e alertas
scripts/                   cenários e gerador dos dados (npm run dados)
DEV_LOG.md                 como a IA foi usada em cada etapa
```
