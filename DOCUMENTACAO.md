# CITi Legacy: documentação

> Todos os projetos do CITi, **acompanhados semana a semana.**

Protótipo para o desafio **Inovação no PS** do CITi.

- **No ar:** https://citi-legacy.vercel.app
- **Login de demonstração:** `admin` / `admin`
- **Código:** este repositório
- **Registro completo do uso de IA:** [`DEV_LOG.md`](DEV_LOG.md)

---

## 1. O produto

### O que é

O CITi Legacy acompanha todos os projetos da empresa num só lugar, **a partir do código**. A equipe trabalha normalmente no GitHub, e a plataforma transforma os commits e as tasks em:

- andamento de cada etapa;
- previsão de entrega;
- quem conhece cada parte;
- um resumo da semana escrito por IA.

Todo domingo à noite, a diretoria recebe a semana pronta: o boletim por e-mail e os slides da reunião de segunda.

### O que resolve

Acompanhar vários projetos ao mesmo tempo (prazos, escopo, quem faz o quê) exige atenção toda semana. Sem uma ferramenta, isso vira planilhas, cobranças de status no grupo e reuniões que gastam tempo só para saber "como está cada projeto". O CITi Legacy faz esse acompanhamento sozinho e deixa a reunião livre para decidir.

Numa empresa júnior, as equipes também mudam a cada semestre. Por isso o histórico de cada projeto (o que foi feito, quando e por quem) continua registrado para quem chega depois. É daí que vem o nome **Legacy**.

### Para quem

- **Diretoria:**
  - visão de todos os projetos;
  - o que precisa de atenção;
  - a pauta da reunião semanal;
  - boletim e PDFs.
- **Gerentes e membros:** o andamento do próprio projeto, as tasks e quem conhece cada etapa.
- **Quem chega:** o histórico dos projetos e a quem perguntar.

---

## 2. Funcionalidades

### Página inicial (pública)

- Apresenta o produto com uma vitrine animada:
  - card de projeto com semáforo;
  - pulso de commits e previsão;
  - resumo da IA;
  - mini linha do tempo.
- **Números reais e agregados:** projetos em andamento e entregues, pessoas, commits analisados e resumos escritos pela IA. Nomes de projetos, clientes e pessoas **não aparecem**: ficam atrás do login.
- **Grade de recursos e "Como funciona":** fundo de órbitas e constelações (leve, sem pesar no celular).

### Projetos (`/projetos`)

- **Indicadores da semana:**
  - projetos em andamento, com a proporção por situação;
  - atrasados, com o nome do projeto;
  - tasks entregues por dia;
  - ritmo de commits.
- **"Precisa de você agora":** o projeto atrasado mais grave aparece em destaque, com o resumo da IA ao lado ("O que travou" e "Fazer primeiro").
- **Cards, agrupados em "Precisam de atenção" e "No prazo":**
  - monograma do cliente na cor da situação;
  - anel de progresso;
  - pulso de commits das últimas 2 semanas;
  - entrega prevista e gargalo principal;
  - equipe com foto do GitHub. Clicar na foto abre o perfil do membro.
- **Ações:**
  - busca;
  - abas Em andamento e Concluídos;
  - lixeira (30 dias);
  - "▶ Apresentar" (modo reunião);
  - "Boletim da semana (PDF)";
  - "+ Novo projeto".
- **Fundo:** uma **constelação de commits**, em que cada commit da semana é uma estrela, ligada às do mesmo projeto, na cor da situação.

### Projeto (`/projetos/[id]`)

- **Visão geral:**
  - Gantt com a previsão de cada etapa (tracejado quando passa do prazo);
  - tasks marcáveis, com confirmação e "Desfazer";
  - etapas com escopo, status, prazo e quem mais sabe;
  - resumo semanal da IA, com histórico das semanas anteriores.
- **Sobre:** cliente, objetivo, contexto, período, equipe e resultados.
- **Participação:** Índice de Conhecimento (IC) por membro e commits por semana, no projeto todo ou por etapa.
- **Repositório do GitHub:** vínculo, botão "Sincronizar" e data da última sincronização.
- **Edição e lixeira:** apagar exige digitar o nome do cliente duas vezes, porque é uma ação grave.

### Semáforo e previsão de entrega

- **Cores:**
  - **Vermelho:** projeto atrasado.
  - **Âmbar:** atenção, isto é, etapa parada ou previsão que passa do prazo.
  - **Verde:** no prazo.
