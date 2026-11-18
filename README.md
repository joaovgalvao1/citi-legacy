# CITi Legacy

> Todo projeto deixa um legado. Quem chega não começa do zero.

Protótipo para o desafio **Inovação no PS** do CITi. O CITi Legacy é um **visualizador interno de todos os projetos da empresa**, em andamento e concluídos.

- **Projetos em andamento:** acompanhamento do progresso, do prazo e da atividade, e aviso quando uma etapa está atrasada ou parada.
- **Projetos concluídos:** o legado da empresa, isto é, o que foi feito, quando e por quem.

Tudo é calculado a partir dos commits.

## Estado atual

**Etapa 2: média fidelidade, versão simplificada.** A interface ainda está em tons de cinza; a identidade visual do CITi e o resumo gerado por IA entram na etapa 3.

| Tela | Rota |
|---|---|
| Login | `/` |
| Projetos (abas Em andamento / Concluídos, busca) | `/projetos` |
| Projeto · Visão geral | `/projetos/[projetoId]` |
| Projeto · Sobre | `/projetos/[projetoId]/sobre` |
| Projeto · Participação (IC e commits por semana) | `/projetos/[projetoId]/participacao?etapa=…` |
| Membros (abas Na empresa / Já saíram, busca) | `/membros` |
| Membro | `/membros/[membroId]` |

## Acesso ao protótipo

O login é de demonstração e tem um único usuário administrador, definido em [`config/acesso.ts`](config/acesso.ts):

- **Usuário:** `admin`
- **Senha:** `admin`

As credenciais ficam no código do front-end e a sessão fica no navegador, então não há segurança real. O login só serve para simular a entrada na ferramenta interna. Sem login, qualquer página leva de volta à tela de login.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 e entre com o usuário de demonstração. Para gerar os dados de novo: `npm run dados`.

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

Nos cases reais, o contexto e os resultados vêm do material do CITi. **Pessoas, commits, arquivos, prazos e tasks das etapas são fictícios em todos os projetos**: 20 pessoas e 808 commits. Algumas pessoas participam de mais de um projeto, e três já saíram da empresa. Os contextos dos projetos que não são cases reais foram escritos para o protótipo.

### Etapas ↔ repositório

Cada etapa tem **caminhos do repositório**, como `src/estoque/**`, `etl/**` ou `.github/**`. Cada commit tem a lista de **arquivos que alterou**. Um commit conta numa etapa quando altera algum arquivo dentro dos caminhos dela; se mexer em arquivos de duas etapas, conta nas duas. É assim que se calculam a atividade e o IC de cada etapa.

### Progresso pelas tasks

Cada etapa tem uma lista de **tasks**. O **progresso da etapa é a fração de tasks concluídas**. Na Visão geral, o admin marca e desmarca as tasks, e o progresso, o status da etapa, os alertas, o cabeçalho do projeto e o card na lista mudam na hora. As marcações ficam salvas no navegador.

### Status

- **Etapa:**
  - **concluída** quando chega a 100%;
  - **atrasada** quando passa do fim previsto sem chegar a 100%;
  - **em planejamento** antes do início previsto, com 0%;
  - **em andamento** no resto;
  - além disso, ela fica **parada** quando passa 14 dias ou mais sem commits sem estar concluída.
- **Projeto:** **concluído** (entregue), **atrasado** (passou do fim previsto) ou **em andamento**.
- **Progresso do projeto:** a média do progresso das etapas, que vem das tasks concluídas.

### Índice de Conhecimento (IC)

Um único número por membro e etapa, em %, que diz quanto do conhecimento da etapa está com cada pessoa. Em cada etapa, a soma dos IC é 100%. O IC é a média ponderada da fatia do membro em quatro sinais tirados dos commits:

| Sinal | Peso | O que mede |
|---|---|---|
| Linhas efetivas | 50% | Linhas adicionadas que continuam no código hoje |
| Commits | 20% | Frequência de envolvimento |
| Linhas brutas | 15% | Volume de alterações (adicionadas + removidas) |
| Linhas efetivas recentes | 15% | Linhas efetivas com meia-vida de 45 dias: conhecimento esfria |

### Alertas

Só em projetos não concluídos. Cada etapa atrasada ou parada gera um alerta, que aparece em "Precisa de atenção". Os cards da lista de projetos mostram só o mais importante.

## Funcionalidades

- **Login:** usuário único de demonstração e botão Sair no cabeçalho.
- **Projetos:** cards com nome, cliente, status, progresso, prazo e o alerta principal. Os concluídos mostram a entrega e o resultado.
- **Projeto, em 3 abas** (o cabeçalho, com status, progresso e prazo, aparece em todas):
  - **Visão geral:** precisa de atenção (nos concluídos, resultados), espaço do resumo por IA (etapa 3) e lista de etapas. Cada etapa mostra:
    - o escopo (o que inclui) e o status;
    - o progresso, com "x de y tasks";
    - a contagem de prazo ("faltam 17 dias", "atrasada há 18 dias", "começa em 13 dias");
    - quem mais sabe;
    - um painel que abre e fecha, com as **tasks marcáveis** e os **caminhos do repositório** da etapa.

    "Ver participação →" abre a aba Participação já filtrada na etapa, que mostra também os caminhos que contam nela.
  - **Sobre:** sobre o projeto (cliente, objetivo, contexto e período), equipe e resultados.
  - **Participação:** os dois gráficos na mesma página, com um único seletor "Projeto todo / Etapa":
    - **Conhecimento:** IC por membro, com "Como o IC foi calculado" recolhível.
    - **Atividade:** commits por semana, empilhados por membro.

    Clicar num membro destaca a pessoa nos dois gráficos.
- **Membros:** cards, com abas Na empresa / Já saíram e busca por nome.
- **Membro:** cabeçalho (desde quando está no CITi, número de projetos e de commits) e cards dos projetos com papel, período e IC no projeto.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · deploy na Vercel. Os gráficos são componentes próprios (SVG/CSS), sem biblioteca.

## Estrutura

```
app/                       rotas (uma pasta por tela)
components/ui/             peças de interface (Caixa, Selo, Alerta, botões, barra de progresso)
components/graficos/       barras de IC, linha do tempo, cálculo do IC, cores, destaque
components/projeto/        abas, seletor de etapa, conteúdo das abas, selos de status
components/projetos/       cards de projetos com abas e busca
components/membros/        cards de membros com abas e busca
components/layout/         cabeçalho e proteção das páginas
components/login/          formulário de login
config/acesso.ts           usuário e senha de demonstração
data/*.json                dados gerados (projetos e pessoas, commits, análises, data de referência)
data/index.ts              leitura dos JSONs no formato usado pelas telas
data/commits.ts            consultas aos commits (só no servidor)
lib/indice.ts              Índice de Conhecimento
lib/sessao.ts              sessão de demonstração (login/sair)
lib/status.ts              status de etapas e projetos, progresso, prazo e alertas
scripts/                   cenários e gerador dos dados (npm run dados)
DEV_LOG.md                 como a IA foi usada em cada etapa
```
