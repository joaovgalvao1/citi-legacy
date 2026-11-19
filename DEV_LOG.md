# DEV_LOG: uso de IA no CITi Legacy

Registro resumido de como a IA foi usada em cada etapa: **o que eu pedi**, **o que a IA fez** e **o que eu decidi**.

- **Ideação (16 e 17/11/2026):** feita numa conversa à parte com IA, antes do desenvolvimento.
- **Desenvolvimento (17 a 19/11/2026):** com o **Claude Code** (modelo Claude Opus 5.5).

**Regra do trabalho**, definida no primeiro prompt: *"Quem conduz sou eu. Você propõe, eu decido. Antes de escrever código, me mostre o plano da etapa e espere meu ok."* Cada etapa terminou com um commit.

> A versão detalhada deste registro (cada pedido e cada ajuste, cerca de 1.800 linhas) está no histórico do git, no commit `236b089`. A visão geral do uso de IA está em [`DOCUMENTACAO.md`](DOCUMENTACAO.md#5-uso-de-ia).

---

## 16 e 17/11: ideação (em outra conversa com IA)

### Ponto de partida
- Enviei o PDF do desafio (escopo livre; entrega de produto, pitch e documentação até 19/11, 23:59) e pedi ajuda com a ideação.
- O problema não estava definido no começo. Primeiro citei "melhorar o contato com os clientes"; depois **trouxe a minha própria ideia**: acompanhar os commits dos projetos e as trocas de membros.

### O que eu pedi, em ordem
1. Um processo de ideação a partir do PDF.
2. Um processo de pesquisa para achar um problema real.
3. Organizar a minha ideia de análise de commits.
4. Simplificar para um protótipo com repositórios fictícios.
5. Um nome "CITi …".
6. A explicação da métrica (linhas efetivas × brutas).
7. Uma IA gratuita para o produto e como gerar a chave do Gemini.
8. A identidade visual baseada no site do CITi e o fluxo de telas.
9. O prompt inicial para o Claude Code, comigo conduzindo e evoluindo de baixa para alta fidelidade.

### O que a IA propôs
- Os critérios da banca, tirados do PDF, e ideias iniciais (Memória Viva, Call→Proposta, Radar ICP, PS Copilot), que acabaram substituídas pela minha.
- Hipóteses de problema, dados publicados sobre perda de conhecimento em empresas juniores e um roteiro de entrevistas.
- **Sobre a minha ideia:**
  - o alerta de "conhecimento concentrado" (o risco de o projeto depender de uma pessoa só);
  - tratar o produto como memória, e não como vigilância;
  - uma narrativa de demonstração em 5 atos.
- Nomes (Rastro, Bastão, Legado, Elo, Memória), com o alerta de que "legacy" tem um sentido técnico negativo.
- A métrica de linhas efetivas, com filtros para arquivos gerados e alterações em massa, e Next.js com Vercel.

### O que eu decidi e por quê
- **Produto (meu):** analisar os commits para mostrar a participação por etapa e apoiar a troca de membros.
- **Escopo (meu):** protótipo com repositórios e análises fictícios, porque "o protótipo inicialmente precisa ser visual e passar a mensagem".
- **Nome (meu):** CITi Legacy, no sentido positivo de legado.
- **Métrica (minha):** linhas alteradas em vez de número de commits, porque um commit pequeno pode ter muitas alterações. O refinamento em "linhas efetivas" foi sugestão da IA.
- **IA no produto:** gerada ao vivo (recomendação da IA), com o Gemini por ser gratuito. Gerei a chave.
- **Identidade visual (minha):** baseada no site do CITi. A paleta e a tipografia foram propostas pela IA a partir do site.
- **Stack:** Next.js com Vercel (sugestão da IA, mantida).

### O que ficou de fora naquele momento
- As ideias iniciais da IA, substituídas pela minha.
- Login, integração com a API do GitHub e banco de dados, para focar no visual. No desenvolvimento, com o andamento do protótipo **mudei de ideia**: os três entraram no produto.
- A API do Claude, por não ser gratuita.

### Resultado
O **prompt inicial de 17/11** reuniu tudo isso:
- o problema, a solução e a tagline;
- as telas da demonstração;
- as decisões de stack, IA e identidade visual;
- o que ficaria fora do escopo;
- três etapas de fidelidade, com a minha aprovação a cada uma;
- as regras de trabalho: este DEV_LOG, um commit por etapa e a interface em português.

---

## 17/11: do planejamento à média fidelidade

### Planejamento e wireframe
- **Pedi:** um plano a partir do meu prompt inicial e do PDF do desafio, com rotas, telas e stack, ainda sem código.
- **A IA fez:** o plano e um alerta de prazo (produto, pitch e documentação). Depois, o wireframe navegável em Next.js 16.
- **Problema:** o Next 16 acusou acesso a `params` fora de `<Suspense>`. A IA consultou a documentação da versão instalada e corrigiu.
- **Decidi:** pedi uma página inicial antes dos projetos e uma página por etapa, e que a métrica escolhida controlasse a lista de membros.

### Dados fictícios
- **Pedi:** gerar os dados primeiro, em tabelas, para eu revisar antes de levar ao app. Três projetos com os contextos do meu treinamento (Folhagem & Cia, Clínica Movimento, Metalúrgica Mezzalira), depois mais um inventado e dois cases reais do CITi.
- **A IA fez:** um gerador de commits fictícios com cenários. Os arquivos alterados em cada commit ligam o commit às etapas.

### Índice de Conhecimento (IC)
- **Pedi:** um algoritmo que juntasse todas as métricas num valor só.
- **A IA fez:** propôs o IC (média ponderada de linhas efetivas, commits, linhas brutas e linhas recentes) e simulou nos dados antes de implementar.

### Mudança de rota
- **Decidi:** perguntei como treinar um modelo para fazer perguntas melhores. A IA explicou que bastaria dar contexto no prompt. A partir daí **mudei o produto**: de passagem de conhecimento por perguntas e "legados" para **acompanhamento de projetos**. Mantive o nome Legacy para o histórico dos projetos.
- **A IA fez:** o plano da nova direção e a implementação. Antes, fez um commit de checkpoint, para dar para voltar.

### Simplificação e regras do produto
- **Pedi:** menos informação nas telas e uma navegação simples. Analisamos tela por tela, e a IA mostrou exemplos quando pedi.
- **Decidi:**
  - etapas ligadas a caminhos do repositório;
  - progresso pelas **tasks** de cada etapa;
  - escopo dentro das etapas;
  - etapa "em planejamento" antes de começar;
  - Atividade e Conhecimento numa aba só.

---

## 18/11: alta fidelidade, IA ao vivo e deploy

### Identidade visual e página de entrada
- **Pedi:** a identidade do CITi (logo e fundo do site citi.org.br) e uma página de entrada antes do login, com os nomes ocultos na prévia, como o saldo num app de banco.
- **A IA fez:** fundo escuro, verde `#00DB58`, âmbar e as fontes Inter Tight e IBM Plex Mono. Depois analisou o citi.org.br e mostrou uma prévia de cada recomendação antes de aplicar.

### Resumo do projeto com IA
- **Pedi:** o resumo gerado por IA. Coloquei a chave do Gemini e perguntei qual modelo usar. Pedi também para conferir se a chave tinha ido para algum commit e, depois, para gastar só um teste com ela.
- **A IA fez:**
  - resumo semanal em 3 seções (o que andou, o que travou, o que fazer primeiro);
  - **memória** das semanas anteriores;
  - resumo final dos concluídos;
  - resumo automático por regras quando não há IA, com a indicação na tela.
- **Decidi:** o banco é a única fonte dos dados (Postgres no computador e **Neon** na Vercel) e a data é a real.

### Deploy e funcionalidades de gestão
- **A IA fez:**
  - deploy na **Vercel** com Neon e cron semanal protegido;
  - cadastro de projetos pelo admin;
  - **boletim da semana** em PDF;
  - envio do boletim por e-mail (Resend);
  - tema claro e escuro no PDF e no e-mail.
- **Problemas que encontrei ao testar:**
  - marcar todas as tasks não concluía o projeto. A IA ligou a conclusão às tasks;
  - o link do e-mail levava a um 404, porque os commits não tinham sido enviados;
  - depois do login, o link não voltava para a página pedida. A IA corrigiu as duas coisas.
- **Decidi:** os e-mails só saem para destinatários definidos no servidor.

### Previsão de entrega e semáforo
- **A IA fez:**
  - previsão pelo ritmo de tasks das últimas 4 semanas, com o **gargalo principal**;
  - semáforo vermelho, âmbar e verde;
  - Gantt com a previsão na Visão geral.
- **Minhas hipóteses que guiaram as correções:**
  - **Mezzalira:** os dados estavam estranhos, com o projeto muito atrasado e nada vermelho. Lembrei que a Infra/Deploy tinha um ritmo diferente e **propus usar a média do projeto como ritmo dela**. A IA testou três opções (4 projetos × 3 datas), e a minha proposta foi a que resolveu sem esconder informação.
  - **Datas do painel:** desconfiei que não batiam com o resto. A IA achou três inconsistências e unificou a semana do painel, do boletim e do resumo.

### Tasks, edição e lixeira
- **Decidi:**
  - confirmação e "Desfazer" ao marcar tasks;
  - edição de projetos;
  - lixeira de 30 dias;
  - apagar um projeto exige digitar o nome do cliente **nas duas etapas**, por ser uma ação grave.

---

## 19/11: reunião, membros, GitHub, visual e entrega

### Modo reunião
- **Pedi:** transformar os dados numa apresentação para a reunião semanal da diretoria, com exportação em PDF e convite.
- **A IA fez:**
  - slides 16:9 que se montam sozinhos: capa, panorama, um por projeto e prioridades;
  - PDF com um slide por página;
  - a janela "Marcar reunião", que envia o convite por e-mail com o link do Google Agenda.
- **Problemas:**
  - o Firefox usou A4 no lugar do 16:9;
  - o texto da IA pixelava no PDF.
  - A IA analisou os PDFs que mandei e corrigiu.

### Membros
- **Decidi:**
  - foto do GitHub no avatar;
  - contatos (e-mail, LinkedIn e GitHub);
  - edição;
  - lixeira com confirmação simples;
  - membro com commits **não pode ser apagado**, só virar ex-membro.
- **A ideia foi minha:** uma visualização em círculo com os membros girando em volta. A IA desenhou protótipos interativos no chat, e daí vieram a **Órbita de membros** (com filtro por projeto e modo Cards) e a **Órbita de colaboração** no perfil.

### GitHub funcional
- **Pedi:** primeiro só a parte visual do vínculo com o repositório. Depois **decidi que fosse funcional**.
- **A IA fez:** me orientou nas opções gratuitas e implementou:
  - token somente leitura;
  - webhook com assinatura HMAC conferida;
  - botão Sincronizar e sincronização no cron;
  - autor ligado ao membro pelo usuário do GitHub.
- **Resultado:** o próprio repositório do CITi Legacy ficou vinculado no site publicado.

### IA dentro dos limites
- **Minha hipótese:** gerar todos os resumos de uma vez sobrecarregaria a API.
- **A IA fez:** confirmou e implementou:
  - 1 pedido a cada 4,5 s;
  - novas tentativas;
  - prazo dentro dos 60 s da função;
  - cron em duas etapas.
- **Minha hipótese:** os resumos do site estavam desatualizados porque o script só rodava na sexta. A IA confirmou e copiou os resumos já prontos, sem gastar a cota.
- **Decidi:** os resumos e o boletim passam para o **domingo**, para a reunião acontecer na segunda. A IA revisou as datas e corrigiu um erro escondido: domingo à noite em Recife já é segunda em UTC, e o resumo seria gravado na semana errada.

### Página inicial e visual
- **Decidi o rumo dos textos:** recusei uma frase de dor que eu não podia comprovar e escolhi falar do que o produto faz: acompanhamento semanal, prazos, escopo e reunião.
- **Visual:**
  - pedi algo que chamasse atenção e várias vezes algo "que fuja do óbvio";
  - a IA mostrou as opções antes de aplicar;
  - escolhi o fundo de **órbitas com constelações**, a **constelação de commits** na tela de projetos e a limpeza dos cards (indicadores com mini gráficos, destaque "Precisa de você agora" com o resumo da IA, anel e pulso de commits);
  - fiz ajustes finos por prints anotados.
- **Desempenho:** relatei que a página travava. A IA mediu e refez as animações (camadas que a placa de vídeo move, só animando o que está na tela).

### Celular, iPad e PDFs
- **Testei no iPad:**
  - a órbita não girava;
  - os PDFs saíam ruins.
- **Giro da órbita:** a primeira correção falhou no aparelho de verdade. A segunda usou os eventos de toque nativos do iOS e funcionou.
- **Minha hipótese:** o PDF do iPad saía ruim porque o Safari o gera pela impressão.
  - **A IA fez:** confirmou e propôs gerar o PDF **no servidor**, com um Chromium sem tela.
  - **Decidi** usar o mesmo modelo no computador, porque o Firefox também falhava.
  - **Ajustes no PDF:** fundo até o fim da página e projetos em sequência no boletim, sem vãos.
- **Ícone e app no celular:** ícone feito a partir do logo do CITi em vetor, com "LEGACY", e o app instalável (PWA).

### Entrega
- **A IA fez:**
  - a [`DOCUMENTACAO.md`](DOCUMENTACAO.md) a partir deste registro;
  - a revisão da seção de uso de IA para refletir as hipóteses e decisões que foram minhas;
  - a remoção do Groq do código, porque nunca foi configurado;
  - este resumo do DEV_LOG.

---

## Como a IA foi verificada

- **A cada mudança:**
  - verificação de tipos e lint;
  - testes no navegador em computador, tablet e celular;
  - simulações (toque, impressão do Safari, PDFs conferidos página a página);
  - build de produção antes de mudanças que afetam a Vercel.
- **Testes finais nos aparelhos reais** (iPad, PDFs, e-mail, webhook): feitos por mim.
- **Ações sensíveis ficaram comigo:** chaves e segredos, `git push` e comandos no banco hospedado.