- **Previsão:** usa o ritmo de tasks concluídas nas últimas 4 semanas (considerando a idade da etapa) e aponta o **gargalo principal**, a etapa que empurra a entrega.
- **Etapas contínuas** (como Infra/Deploy, que duram o projeto todo): usam o ritmo médio das outras etapas, para não distorcer a previsão.

### Resumo semanal com IA

Todo domingo, a IA lê a semana de cada projeto (commits, tasks, prazos, alertas e os resumos anteriores) e escreve três seções:

- **O que andou**
- **O que travou**
- **O que fazer primeiro**

O resumo tem **memória**: não repete o que já foi dito nas semanas anteriores. Projetos concluídos ganham um **resumo final** (o que foi entregue, como foi o projeto, quem procurar).

### Modo reunião (`/reuniao`)

- **Slides 16:9 que se montam sozinhos:**
  - capa com os números;
  - panorama;
  - um slide por projeto, com o Gantt compacto e o resumo da IA;
  - prioridades da semana.
- **Controles:** teclado (← →, F para tela cheia, P para PDF) e **exportação em PDF**.
- **"Marcar reunião":** escolhe data, hora, duração, local e destinatários, e envia o convite por e-mail com a pauta e o link "Adicionar ao Google Agenda".

### Boletim da semana

- **PDF da empresa e PDF por projeto,** em tema escuro ou claro.
- **E-mail automático** todo domingo (Resend), no mesmo tema, com link para o PDF. Só sai para os destinatários configurados no servidor.

### PDFs iguais em qualquer aparelho

O PDF é gerado **no servidor**: um Chromium sem tela abre a própria página de exportação e gera o arquivo. O resultado é igual no computador, no iPad e no celular:

- slides em 16:9, um por página;
- folhas A4 com o fundo até a borda;
- sem as margens brancas da impressão do Safari.

### Membros (`/membros`)

- **Modo Órbita:** os membros giram em volta de um círculo, e quem está no topo aparece em destaque no centro (cargo, desde quando está no CITi, projetos, maior IC).
  - **Para girar:** arrastar, roda do mouse, setas, ou deslizar o dedo para os lados no celular e no iPad.
- **Modo Cards:** a lista em cards.
- **Filtros:** por projeto (mostra o papel e o IC naquele projeto), abas Na empresa e Já saíram, e busca.
- **Perfil:**
  - foto do GitHub;
  - contatos (e-mail, LinkedIn e GitHub);
  - calendário de contribuições;
  - etapas em que a pessoa é referência;
  - projetos.
- **Órbita de colaboração:** os colegas ficam mais perto quanto mais trabalharam nas mesmas etapas. Clicar num colega abre a órbita dele.
- **Edição, ex-membros e lixeira:** quem tem commits não pode ser apagado, só marcado como ex-membro.

### GitHub integrado

- **Vínculo:** o repositório é vinculado ao projeto. Cada etapa diz quais pastas do código ela cobre, por exemplo `estoque/**`.
- **Sincronização:**
  - cada **push** chega na hora pelo **webhook** (com assinatura HMAC conferida);
  - o botão "Sincronizar" e o cron de domingo garantem que nada fique de fora.
- **Commits:** o autor é ligado ao membro pelo usuário do GitHub cadastrado no perfil. Cada commit conta nas etapas dos arquivos que alterou.
- **Funcionando de verdade:** o próprio repositório do CITi Legacy está vinculado ao projeto "CITi Legacy" no site publicado.

### App no celular (PWA)

O site pode ser **instalado** no celular e no iPad:

- ícone na tela de início, com o logo do CITi e "LEGACY";
- abre em tela cheia;
- atalhos para Projetos, Membros e Modo reunião;
- página de "sem conexão".

---

## 3. Como funciona por dentro

### Do código ao painel

```
git push ──► webhook (/api/github/webhook) ──► commits gravados por etapa (caminhos do código)
                                                    │
tasks marcadas no app ─────────────────────────────►├──► progresso, status, alertas, previsão
                                                    ├──► Índice de Conhecimento (IC)
                                                    └──► pulso e constelação de commits
domingo 23h (cron) ──► resumo da IA por projeto ──► boletim por e-mail ──► reunião de segunda
```

### Regras principais

- **Progresso da etapa:** a fração de tasks concluídas. O progresso do projeto é a média das etapas.
- **Status da etapa:**
  - concluída;
  - atrasada (passou do fim previsto);
  - em planejamento;
  - em andamento;
  - parada (14 dias ou mais sem commits).
