# CITi Legacy

> Todos os projetos do CITi, acompanhados semana a semana.

📄 **Documentação completa do produto, da tecnologia e do uso de IA: [`DOCUMENTACAO.md`](DOCUMENTACAO.md).** Registro detalhado de cada etapa com IA: [`DEV_LOG.md`](DEV_LOG.md).

Protótipo para o desafio **Inovação no PS** do CITi. O CITi Legacy é um **visualizador interno de todos os projetos da empresa**, em andamento e concluídos.

- **Projetos em andamento:** acompanhamento do progresso, do prazo e da atividade, e aviso quando uma etapa está atrasada ou parada.
- **Projetos concluídos:** o legado da empresa, isto é, o que foi feito, quando e por quem.

Tudo é calculado a partir dos commits.

**No ar:** https://citi-legacy.vercel.app (login `admin` / `admin`)

## Estado atual

**Etapa 3: alta fidelidade, em andamento.** A identidade visual do CITi já está aplicada: fundo escuro, verde `#00DB58` para ações e progresso, âmbar `#FFA630` para alertas, Inter Tight e IBM Plex Mono. O resumo gerado por IA está pronto e o protótipo está publicado na Vercel, com o banco no Neon.

| Tela | Rota |
|---|---|
| Entrada do site (pública) | `/` |
| Login | `/login` |
| Projetos (abas Em andamento / Concluídos, busca) | `/projetos` |
| Novo projeto (cadastro pelo admin) | `/projetos/novo` |
| Projeto · Visão geral | `/projetos/[projetoId]` |
| Projeto · Sobre | `/projetos/[projetoId]/sobre` |
| Projeto · Participação (IC e commits por semana) | `/projetos/[projetoId]/participacao?etapa=…` |
| Membros (abas Na empresa / Já saíram, busca) | `/membros` |
| Membro | `/membros/[membroId]` |
| Resumo do projeto para PDF | `/exportar/[projetoId]` |
| Boletim semanal da empresa para PDF | `/exportar/boletim` |

## Acesso ao protótipo

O login é de demonstração e tem um único usuário administrador, definido em [`config/acesso.ts`](config/acesso.ts):

- **Usuário:** `admin`
- **Senha:** `admin`

As credenciais ficam no código do front-end e a sessão fica no navegador, então não há segurança real. O login só serve para simular a entrada na ferramenta interna. Sem login, qualquer página leva à tela de login, que guarda o destino (`/login?voltar=...`): depois de entrar, a pessoa volta para onde queria ir, por exemplo um link do e-mail do boletim. Só destinos do próprio site são aceitos.

## Banco de dados

Os dados ficam num **Postgres**:
- **local:** um container Docker;
- **na Vercel:** o **Neon**, gratuito.

O acesso é feito com o **Drizzle**, e o esquema está em `db/esquema.ts`. As tabelas são: `clientes`, `pessoas`, `projetos`, `membros_projeto`, `etapas` (com os caminhos do repositório), `tasks`, `commits` (com os arquivos alterados e as etapas) e `resumos` (resumos da IA).

O IC, a concentração, a atividade semanal e o primeiro e último commit de cada etapa são **calculados a partir dos commits do banco** (`lib/analise.ts`), com cache do Next. Marcar uma task grava no banco e vale para todos os usuários.

```bash
docker compose up -d        # sobe o Postgres local (porta 5433)
npm run banco:preparar      # cria as tabelas e carrega os dados fictícios
npm run banco:resumos       # gera o histórico inicial de resumos da IA (precisa da GEMINI_API_KEY)
npm run banco:resumos -- --so-regras   # refaz só os que caíram no resumo automático
```

## IA: resumos do projeto

Os resumos são gerados **fora da visita** e guardados no banco. A tela só lê, sem chamar a IA.

- **Projeto em andamento: resumo semanal.**
  - Todo **domingo às 23h** (e às 23h30 para os pendentes), a **Vercel Cron** chama `/api/cron/resumos`, rota protegida por `CRON_SECRET`. Assim o boletim e os slides ficam prontos para a **reunião da diretoria na segunda**.
  - O contexto é **a semana** (commits daqueles 7 dias, mais tasks, prazos e alertas atuais) e os **resumos das semanas anteriores**, com a instrução de **não repetir** o que já foi dito.
  - A Visão geral mostra a semana mais recente e o **histórico das semanas anteriores**.
- **Projeto concluído: resumo final**, gerado **uma única vez** e mantido fixo.

Os provedores são tentados nesta ordem:
1. **Gemini**, que tenta uma lista de modelos começando pelo `gemini-3.5-flash-lite`, o de maior cota gratuita;
2. **Groq**;
3. o **resumo automático pelas regras**.

A tela sempre indica a fonte.

## Novo projeto

O botão **+ Novo projeto** (em Projetos) abre um formulário com três partes:
- **Projeto:** nome, cliente (existente ou novo, com segmento), descrição, contexto, início e fim previsto.
- **Equipe:** pessoas que estão na empresa, cada uma com o seu papel.
- **Etapas:** nome, descrição e datas previstas; os **caminhos do repositório** (sugeridos como `src/<etapa>/**` a partir do nome, editáveis); as **tasks**, uma por linha.