- **Índice de Conhecimento (IC):** quanto do conhecimento de uma etapa está com cada pessoa, somando 100% por etapa. É a média ponderada de quatro sinais dos commits:

  | Sinal | Peso | O que mede |
  |---|---|---|
  | Linhas efetivas | 50% | o que continua no código |
  | Commits | 20% | frequência |
  | Linhas brutas | 15% | volume |
  | Linhas efetivas recentes | 15% | meia-vida de 45 dias: o conhecimento esfria |

- **Previsão de entrega:** tasks que faltam ÷ ritmo recente da etapa. A maior data entre as etapas abertas é a previsão do projeto, e a etapa dessa data é o gargalo principal.
- **Semana do painel:** o painel, o boletim e a reunião usam a semana mais recente com resumo, para contarem a mesma história.

### Rotina semanal (Vercel Cron, horário de Brasília)

- **Domingo 23h00:**
  - sincroniza os repositórios do GitHub;
  - limpa as lixeiras;
  - gera os resumos que couberem no tempo.
- **Domingo 23h30:** gera os resumos pendentes e **envia o boletim**.
- **Limites do plano gratuito da IA:** no máximo 1 pedido a cada 4,5 s, novas tentativas depois de 10 s e 25 s, e prazo dentro dos 60 s da função. Projeto que já tem resumo é pulado, então repetir o cron não gasta pedidos.

---

## 4. Tecnologia

| Camada | Escolha |
|---|---|
| Aplicação | **Next.js 16** (App Router, Server Components, Server Actions, Cache Components), **TypeScript**, **Tailwind CSS 4** |
| Banco | **Postgres**: Docker no computador, **Neon** em produção. ORM **Drizzle** |
| IA do produto | **Google Gemini** (com uma lista de modelos tentados em ordem) e resumo automático por regras quando a IA não está disponível |
| E-mail | **Resend** (API HTTP) |
| GitHub | API REST com token *fine-grained* somente leitura e webhook com assinatura HMAC SHA-256 |
| PDF | Chromium sem tela no servidor (`puppeteer-core` com `@sparticuz/chromium`) |
| Hospedagem | **Vercel** (funções, Cron e deploy a cada push) |
| Gráficos e visuais | componentes próprios em SVG/CSS, sem biblioteca de gráficos |
| Identidade | logo do CITi em vetor, verde `#00DB58`, âmbar `#FFA630`, vermelho `#FF3B3B`, Inter Tight e IBM Plex Mono |

### Cuidados

- **Dados protegidos:** a página inicial só mostra números agregados. Os nomes ficam atrás do login.
- **Segredos:** chaves só em variáveis de ambiente (veja [`.env.example`](.env.example)), nunca no código. Os e-mails só saem para destinatários definidos no servidor.
- **Desempenho:**
  - as animações de fundo giram em camadas que a placa de vídeo move sem redesenhar;
  - só animam quando estão na tela;
  - ficam paradas no celular e com "reduzir movimento".
- **Acessibilidade:** navegação por teclado na órbita e na reunião, rótulos para leitores de tela e respeito a "reduzir movimento".
- **Cache:** as consultas usam cache com etiquetas (`dados`, `resumos`), renovado quando algo muda (task, sincronização, cron).

### Rodando localmente

```bash
docker compose up -d          # Postgres local
cp .env.example .env.local    # preencha as chaves que quiser usar
npm install
npm run banco:preparar        # cria as tabelas e carrega os dados fictícios
npm run dev                   # http://localhost:3000
```

Outros comandos:

- `npm run banco:sincronizar -- [projetoId]`: traz commits do GitHub.
- `npm run banco:resumos`: gera os resumos.

### Dados do protótipo

- **Projetos:**
  - quatro em andamento com dados fictícios: Folhagem & Cia, Clínica Movimento, Metalúrgica Mezzalira e Plataforma de Voluntariado;
  - dois concluídos baseados em **cases reais do CITi** (Neoenergia · GALT e Riachuelo);
  - o **próprio CITi Legacy**, com commits reais do GitHub.
- **O que é fictício:** pessoas, commits, prazos e tasks, exceto no CITi Legacy.

---

## 5. Uso de IA

A IA foi usada de **duas formas**: dentro do produto e no desenvolvimento.

### 5.1 IA dentro do produto

- **O que faz:** o resumo semanal e o resumo final de cada projeto são escritos pelo **Google Gemini** (o app tenta uma lista de modelos em ordem, começando pelo de maior cota gratuita).
- **O que recebe:** o contexto da semana (commits, etapas, tasks, prazos, alertas) e os **resumos das semanas anteriores**, com a instrução de não repetir o que já foi dito.
- **O que devolve:** sempre três seções fixas, para caber no painel, no PDF, no e-mail e nos slides.
- **Quando a IA não está disponível** (sem chave, cota esgotada ou sobrecarga): o resumo sai por regras, e o app mostra claramente que não é IA (a assinatura roxo e verde só aparece em texto gerado pela IA).
- **Limites respeitados:** ritmo de pedidos, novas tentativas e prazo da função (seção 3).

### 5.2 IA no desenvolvimento

**Ideação (16 e 17/11), numa conversa à parte com IA:**
- **O desafio:** levei o PDF do desafio e pedi um processo de ideação. A IA trouxe critérios da banca, ideias iniciais e um roteiro de pesquisa.
- **A ideia:** a ideia do produto foi minha (acompanhar os commits dos projetos e as trocas de membros), assim como a métrica por linhas alteradas, o protótipo com repositórios fictícios, o nome CITi Legacy e a identidade baseada no site do CITi.
- **O papel da IA:** organizar a ideia, sugerir o refinamento em "linhas efetivas", nomes e stack, e escrever comigo o prompt inicial do desenvolvimento.

**Desenvolvimento (17 a 19/11):** feito com o **Claude Code** (modelo Claude Opus 5.5) como par de programação. Cada pedido, o que a IA fez e o que eu ajustei estão registrados em ordem no [`DEV_LOG.md`](DEV_LOG.md).

**Vídeo do pitch:** o roteiro foi construído trecho a trecho com o Claude Code, com as minhas decisões em cada cena, e as gravações de tela são minhas. A narração usa **voz sintética (ElevenLabs)**; o texto da narração foi discutido comigo e aprovado por mim.

**A regra do trabalho**, definida no primeiro prompt: *"Quem conduz sou eu. Você propõe, eu decido. Antes de escrever código, me mostre o plano da etapa e espere meu ok."*

Na prática, o trabalho alternou entre três modos.

#### 1. Eu levantei a hipótese, a IA verificou e implementou

Em boa parte dos problemas, o ponto de partida foi algo que eu notei usando o protótipo ou uma suspeita minha sobre a causa. Nesses casos, o papel da IA foi conferir nos dados e no código, confirmar ou ajustar a hipótese e implementar.

| O que eu percebi ou supus | O que a IA fez com isso |
|---|---|
| **Os dados da Mezzalira estavam estranhos:** o projeto aparecia muito atrasado na previsão, mas nenhuma etapa estava vermelha. Lembrei que a Infra/Deploy tinha um ritmo diferente das outras etapas e **propus usar a média do projeto como ritmo dela**. | Discutimos a ideia, e eu deleguei a escolha final com testes. A IA comparou três opções em 4 projetos × 3 datas, e a minha proposta (ritmo médio das outras etapas) foi a que resolveu sem esconder informação. |
| **As datas do painel não batiam com o resto:** perguntei se o período mostrado correspondia aos dados do painel e do boletim. | A IA achou três inconsistências: o rótulo de 8 dias, duas semanas diferentes na tela e dados que acabavam antes da entrega. Unificou a semana em todo o app. |
| **Gerar todos os resumos de uma vez deveria sobrecarregar a API.** Pedi um limite de pedidos de acordo com os limites da API. | A IA confirmou o risco (falhas 503 e 429 e o limite de 60 s da função) e implementou o ritmo de pedidos, as novas tentativas e o cron em duas etapas. |
| **Os resumos do site deviam estar desatualizados, porque o script só rodava na sexta.** | A IA confirmou: no banco do site, 4 dos 5 projetos estavam com a semana anterior. Copiou os resumos já gerados, sem gastar a cota da IA. |
| **A reunião na segunda não fechava com o resumo saindo na sexta.** | Pedi a mudança para domingo. A IA revisou todas as datas do código e encontrou um erro escondido: o cron de domingo à noite em Recife já é segunda em UTC e gravaria o resumo na semana errada. |
| **O PDF do iPad era ruim porque o Safari gera o PDF pela impressão.** | A IA confirmou a causa e propôs gerar o PDF no servidor. Depois **eu decidi usar o mesmo modelo no computador**, porque o Firefox também tinha problemas. |
| **A página inicial travava no meu navegador** e a órbita não girava no iPad (testei nos meus aparelhos). | A IA mediu as animações e o tratamento de toque, explicou as causas e corrigiu. |

#### 2. Decisões de produto e de regra de negócio foram minhas