A validação (`lib/novo-projeto.ts`) roda no navegador, para avisar na hora, e de novo no servidor, que é a que vale. O projeto nasce em andamento e sem commits. Status, prazos, tasks, conclusão automática e resumo semanal funcionam desde o primeiro dia.

`npm run banco:carregar` recria os dados de demonstração e **apaga os projetos cadastrados pelo formulário**.

## Exportar resumo em PDF

Na Visão geral de cada projeto, o botão **Exportar PDF** abre a versão de impressão (`/exportar/[projetoId]`):
- formato A4, fundo claro, com a logo e os detalhes em verde do CITi;
- cabeçalho com status, progresso, prazo e período do projeto;
- resumo da semana em destaque, etapas com o progresso e o histórico das semanas anteriores;
- nos concluídos, o resumo final e os resultados.

Em Projetos, o botão **Boletim da semana (PDF)** abre `/exportar/boletim`, no mesmo visual:
- a semana do resumo mais recente;
- quatro números: projetos em andamento, atrasados, etapas paradas e commits na semana;
- um bloco por projeto em andamento, com status, progresso, prazo, alertas e o resumo da IA. Os atrasados vêm primeiro;
- no fim, a lista dos concluídos.

Os dados do boletim são montados em `lib/boletim.ts`, que também serve ao e-mail de domingo.

O botão **Salvar como PDF** abre a janela de impressão do navegador. O nome do arquivo sugerido é o título da página (`Resumo · <projeto> · CITi Legacy`).

## Boletim por e-mail

Todo domingo, depois de gerar os resumos, o cron envia o boletim por e-mail pelo **Resend**, chamando a API HTTP sem biblioteca (`lib/email.ts`). O e-mail tem o mesmo conteúdo do PDF, num HTML com estilos embutidos, links para cada projeto e um botão "Ver o boletim em PDF".

- **Variáveis:** `RESEND_API_KEY` e `BOLETIM_PARA` (destinatários, separados por vírgula). Sem elas, o envio é pulado e o cron só registra o motivo.
- **Sem domínio próprio:** o remetente é `onboarding@resend.dev`, que só envia para o e-mail da conta Resend. Em produção, basta verificar o domínio da empresa no Resend e definir `BOLETIM_DE` (ex.: `CITi Legacy <legacy@dominio>`) e `BOLETIM_PARA`, sem mudar o código.
- **Enviar na hora pela tela:** no boletim (`/exportar/boletim`), o botão **Enviar por e-mail**, ao lado de "Salvar como PDF", envia o mesmo e-mail para `BOLETIM_PARA` e mostra o resultado, com o destinatário parcialmente oculto. A tela não escolhe o destinatário: ele vem só da configuração do servidor.
- **Testar na hora:** `npm run boletim:enviar`.
- **Só gerar o HTML, sem enviar:** `npm run boletim:enviar -- --html boletim.html`.

## Rodando localmente

```bash
npm install
npm run dev
```

Antes, suba o banco: `docker compose up -d` e `npm run banco:preparar`, e copie `.env.example` para `.env.local`.

Abra http://localhost:3000 e entre com o usuário de demonstração. Para gerar os dados fictícios de novo e regravar no banco: `npm run banco:carregar` (os resumos da IA são mantidos).

## Dados

São gerados a partir de `scripts/cenarios.mjs` e gravados direto no banco por `npm run banco:carregar`, sem arquivos intermediários: o banco é a única fonte dos dados. O "hoje" das telas é a **data real** (fuso de Recife), então os prazos se atualizam sozinhos. Os commits fictícios vão até 16/11/2026.

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
  - Marcar a **última task** conclui o projeto: ele passa para a aba Concluídos, com entrega na data de hoje. O resumo final sai no domingo seguinte, quando o cron roda.
  - Desmarcar uma task de um projeto concluído assim **reabre** o projeto e descarta o resumo final, se já existir.
  - Os projetos históricos, que foram concluídos sem passar pelas tasks, ficam com as tasks travadas.
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
db/                        esquema do banco (Drizzle) e conexão
data/index.ts              consultas ao banco, com cache, no formato usado pelas telas
data/carregar.ts           leitura do banco e cálculo de IC/semanas por projeto
lib/analise.ts             IC, concentração e atividade semanal a partir dos commits
lib/hoje.ts                data de hoje (fuso de Recife)
lib/indice.ts              Índice de Conhecimento
lib/sessao.ts              sessão de demonstração (login/sair)
lib/resumo.ts              resumos semanais (com memória) e final; Gemini → Groq → regras
lib/tasks.ts               marcar tasks (ação do servidor + atualização otimista)
app/api/cron/resumos/      rota do cron semanal
scripts/carregar-banco.ts  gera os dados fictícios e grava no banco
scripts/gerar-resumos.ts   histórico inicial de resumos
lib/status.ts              status de etapas e projetos, progresso, prazo e alertas
scripts/                   cenários, gerador dos dados fictícios e scripts do banco
DEV_LOG.md                 como a IA foi usada em cada etapa
```