- **Mudança de rota (17/11):** a ideia inicial era passar o conhecimento de quem sai por meio de perguntas e "legados". Mudei o produto para **acompanhamento de projetos**, mantendo o nome Legacy para o histórico.
- **Índice de Conhecimento:** pedi um único número que juntasse as métricas de commits. A IA propôs o IC com quatro sinais e simulou antes de implementar.
- **Textos:** recusei uma frase de dor que eu não podia comprovar ("a diretoria descobre os problemas tarde demais") e escolhi falar do que o produto faz: acompanhamento, prazos, escopo e a reunião semanal.
- **Regras de segurança e de dados:**
  - apagar um projeto exige digitar o nome do cliente **nas duas etapas**, por ser uma ação grave;
  - membro com commits **não pode ser apagado**, só virar ex-membro;
  - os destinatários dos e-mails são definidos só no servidor.
- **Integração com o GitHub:** primeiro pedi só a parte visual do vínculo com o repositório. Depois decidi que ela fosse **funcional**, e a IA me orientou nas opções gratuitas: token somente leitura, webhook assinado e sincronização pelo cron.

#### 3. Nas ideias visuais, eu dei a direção e a IA desenhou as opções

- **A ideia de partida foi minha:** uma visualização em círculo com os membros girando em volta. A IA desenhou protótipos interativos no chat antes de aplicar, e daí vieram a **Órbita de membros** e a **Órbita de colaboração**.
- **Mais alternativas:** pedi várias vezes algo "que fuja do óbvio". As propostas da IA passaram por linha do tempo, mapa, anéis, sinais vitais e constelação, e eu escolhi em cada rodada.
- **Combinações:**
  - a ramificação de commits no lugar de uma órbita repetida;
  - as constelações integradas às órbitas;
  - o rodapé transparente para não cortar o pontilhado da órbita.
- **Ajustes finos por prints anotados:** o limite exato da órbita, as constelações espalhadas pela tela e o espaçamento dos PDFs.

#### O que a IA investigou por conta própria

- **Arquitetura e código:** a estrutura do app, as consultas com cache, a previsão, o PDF no servidor e o PWA.
- **Desempenho:** as animações da página inicial (20 anéis girando dentro de SVG, desfoque sobre movimento) foram refeitas para a placa de vídeo mover sem redesenhar.
- **Problemas de navegador:** o Safari ignora o formato 16:9 na impressão e não repassava os movimentos do dedo à órbita, e o Chrome avalia as regras de impressão pelo papel padrão.

#### Onde a IA errou e como foi corrigido

Tudo isso está registrado no DEV_LOG, e quase sempre fui eu que percebi ao testar.

| Erro | Correção |
|---|---|
| Um ajuste de estilo deixou os PDFs do Firefox e do Safari sem margem e cortados | margem desenhada pela própria folha e, depois, PDF no servidor |
| Uma regra para o Safari reduziu os slides também no Chrome | regra limitada ao Safari |
| Arredondamentos diferentes entre servidor e navegador geravam avisos de hidratação | posições arredondadas antes de renderizar |
| Os botões ← → da roda brigavam com o arraste | o arraste termina quando o "soltar" do mouse se perde |
| O primeiro conserto do giro no iPad não funcionou no aparelho de verdade | eventos de toque nativos do iOS, testados por mim de novo |

#### Verificação

A cada mudança:

- verificação de tipos e lint;
- testes no navegador em computador, tablet e celular;
- simulações (toque, impressão do Safari, PDFs gerados e conferidos página a página);
- build de produção antes de mudanças que afetam a Vercel.

Os testes finais nos aparelhos reais (iPad, PDFs, e-mail, webhook) foram feitos por mim.

#### Divisão do trabalho

- **Eu (humano):**
  - a visão do produto e o rumo;
  - as hipóteses sobre os problemas que apareciam nos testes;
  - as regras de negócio;
  - as escolhas visuais e os textos finais;
  - os testes reais;
  - os passos com credenciais e produção: chaves, `git push`, comandos no banco hospedado.
- **A IA:**
  - planos e alternativas (inclusive protótipos visuais);
  - o código;
  - a checagem das hipóteses nos dados;
  - a investigação técnica dos erros;
  - os testes automatizados;
  - o registro no DEV_LOG.

---

## 6. Limitações e próximos passos

- **Login:** é só de demonstração (usuário único, sessão guardada no navegador). Em produção, entraria login com a conta do CITi e permissões por papel (diretoria, gerente, membro).
- **Dados:** os projetos, exceto o CITi Legacy, usam dados fictícios. O próximo passo é vincular os repositórios reais.
- **Previsão:** é simples (ritmo das últimas 4 semanas). Poderia aprender com o histórico de projetos concluídos.
- **Integrações futuras:** notificações push no app instalado e integração com a agenda (além do link do Google Agenda).
