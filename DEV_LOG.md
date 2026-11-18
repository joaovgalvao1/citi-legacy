# DEV_LOG — uso de IA no CITi Legacy

Registro de como a IA (Claude Code, modelo Claude Opus 5.5) foi usada em cada etapa: o que foi pedido, o que a IA gerou e o que foi ajustado por mim. Base para a seção "Uso de IA" da documentação do desafio.

---

## Etapa 0 — Planejamento (17/11)

**O que pedi:** a partir do meu prompt inicial (produto, telas, stack, identidade visual e regras de trabalho) e do PDF do desafio, um plano da etapa 1 com estrutura de pastas, rotas e conteúdo de cada tela, ainda sem código.

**O que a IA gerou:**
- Mapa de 4 rotas aninhadas (`/`, `/projetos/[projetoId]`, `.../membros/[membroId]/legado`, `.../legado/documento`).
- Estrutura de pastas (`app/`, `components/wireframe/`, `data/`, `lib/`).
- O conteúdo de cada tela em detalhe.
- Um alerta de prazo: o edital exige produto, pitch de até 5 min e documentação. Daí a proposta de calendário (etapa 1 curta, quinta reservada para vídeo e docs).
- Três decisões em aberto: persistência do selo, setup e corte de segurança (linha do tempo).

**O que decidi/ajustei:** aprovei o plano como estava. Decisões: selo "Legado registrado" em `localStorage`, setup com `create-next-app` + `git init`, linha do tempo como primeiro corte se o prazo apertar.

---

## Etapa 1 — Baixa fidelidade (17/11)

**O que pedi:** implementar o wireframe navegável aprovado: 4 telas em cinza, textos reais, navegação funcionando, retângulos no lugar dos gráficos, sem IA.

**O que a IA gerou:**
- Projeto Next.js 16 (App Router, TypeScript, Tailwind 4).
- `data/exemplo.ts` com 3 projetos fictícios, membros, etapas e 5 perguntas de exemplo.
- `lib/legados.ts`: store em `localStorage` com `useSyncExternalStore`, para o selo "Legado registrado" persistir entre telas e recargas.
- `components/wireframe/`: Caixa, Placeholder, Selo, Alerta, botões em pílula. Também as peças interativas: seletor de métrica, form de respostas, botão "Registrar/Ver legado" e selos.
- As 4 telas, com `generateStaticParams` em todas as rotas dinâmicas (tudo pré-renderizado).
- Teste do fluxo completo no navegador: lista → painel → registrar → documento → painel com selo. Seletor de métrica e contador de respostas verificados.

**Problema encontrado pela IA:** o Next 16 (com Cache Components ligado por padrão) acusou acesso a `params` fora de `<Suspense>`. A IA consultou a documentação embutida na versão instalada e envolveu o conteúdo de cada página dinâmica em `<Suspense>`.

**O que ajustei (revisão do wireframe):** pedi três mudanças. A IA propôs como faria cada uma, e eu escolhi a opção de página própria para as etapas, acrescentando o destaque do membro com maior participação no painel.

1. **Página inicial antes dos projetos.** A IA criou `/` com a tagline, o problema em uma frase, "Como funciona" em 3 passos e o botão "Ver projetos da diretoria". A lista de projetos foi para `/projetos`, e o cabeçalho ganhou o link "Projetos".
2. **A métrica passa a controlar a lista de membros.** Antes ela estava fixa em commits.
   - A IA trocou os dados de exemplo para guardar linhas efetivas, linhas brutas e commits **por membro e por etapa**.
   - Criou `lib/metricas.ts` com os cálculos: totais, %, ranking, líder da etapa.
   - Pôs a métrica escolhida num contexto React no layout raiz, para a escolha se manter ao navegar.
   - Agora membros, matriz, destaques e textos dos gráficos seguem a métrica. Ao trocar a métrica, o "dono" de uma etapa pode mudar: com commits, Lucas passa a liderar também Infra/Deploy.
3. **Uma página própria para cada etapa,** em `/projetos/[id]/etapas/[etapaId]`.
   - Mostra o ranking de quem detém o conhecimento, um alerta se o líder vai sair e o status do legado ("Pendente · prioridade" ou "Legado registrado").
   - Tem retângulos no lugar do gráfico e da linha do tempo, além de navegação entre as etapas.
   - No painel, cada etapa mostra o **membro com maior participação**, com o link "Ver etapa →".

**Verificação:** fluxo testado no navegador, incluindo início → projetos → painel → troca de métrica → etapa → registrar legado → selo na etapa e no painel. A largura de celular foi conferida sem rolagem horizontal. Build, tipos e lint passam.

---

## Dados fictícios (17/11)

**O que pedi:** gerar primeiro os dados, para eu revisar em tabelas antes de levar ao app. Três projetos com os contextos do meu treinamento:
- **folhagem-cia:** CRUD de uma loja de plantas.
- **clinica-movimento:** clínica com duas unidades, Boa Viagem (BV) e Casa Forte (CF).
- **metalurgica-mezzalira:** limpeza de dados de uma indústria e dois agentes de IA, um para ler os dados e outro para responder sobre o manual de instrução.

Os projetos não precisam ser construídos: só commits fictícios com personagens inventados.

**O que a IA gerou:**
- **`scripts/cenarios.mjs`:** os 3 projetos com 5 etapas cada, 13 personagens inventados com papel, data de entrada e data de saída quando houver, e 10 a 14 mensagens de commit realistas por etapa no padrão Conventional Commits.
- **`scripts/gerar-dados.mjs`:** um gerador determinístico, com semente fixa (`npm run dados`). Ele:
  - sorteia as datas dentro da janela de cada etapa, com mais commits à noite, como numa EJ;
  - atribui as mensagens em ordem cronológica, do básico ao refinamento;
  - calcula linhas adicionadas, removidas, brutas e efetivas a partir do perfil de cada membro.
- **Arquivos em `data/`:**
  - `projetos.json`;
  - `commits.json`, com 456 commits;
  - `analises.json`, com participação pré-calculada por membro × etapa nas 3 métricas, líderes de cada etapa, riscos de saída e commits por semana.
- **Cenários desenhados para a demo:**
  - Em cada projeto, um membro de saída concentra uma etapa: Caio/Estoque, Sofia/Multiunidade, Henrique/Agente do manual.
  - Em algumas etapas o líder muda conforme a métrica:
    - Na Folhagem, Davi faz mais commits em Estoque, mas o código que ficou é do Caio.
    - Na Mezzalira, Yasmin tem mais linhas brutas na limpeza (reescreveu muito), mas as efetivas são do Bruno.
- **Uma visualização em tabelas** para revisão: KPIs, matriz com seletor de métrica, membros, commits por semana e últimos commits.

**Ajuste feito pela IA na própria revisão:** na primeira versão, as mensagens saíam em ordem aleatória ("configura CI" no fim do projeto). O gerador passou a atribuir mensagens em ordem cronológica dentro de cada etapa.

**O que ajustei:** nenhum ajuste nos dados; aprovei como foram gerados.

**O que decidi:** aprovei os dados e pedi para ligá-los ao app.

### Dados ligados ao app (17/11)

**O que a IA gerou:**
- **`data/index.ts`:** lê `projetos.json` e `analises.json` e entrega no formato que as telas já usavam. O alerta de cada projeto vem do maior risco de saída calculado. `data/exemplo.ts` foi removido.
- **`data/commits.ts`:** importado só no servidor, para os 147 KB de commits não irem para o navegador (verificado no build). Ele:
  - identifica a etapa principal de cada membro;
  - monta perguntas do legado que citam commits reais do membro: a maior feature, uma refatoração e um bug corrigido;
  - completa com perguntas sobre os combinados com o cliente e a sucessão.
- **Tela "Registrar legado":** ganhou a caixa "Commits de X em Y". Os commits citados nas perguntas aparecem primeiro, com o selo "citado nas perguntas".
- **Lista de projetos:** passou a mostrar a descrição de cada projeto.

**Ajuste feito pela IA no teste:** a caixa de commits mostrava os 6 mais recentes, mas as perguntas citavam outros commits. Ela passou a mostrar primeiro os citados.

**Verificação:** testado no navegador:
- lista de projetos (3 riscos);
- painel da Clínica Movimento;
- etapa Multiunidade (BV/CF);
- registrar o legado da Sofia, com perguntas citando 53ed61d, 42c837c e 5effddb;
- documento;
- volta ao painel com o selo "Legado registrado".

Build (62 páginas estáticas), tipos e lint passam.

---

## Índice de Conhecimento e risco (17/11)

**O que pedi:** primeiro perguntei se dava para criar um algoritmo que juntasse todas as métricas num valor final. A IA propôs o **Índice de Conhecimento (IC)** e o **Risco de saída** e simulou os dois nos dados antes de implementar. Depois pedi para aplicar o índice, tirar as outras métricas da visualização e aplicar o risco.

**O que a IA gerou:**
- **No gerador** (`scripts/gerar-dados.mjs`), calcula o IC por membro × etapa e no projeto inteiro:
  - pesos de 50% para linhas efetivas, 20% para commits, 15% para linhas brutas e 15% para linhas efetivas recentes, com meia-vida de 45 dias;
  - a concentração de cada etapa (HHI);
  - o risco de cada membro de saída por etapa: `IC × urgência × (0,5 + 0,5 × concentração)`.
  Tudo fica em `analises.json`, junto com os parâmetros usados.
- **`lib/indice.ts`:** ranking por IC, líder da etapa, níveis de concentração e de risco. O risco da etapa considera os legados registrados: ele vem do membro de saída de maior risco que ainda não registrou o legado.
- **`components/risco.tsx`:** selos de risco ("Risco alto · 52"), alertas abertos e alertas já resolvidos ("✓ … · legado registrado").
- **Telas:**
  - O seletor de métrica foi removido, junto com `components/metrica.tsx` e `lib/metricas.ts`.
  - Painel, matriz, membros e página de etapa mostram só o IC.
  - Cada etapa mostra o risco e a concentração.
  - A lista de projetos e o painel mostram o risco do projeto.
  - Uma legenda explica como ler o IC.
  - Na tela de legado, as linhas +/− dos commits saíram.

**Resultado nos dados:**

| Projeto | Risco | IC de quem sai |
|---|---|---|
| Clínica Movimento | 82 (alto) | Sofia, IC 90 em Multiunidade |
| Metalúrgica Mezzalira | 68 (alto) | Henrique, IC 92 no Agente do manual |
| Folhagem & Cia | 52 (alto) | Caio, IC 73 em Estoque |

O IC também resolve o caso em que as métricas discordavam: na Limpeza de dados, Bruno 58 × Yasmin 42 mostra um conhecimento dividido, não exclusivo.

**Verificação:** testado no navegador. A lista mostra 3 projetos com risco alto. Ao registrar o legado do Caio:
- o risco da Folhagem vai de 52 para "✓ Risco mitigado pelo legado";
- o alerta vira "legado registrado";
- a página de Estoque explica que "o risco era 52 e caiu para 0".

Build (62 páginas), tipos e lint passam.

### Métricas em porcentagem (17/11)

**O que pedi:** mostrar as métricas em %.

**O que a IA fez:** uma função única, `emPct` em `lib/indice.ts`, passou a formatar todos os valores de 0 a 100:
- **IC:** "Sofia Lins · IC 90%". Na matriz, por exemplo, Igor tem 56% de Agendamento.
- **Concentração:** "Alta (82%)" no lugar de "0,82".
- **Risco:** "Risco alto · 82%".

Os textos dos alertas, gerados pelo script, passaram a dizer "(IC 90%)". A legenda do IC agora diz que, em cada etapa, os IC somam 100% e que concentração de 100% significa uma única pessoa sabendo tudo. Os cálculos não mudaram. Verificado no painel, na matriz, na lista de membros e na página de etapa.

### Risco e urgência por níveis (17/11)

**O que pedi:**
- Trocar a visualização de risco por **risco alto/moderado/baixo**, de acordo com a concentração do IC.
- Adicionar **urgência alta/moderada/baixa**, de acordo com a data de saída.
- Considerar que muitos membros não terão data de saída; nesses casos, a urgência é baixa.

**O que a IA fez:**
- **Removeu o risco numérico** (0–100%) e a fórmula combinada do gerador. O gerador agora grava `diasParaSaida` de cada membro com saída.
- **Criou em `lib/indice.ts` duas classificações independentes por etapa:**
  - **Risco**, pela concentração (HHI) do IC: alto ≥ 70%, moderado ≥ 45%, baixo < 45%.
  - **Urgência**, pela saída de quem tem o maior IC na etapa: alta até 21 dias, moderada até 60 dias, baixa depois disso ou sem data de saída.
- **Alertas:** só aparecem para etapas com urgência alta ou moderada, ordenados por urgência e depois por risco.
- **Legado:** registrar o legado de quem tem o maior IC marca a etapa como "✓ Mitigado pelo legado".
- **Telas:**
  - Cada etapa mostra os selos "Risco …" e "Urgência …".
  - A página da etapa explica de onde vem cada um ("Risco · pela concentração (58%)", "Urgência · Caio sai em 3 semanas" ou "sem data de saída registrada").
  - Os membros com saída mostram o selo de urgência.
  - A lista e o painel mostram a situação mais grave do projeto.
  - A legenda do IC explica os limites.

**Resultado nos dados:**

| Projeto | Risco | Urgência | Por quê |
|---|---|---|---|
| Clínica Movimento | alto | alta | Sofia, Multiunidade, 14 dias |
| Metalúrgica Mezzalira | alto | moderada | Henrique, Agente do manual, 28 dias |
| Folhagem & Cia | moderado | alta | Caio, Estoque com concentração de 58%, 21 dias |

Etapas como Autenticação, em que Helena tem IC de 93% e não tem data de saída, aparecem como risco alto e urgência baixa: o conhecimento está concentrado, mas a saída não é iminente.

**Verificação:** testado no navegador:
- a lista mostra os 3 projetos com risco e urgência;
- o painel da Folhagem mostra os selos por etapa;
- na etapa Autenticação, a urgência aparece como "sem data de saída registrada";
- ao registrar o legado do Caio, Estoque e o projeto passam a "✓ Mitigado pelo legado".

Build (62 páginas), tipos e lint passam.

---

## Etapa 2 — Média fidelidade (17/11)

**O que pedi:** primeiro, o plano da etapa 2. A IA propôs:
- gráficos reais;
- a reorganização dos componentes;
- interações: legado de verdade, copiar/baixar, voltar ao lugar certo, matriz interativa e barras clicáveis;
- três decisões: a biblioteca de gráficos, a volta ou não do seletor de métrica, e a ordem de corte se o prazo apertasse.

Respondi "faça todos": tudo, inclusive os opcionais.

**Decisões assumidas pela IA a partir do "faça todos":**
- **Gráficos próprios** (SVG e CSS), sem biblioteca, como ela tinha recomendado. Isso dá controle total para aplicar a identidade do CITi na etapa 3.
- **O seletor de métrica não voltou.** No lugar entrou a alternativa proposta, "Como o IC foi calculado".

**O que a IA gerou:**
- **Gerador:**
  - semanas por etapa;
  - todas as semanas do projeto, inclusive as sem commits;
  - a fatia de cada membro em cada um dos 4 sinais do IC.
- **Componentes reorganizados** em `ui/`, `graficos/`, `painel/`, `risco/` e `legado/`.
- **Gráficos:**
  - `BarrasIC`: barras horizontais de IC, compactas nos cards do painel e completas na etapa;
  - `LinhaDoTempo`: SVG com commits por semana empilhados por membro, tooltip por semana, legenda clicável e eixo com escala automática.
  - Cada membro tem a mesma cor em todos os gráficos. A paleta é neutra e provisória.
- **Interações:**
  - o destaque de membro é compartilhado na página: clicar numa barra, na legenda ou no nome na matriz apaga os outros membros em todos os gráficos;
  - na matriz, passar o mouse destaca a linha e a coluna, e clicar numa célula abre a etapa;
  - "Como o IC foi calculado" mostra a tabela de fatia × peso = contribuição para qualquer membro da etapa.
- **Legado de verdade:**
  - as perguntas ganharam seções: Decisões e porquês, Pontos de atenção, Combinados com o cliente, Sucessão;
  - o rascunho é salvo a cada tecla;
  - o formulário exige pelo menos uma resposta;
  - o documento é montado com as respostas reais, a data de registro e os commits citados (as perguntas sem resposta aparecem como "Sem resposta registrada.");
  - Copiar (markdown), Baixar .md e Editar respostas funcionam;
  - o "Voltar" lembra se o usuário veio do painel ou da etapa.

**Verificação:** testado no navegador:
- **barras e destaque:** clicar em Sofia apaga 54 dos 70 blocos da linha do tempo e realça a linha dela na matriz;
- **tooltip da semana:** "Semana de 28/09 · 16 commits";
- **matriz:** clicar na célula abre a etapa;
- **cálculo do IC:** a soma dos 4 sinais (46,6 + 15,8 + 13,5 + 14,2) dá o IC de 90% da Sofia;
- **legado da Sofia:**
  - registrado a partir da etapa;
  - erro ao enviar sem respostas;
  - rascunho restaurado depois de recarregar;
  - documento com as respostas e "Sem resposta registrada.";
  - Copiar gera o markdown;
  - Baixar gera `legado-sofia-lins.md`;
  - Voltar leva de novo à etapa, agora "✓ Mitigado".

Também conferido na largura de celular, sem rolagem horizontal. Build (62 páginas), tipos e lint passam.

**O que ajustei:** nenhum ajuste; a etapa foi commitada como ponto de restauração antes da mudança de rota (abaixo).

---

## Mudança de rota: de passagem de conhecimento para acompanhamento de projetos (17/11)

**O que decidi:** perguntei à IA como treinar o modelo para fazer perguntas melhores. Ela explicou que não é preciso treinar; bastaria dar contexto no prompt. Depois disso, mudei a direção do produto: **a plataforma passa a ser de acompanhamento de projetos**, e as perguntas e o legado saem.

As escolhas, feitas num questionário de múltipla escolha montado pela IA:
- **O que mostrar:** progresso das etapas, atividade da equipe, conhecimento e risco (IC, risco e urgência continuam) e uma visão por membro.
- **Legado:** removido por completo (telas, botão e mitigação de risco pelo legado).
- **Papel da IA no produto:** um resumo do projeto, um status report gerado a partir dos commits e indicadores.
- **Checkpoint:** a etapa 2 foi commitada antes da mudança (`6a838d4`), para poder voltar se preciso.


### Plano ajustado e implementação da nova direção (17/11)

**O que pedi:** a IA apresentou o plano da nova direção, e eu ajustei:
- **O nome continua CITi Legacy**, agora como um visualizador interno de todos os projetos, concluídos e em andamento, que guarda o legado da empresa.
- **Projetos em andamento:** os 3 que já existiam.
- **Projeto atrasado:** a IA cria um novo.
- **Projetos concluídos:** dois cases reais do CITi com commits fictícios, **Neoenergia GALT** (localização de falhas em linhas de transmissão com machine learning; erro médio de 1,73% em 37 casos reais) e **Riachuelo** (plataforma omnichannel; resultados só qualitativos).
- **Membros que já saíram:** podem ser marcados.
- **Tagline:** adaptada ao novo sentido.

**O que a IA gerou:**
- **Cenários:**
  - 20 pessoas compartilhadas entre projetos; Bruno, Renata, Helena e Lívia aparecem em mais de um.
  - 3 pessoas que já saíram, todas dos cases concluídos.
  - Cada etapa ganhou período previsto e progresso informado.
  - Um projeto novo e atrasado, a **Plataforma de Voluntariado** de uma ONG fictícia.
  - Os dois cases reais, com etapas e mensagens de commit coerentes com o que o material descreve (oscilografias e COMTRADE, fasores, modelo de localização, classificação de causas, validação em 37 casos; design e testes de usabilidade, personal shopper, escaneamento de peças, carrinho integrado, checkout, cadastro no PDV, painel por canal).
  - Não foi inventado nenhum número de resultado além dos que constam nos cases.
- **Gerador:**
  - projetos em andamento têm commits até a véspera de hoje, e os concluídos, até a entrega;
  - o IC dos concluídos usa a data de entrega como referência de recência;
  - grava o primeiro e o último commit de cada etapa;
  - gera um `referencia.json` mínimo, para o navegador conhecer "hoje" sem carregar os dados.
  - No total, 808 commits.
- **`lib/status.ts`:** status de etapa (concluída, em andamento, atrasada, não iniciada, mais o sinal "parada" após 14 dias sem commits) e de projeto, progresso, texto de prazo e alertas ordenados por gravidade.
- **Removido:** o legado, as perguntas, o documento, o rascunho e a mitigação de risco pelo legado (`components/legado`, `lib/legados.ts` e as rotas de legado).
- **Telas:**
  - **Início:** reescrito, com números do acervo.
  - **Projetos:** filtros por status e busca, sem acento nem maiúscula.
  - **Painel:** andamento, espaço do resumo por IA (etapa 3), **cronograma** (gráfico novo, tipo Gantt, com previsto, progresso, período real de commits e linha de hoje), conhecimento e risco, matriz, atividade, equipe, e contexto e resultados nos cases reais.
  - **Etapa:** andamento e prazo; nos concluídos, o bloco "Quem procurar" indica a próxima pessoa quando quem mais sabe já saiu.
  - **Membros** e **página do membro:** projetos, IC, período, atividade mensal por projeto e últimos commits.
- **`LinhaDoTempo`:** passou a aceitar qualquer série (membros ou projetos) e período (semana ou mês).

**Problema encontrado pela IA no teste:** os alertas mostravam "sai undefined", porque o gerador grava `saidaTexto` e o app lia `saidaPrevista`. Ela corrigiu o mapeamento na camada de dados. Também limitou a 3 os alertas no topo do painel, porque o projeto atrasado tinha 5.

**Verificação:** testado no navegador:
- **lista:** 3 em andamento, 1 atrasado e 2 concluídos; os filtros e a busca funcionam;
- **projeto atrasado:** "atrasado há 11 dias", 4 etapas atrasadas e 1 parada no cronograma;
- **GALT:** na etapa de sinais aparece "Gustavo Lemos já saiu. Próxima pessoa: Marcos Vilela, que também já saiu";
- **Bruno:** página com 2 projetos e atividade mensal;
- **celular:** largura conferida, sem rolagem horizontal.

Build (74 páginas), tipos e lint passam.

---

## Simplificação das telas (17/11)

**O que pedi:** menos informação nas telas e uma navegação simples. Analisamos tela por tela. A IA propôs cada mudança, mostrou exemplos visuais quando pedi (cards × lista, painel enxuto), e eu decidi.

**Minhas decisões:**
- **Início:** vira uma **tela de login** com um único usuário administrador, de demonstração.
- **Projetos:** em **cards** (escolhi a opção A entre cards e lista), com abas Em andamento / Concluídos, busca e um alerta curto por projeto.
- **Painel do projeto:**
  - saem os blocos de conhecimento e risco, o cronograma e a matriz;
  - **sai toda a funcionalidade de risco e urgência**;
  - ficam só dois gráficos: **commits por semana** e **IC**, cada um no projeto todo e por etapa, separados para não poluir;
  - pedi também um lugar para ver o **escopo total** do projeto.
- **A IA propôs separar o projeto em 4 abas** (Visão geral, Escopo, Atividade, Conhecimento) e eu aprovei. Também aprovei:
  - remover a página da etapa, cujo filtro foi para dentro das abas;
  - deixar em "Precisa de atenção" só as etapas atrasadas ou paradas;
  - **remover a data de saída prevista**.
- **Contexto:** pedi que a IA escrevesse o contexto dos 4 projetos que não são cases reais.
- **Membros:** cards com abas Na empresa / Já saíram e busca.
- **Página do membro:** só o cabeçalho e cards dos projetos com o IC do membro, sem "quem mais sabe de" e sem gráficos.

**O que a IA gerou:**
- **Login:**
  - `config/acesso.ts` com o usuário de demonstração;
  - `lib/sessao.ts` com a sessão no navegador;
  - `components/layout/estrutura.tsx`, com o cabeçalho, o botão Sair e o redirecionamento ao login para quem não está logado.
- **Projeto em 4 rotas** com um layout comum (nome, status, progresso, prazo e abas):
  - as abas Atividade e Conhecimento têm um seletor "Projeto todo / Etapa" guardado na URL (`?etapa=`);
  - clicar numa etapa na Visão geral abre o Conhecimento já filtrado nela.
- **Dados:** o gerador grava as fatias dos 4 sinais do IC no projeto inteiro, para o "Como o IC foi calculado" funcionar também em "Projeto todo". As datas de saída prevista saíram dos cenários. Os cases ganharam uma linha de resultado para os cards.
- **Alertas:** um por etapa, juntando atraso e parada numa frase ("Certificados de horas: atrasada há 11 dias (30% concluído) e sem commits há 18 dias"). No card, aparece a versão curta ("4 etapas atrasadas").
- **Removido:** risco, urgência, concentração na tela, cronograma, matriz, página da etapa, data de saída e os gráficos da página do membro.

**Problemas encontrados pela IA no teste:**
- O cliente aparecia repetido nos cards ("Clínica Movimento · Clínica Movimento…"). Agora mostra só o complemento quando o cliente tem o mesmo nome do projeto.
- O cabeçalho dos projetos concluídos repetia a data de entrega.
- A barra de abas mostrava uma rolagem vertical desnecessária.
- O Next acusou que a proteção de login escondia as páginas durante a pré-renderização. Agora as páginas são renderizadas normalmente no servidor, e o redirecionamento acontece no navegador.

**Verificação:** testado no navegador:
- **login:** vazio dá erro, senha errada dá erro, a correta entra; sem sessão, as páginas voltam ao login; Sair limpa a sessão;
- **projetos:** abas e cards;
- **projeto:** as 4 abas, inclusive o link da etapa para o Conhecimento filtrado e a troca de etapa no seletor;
- **membros:** abas e página do membro;
- **celular:** largura conferida, sem rolagem horizontal da página.

Build (55 páginas), tipos e lint passam.

### Escopo nas etapas e etapas em planejamento (17/11)

**O que pedi:** colocar o escopo dentro das etapas, na Visão geral. Pedi também que uma etapa que ainda não começou apareça "em planejamento", com 0% e "faltam X dias".

**O que a IA fez:**
- **Cada etapa da Visão geral mostra:** a descrição do que ela inclui (o escopo), o status, o progresso e uma contagem de prazo:
  - "faltam 17 dias" (em andamento);
  - "atrasada há 18 dias" (atrasada);
  - "começa em 13 dias" (em planejamento, com o período previsto).
- **"Não iniciada" virou "Em planejamento".**
- **Dados:** como nenhuma etapa estava em planejamento, os cenários ganharam uma etapa futura em cada projeto em andamento, sem commits:
  - Relatórios de vendas (Folhagem);
  - Implantação nas unidades (Clínica);
  - Avaliação com operadores (Mezzalira).

  Isso também baixa o progresso médio desses projetos.
- **A aba "Escopo" virou "Sobre"** (sobre o projeto, equipe e resultados), sem a lista de entregas, que ficaria repetida.

**Verificação:** a Visão geral da Clínica Movimento mostra 6 etapas, incluindo "Implantação nas unidades · Em planejamento · 0% · começa em 13 dias". Build, tipos e lint passam.

### Atividade e Conhecimento numa aba só (17/11)

**O que pedi:** juntar Atividade e Conhecimento numa única página.

**O que a IA fez:**
- **Abas:** o projeto passou a ter 3 abas: Visão geral, Sobre e **Participação**.
- **Aba Participação:** um seletor único "Projeto todo / Etapa" no topo e, abaixo, o gráfico de IC (com "Como o IC foi calculado") e o gráfico de commits por semana. Clicar num membro destaca a pessoa nos dois gráficos ao mesmo tempo.
- **Links:** a Visão geral passou a levar a essa aba já filtrada na etapa.
- **Etapas sem commits** (em planejamento) mostram "Esta etapa ainda não tem commits." no lugar de um gráfico vazio.

**Problema no teste:** depois da troca de rotas, o servidor de desenvolvimento ficou com uma versão antiga do módulo em cache e mostrava "Element type is invalid". O build de produção já passava. Reiniciar o servidor resolveu.

**Verificação:** na Folhagem, a etapa Estoque abre filtrada pela Visão geral. Clicar em Caio apaga 17 das 27 barras de outros membros na linha do tempo. A etapa em planejamento mostra o aviso de "sem commits". Build, tipos e lint passam.

---

## Etapas ligadas ao repositório e progresso pelas tasks (17/11)

**O que pedi:**
- etapas ligadas a arquivos específicos do repositório, com a contagem de commits saindo disso;
- o progresso de cada etapa pelas tasks concluídas;
- projetos que o admin possa adicionar.

A IA recomendou fazer primeiro o que mais aparece na demo e cabe no prazo. Pedi para fazer só os dois primeiros agora; o cadastro de projetos fica para eu avaliar depois.

**O que a IA fez:**
- **Commit de restauração** antes de começar (`8cb3d38`).
- **Caminhos por etapa:**
  - o padrão é `src/<etapa>/**`, e Infra/Deploy usa `.github/**` e `infra/**`;
  - algumas etapas têm caminhos próprios, como `etl/**` e `agentes/manual/**` na Mezzalira, `pipeline/sinais/**` e `modelos/localizacao/**` no GALT, e `app/loja/**` e `pdv/**` na Riachuelo.
- **Arquivos em cada commit**, coerentes com a mensagem: uma feature cria `src/estoque/baixa-automatica.ts` e às vezes o teste; uma refatoração mexe em vários arquivos; docs altera o README.
  - Cerca de 8% dos commits também tocam um arquivo de outra etapa ativa naquele momento (código compartilhado). Com isso, 48 commits contam em duas etapas.
  - O gerador passou a calcular a etapa de cada commit **pelos arquivos**, e não mais pela mensagem. O IC, a atividade semanal, o último commit e o status "parada" saem daí.
- **Tasks por etapa:**
  - por padrão são as entregas descritas nas mensagens de commit (feat, chore, docs, perf);
  - as etapas em planejamento têm tasks escritas à mão;
  - o número de tasks concluídas segue o progresso de referência de cada etapa;
  - **progresso = tasks concluídas ÷ total**.
- **Telas:**
  - **Visão geral:** cada etapa mostra "x de y tasks" e um painel recolhível com as **tasks marcáveis** e os caminhos do repositório. Marcar uma task recalcula na hora o progresso da etapa, o status, os alertas, o cabeçalho do projeto e o card na lista de projetos. As marcações ficam salvas no navegador (`lib/tasks.ts`).
  - **Participação:** com uma etapa selecionada, mostra "Contam nesta etapa os commits que alteram: …".
- Para isso, a Visão geral e a barra do cabeçalho viraram componentes de navegador. O servidor manda para eles uma versão leve do projeto (`projetoEnxuto`).

**Problemas no teste:**
- Rodar o build de produção com o servidor de desenvolvimento ligado corrompeu o cache `.next` ("Unexpected end of JSON input"). A solução foi parar o servidor, apagar o `.next` e rodar de novo; daqui em diante, nunca os dois ao mesmo tempo.
- A Visão geral ficava em "Carregando…" ao abrir a página direto. A IA investigou e viu que não era um defeito do app: o painel do navegador de teste estava **oculto**, e nesse estado o navegador pausa o `requestAnimationFrame` que o React usa para revelar o conteúdo transmitido. Abrindo pela navegação interna, ou numa aba visível, a página carrega normalmente.

**Verificação:**
- Na Plataforma de Voluntariado, marcar as 2 tasks restantes de "Certificados de horas" levou a etapa de 33% para 100%, com status "Concluída". O projeto foi de 70% para 81%, e o alerta da etapa sumiu.
- A aba Participação mostra os caminhos da etapa Inscrições.
- Tipos e lint passam. O build de produção passou antes do teste.

---

## Etapa 3 — Alta fidelidade (18/11)

**O que pedi:** primeiro, o plano da etapa 3: identidade visual, IA ao vivo e deploy. Depois pedi uma **página de entrada do site antes do login**, com o ícone de login no topo.

**O que a IA fez (identidade e entrada):**
- **Tema escuro do CITi** (`app/globals.css`):
  - fundo `#0A0A0A`, verde `#00DB58` para ações, progresso, aba ativa e itens concluídos, âmbar `#FFA630` para alertas;
  - Inter Tight nos títulos e no texto, IBM Plex Mono nos dados, via `next/font`.
  - A escala de cinza do Tailwind foi redefinida em modo escuro. Assim, os componentes da média fidelidade herdaram o tema sem reescrever cada classe; depois só os pontos de destaque foram ajustados.
- **Componentes:**
  - cards arredondados, botões em pílula (o primário em verde);
  - selos com tons (neutro, verde para concluído, âmbar para atrasado e parado);
  - alertas em âmbar;
  - barras de progresso em verde, com animação ao carregar;
  - paleta de membros nova para o fundo escuro, sem verde nem âmbar, que já têm significado;
  - gráficos com eixos e tooltip escuros;
  - animações discretas, desligadas para quem configurou o sistema para reduzir movimento.
- **Entrada do site (`/`, pública):**
  - tagline em destaque;
  - uma prévia do painel com dados reais do protótipo (a Clínica Movimento e quem sabe de Multiunidade);
  - os números do acervo;
  - "O que o CITi Legacy faz" e "Do repositório ao painel";
  - chamada para entrar.
- **Cabeçalho:** marca "CITi Legacy" e **ícone de login no topo**, que vira "Abrir painel" para quem já entrou. Na área logada, ficam os links, o usuário e o ícone de sair.
- **Login** foi para `/login`, com o mesmo visual. Sair leva de volta à entrada do site.

**Verificação:** prints da entrada, do login, da lista de projetos, da Visão geral e da Participação no tema novo, enviados para aprovação. Tipos e lint passam.

### Logo, fundo do CITi e nomes ocultos na prévia (18/11)

**O que pedi:** enviei imagens do logo do CITi e do fundo usado no site citi.org.br. Pedi também que os nomes da prévia da página de entrada ficassem ocultos, como o saldo num app de banco.

**O que a IA fez:**
- **Logo:** com a biblioteca `sharp`, já instalada pelo Next, recortou o logo e trocou o fundo branco por transparente. Gerou duas versões, verde e branca, em `public/marca/`. O cabeçalho e o login usam o logo verde ao lado da palavra "Legacy".
- **Fundo:** recortou só o padrão abstrato do banner, sem o texto e o logo que vêm nele (`public/marca/fundo-citi.webp`). Ele aparece no lado direito da área de destaque da entrada, esmaecido para a esquerda, para o título continuar legível.
- **Prévia com nomes ocultos:** primeira versão com os nomes como `••••••••` e um ícone de olho para revelar.

**Ajuste que pedi:** ocultar também o nome do projeto e tirar o olho, porque essas informações são protegidas pelo login.

**O que a IA fez:**
- A prévia mostra só o formato e os números (status, progresso, prazo, porcentagens de IC). Projeto, descrição, etapa e pessoas aparecem como `••••`, e há o aviso "Entre para ver os projetos e as pessoas".
- A IA também garantiu que **nenhum nome real chega à página pública**: o servidor passa para a prévia apenas os números. Foi conferido no HTML da entrada, onde aparecem 0 ocorrências de "Sofia", "Clínica Movimento", "Multiunidade" e "Boa Viagem".

**Verificação:** a entrada mostra a prévia toda oculta. Tipos e lint passam.

### IA ao vivo: resumo do projeto (18/11)

**O que pedi:** aprovei o visual (commit `d270ee1`) e pedi para seguir para a IA.

**O que a IA fez:**
- **`lib/resumo.ts`:**
  - monta o contexto do projeto em texto: status, progresso, etapas com tasks feitas e pendentes, prazos, alertas, equipe com IC e os commits das últimas 3 semanas (no projeto concluído, uma amostra do projeto inteiro);
  - o prompt, em português, pede um JSON com 3 seções e 2 a 3 itens curtos cada. Proíbe inventar fatos e pede para citar etapas, tasks e pessoas;
  - as seções são "O que andou / O que travou / O que fazer primeiro" no projeto em andamento e "O que foi entregue / Como foi o projeto / Quem procurar" no concluído.
- **Ordem dos provedores:**
  1. **Gemini** (`GEMINI_API_KEY`, modelo configurável, padrão `gemini-2.5-flash`), com resposta forçada em JSON;
  2. **Groq** de reserva (`GROQ_API_KEY`, padrão `llama-3.3-70b-versatile`);
  3. **resumo automático pelas regras**, sem IA, se nenhum responder.

  A resposta é validada antes de ir para a tela, e há um tempo limite de 20 s por chamada.
- **Rota `POST /api/resumo`:** recebe o projeto e as tasks marcadas no navegador. Assim o resumo reflete o que o admin acabou de marcar.
- **Tela `ResumoIA`, na Visão geral, no lugar do espaço reservado:**
  - esqueleto animado enquanto gera;
  - as 3 seções lado a lado;
  - a fonte sempre indicada ("Gerado por IA · Gemini", "Gerado por IA · Groq" ou "Resumo automático (sem IA)") e a hora;
  - botão "Gerar de novo";
  - cache no navegador enquanto as tasks não mudam (o resumo automático não fica em cache).
- **`.env.example`:** documenta as variáveis. Os arquivos `.env*` continuam fora do git, exceto o exemplo.

**Verificação:** ainda sem chave configurada, a rota devolve o resumo automático. Para a Clínica Movimento, por exemplo: "Pacientes e prontuário (atrasada há 18 dias): concluir 'Consentimento LGPD no primeiro atendimento' com Mateus Cavalcanti". A Visão geral mostra o resumo com a fonte "Resumo automático (sem IA)". **Falta testar com a chave do Gemini.** Tipos e lint passam.

### Chave do Gemini e escolha do modelo (18/11)

**O que pedi:** coloquei a chave do Gemini e perguntei como saber qual modelo usar.

**O que a IA encontrou e fez:**
- **A chave estava no `.env.example`**, que é versionado no git. A IA moveu a chave para o `.env.local` (fora do git, com permissão só do dono) e deixou o exemplo vazio de novo, sem exibir a chave em nenhum momento.
- **Modelos:** consultou a API do Gemini com a chave e listou 49 modelos disponíveis.
  - O padrão do código, `gemini-2.5-flash`, devolveu 404, com a mensagem "no longer available to new users".
  - Os mais novos (`gemini-3.8-flash`, `3.7`, `3.5-flash`) devolveram 503, alta demanda naquele momento.
  - O `gemini-3.5-flash-lite` respondeu normalmente.
- **Ajuste no código:** o Gemini passou a tentar **uma lista de modelos em ordem** (`gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`). `GEMINI_MODEL` aceita um ou vários modelos separados por vírgula. O tempo limite por modelo caiu para 12 s. Só depois de todos falharem vem o Groq e, por fim, o resumo automático.

**Verificação:**
- **Clínica Movimento:** resumo **gerado pelo Gemini (`gemini-3.5-flash-lite`)**, específico e sem inventar fatos. Exemplo: "Destravar a etapa Pacientes e prontuário com Mateus Cavalcanti para finalizar o Consentimento LGPD."
- **GALT:** no mesmo minuto, os três modelos estavam sobrecarregados e entrou o resumo automático, como previsto.

### Chave nova e teste único (18/11)

**O que pedi:** verificar se a chave aparecia em algum commit ou histórico, para eu decidir se gerava outra.

**O que a IA encontrou:** comparou com o valor da chave, sem exibi-lo.
- Ela **não aparecia em nenhum commit**, mensagem ou arquivo do projeto.
- Mas **aparecia na transcrição local da sessão**: o app que executa a IA registrou automaticamente a mudança no `.env.example` (onde a chave foi colada por engano) e incluiu o conteúdo na conversa.

A IA recomendou trocar a chave. Gerei uma nova e coloquei direto no `.env.local`.

**Teste:** a pedido meu, um teste só, para economizar cota. Antes disso, a IA pôs o `gemini-3.5-flash-lite` (500 pedidos por dia no plano gratuito) como o primeiro modelo da lista, para o teste gastar um pedido só. Resultado: o resumo da Folhagem & Cia foi **gerado pelo Gemini (`gemini-3.5-flash-lite`) num único pedido**, citando as tasks pendentes reais de Estoque e de Pedidos.

---

## Banco de dados e resumos semanais com memória (18/11)

**O que decidi:**
- Revisamos a etapa 3 e discutimos onde hospedar. Escolhi a **Vercel**, em vez da Cloudflare e do GitHub Pages, que a IA comparou.
- Pedi um **banco de dados** (com Docker) para guardar commits, clientes, projetos e os resumos da IA.
- Defini que:
  - **projetos concluídos** têm um **resumo geral fixo** guardado no banco;
  - **projetos em andamento** têm **resumos semanais**, e não diários, com o contexto guardado semana após semana para as informações não se repetirem.
- O objetivo era não ter imprevistos na demo: nenhuma chamada de IA acontece quando alguém visita a página.

**O que a IA fez:**
- **Banco:**
  - **Postgres** no Docker (`docker-compose.yml`, porta 5433) para o desenvolvimento e **Neon** na Vercel, com a mesma `DATABASE_URL`;
  - **Drizzle**, com o esquema em `db/esquema.ts`, para clientes, pessoas, projetos, membros, etapas, tasks, commits e resumos;
  - a tabela de resumos não tem chave estrangeira de propósito: recarregar os dados nunca apaga resumos, que custam chamadas à IA.
- **Carga:** `npm run banco:preparar` cria as tabelas e carrega os 6 projetos, as 20 pessoas e os 808 commits.
- **Camada de dados:**
  - lê o banco com `'use cache'` e `cacheTag`;
  - **IC, concentração, semanas e primeiro e último commit passaram a ser calculados na hora a partir dos commits** (`lib/analise.ts`), em vez de vir pré-calculados num JSON;
  - todas as páginas viraram consultas assíncronas ao banco.
- **Tasks no banco:** uma ação do servidor grava a mudança e invalida o cache (`updateTag`). A tela atualiza na hora (`useOptimistic`), e a marcação vale para todos os usuários. O armazenamento no navegador foi removido.
- **Resumos (`lib/resumo.ts`):**
  - **semanal:** o contexto é a semana (os commits daqueles 7 dias, mais tasks, prazos e alertas atuais no resumo mais recente) e **os 4 resumos anteriores**, com a instrução de **não repetir** e de destacar o que mudou;
  - **final:** gerado uma vez só, e não é refeito se já existir.
  - A ordem dos provedores continua Gemini (Flash Lite primeiro), Groq e regras.
- **Rota `/api/cron/resumos`** (protegida por `CRON_SECRET`) e **Vercel Cron** em `vercel.json`, toda **sexta às 23h** (02h UTC de sábado).
- **Histórico inicial (`npm run banco:resumos`):** as 4 últimas semanas de cada projeto em andamento, em ordem, cada uma usando as anteriores como contexto, e o resumo final dos concluídos, com uma pausa entre pedidos por causa do limite por minuto.
- **Tela:**
  - a Visão geral lê os resumos do banco: a semana mais recente em destaque, mais "Semanas anteriores (N)";
  - nos concluídos, o "Resumo final do projeto";
  - o "Gerar de novo" e a chamada ao vivo saíram.

**Verificação:**
- **Páginas:** todas as páginas respondem com os dados do banco.
- **Tasks:** marcar uma task na Plataforma de Voluntariado gravou no banco (conferido no Postgres). A etapa foi de 33% para 67% e o cabeçalho, que vem do servidor, de 70% para 76%. Depois o teste foi desfeito.
- **Rota do cron:** recusa chamadas sem o segredo (401).
- **Histórico inicial:** 18 resumos gerados. Dois caíram no resumo automático porque os três modelos do Gemini estavam sobrecarregados (503) naquele momento. A IA criou a opção `--so-regras`, que refaz só esses dois, e na segunda tentativa os 18 ficaram com o Gemini.
- **Memória entre semanas:** nos resumos da Clínica, "O que andou" traz fatos novos a cada semana, e na semana mais recente aparece "Pacientes e prontuário **continua** atrasada", em vez de repetir os detalhes. Ponto a melhorar: "O que fazer primeiro" ainda se repete entre as semanas mais antigas, que não tinham a lista de tasks pendentes no contexto.
- **Build de produção:** passa. Ele roda com o servidor de desenvolvimento parado, porque os dois juntos corrompem o cache.

### Banco como fonte única e data real (18/11)

**O que pedi:** apagar os arquivos de dados que ficaram fora do banco e atualizar a data.

**O que a IA fez:**
- **Fonte única:** o gerador (`scripts/gerar-dados.mjs`) não grava mais arquivos e exporta os dados. `npm run banco:carregar` gera e grava direto no banco. Foram apagados `analises.json`, que já não tinha uso, `projetos.json`, `commits.json` e `referencia.json`. O cálculo de análises que só servia ao JSON saiu do gerador.
- **Data real:** o "hoje" das telas passou de 17/11/2026 fixo para a **data real no fuso de Recife** (`lib/hoje.ts`).
  - Ele é calculado na leitura do banco e vai junto com cada projeto (`projeto.hoje`). Assim servidor e navegador usam a mesma data e as páginas em cache se atualizam ao longo do dia.
  - Prazos, atrasos, "parada" e a semana atual dos resumos usam essa data.
  - Os commits fictícios continuam terminando em 16/11 (data dos dados em `cenarios.mjs`), para não desalinhar dos resumos já gerados.

**Verificação:** os dados gerados são idênticos aos que estavam no banco (mesmos hashes e datas). A carga refeita manteve os 18 resumos.

## Deploy na Vercel com banco Neon (18/11)

**O que pedi:** publicar o protótipo na Vercel.

**Como foi feito:**
- **Eu, no painel da Vercel:**
  - importei o repositório do GitHub;
  - criei o banco **Neon** pela integração de Storage: região São Paulo, plano Free, sem o Auth do Neon (o login é o nosso), prefixo `DATABASE` para gerar a variável `DATABASE_URL`;
  - cadastrei `GEMINI_API_KEY` e `CRON_SECRET` como *Secret* em Production e Preview;
  - refiz o deploy.
- **A IA me guiou tela por tela** e explicou cada opção do painel (o que mudar e o que deixar como está).
- **Carga do banco pela IA:**
  - a URL do Neon ficou num arquivo local ignorado pelo git (`.env.neon`), sem passar pelo chat;
  - a IA criou as tabelas e carregou os dados no Neon com os mesmos scripts do banco local;
  - os 18 resumos do Gemini foram **copiados** do banco local em vez de gerados de novo, para não gastar cota da API.
- **Um tropeço:**
  - a primeira tentativa de carga leu o arquivo com `source`, e o `&` da URL quebrou o comando. A carga foi para o banco local por engano, sem prejuízo, porque os dados eram os mesmos;
  - a IA percebeu pela mensagem "No changes detected", que não fazia sentido num banco novo, conferiu consultando o Neon direto e refez.

**Verificação no site publicado** (https://citi-legacy.vercel.app):
- entrada, login, projetos, membros e as três abas de um projeto respondem 200, com os dados do Neon;
- a Visão geral mostra o resumo da semana gerado pelo Gemini e as semanas anteriores;
- a rota do cron recusa chamadas sem o segredo (401);
- o HTML público da entrada não contém nomes de pessoas nem de projetos.

### Projeto concluído pelas tasks (18/11)

**O que pedi:** testei marcar todas as tasks de um projeto e ele continuou "Atrasado". Pedi que o status se atualizasse.

**Causa:** a etapa já virava "Concluída" com 100%, mas o projeto só ficava concluído pela data de entrega gravada no banco, que as tasks nunca alteravam.

**O que a IA propôs e eu aprovei:**
- Marcar a última task conclui o projeto: status concluído e entrega = hoje.
- Desmarcar uma task reabre o projeto.
- O resumo final fica para o cron de sexta, sem gastar a API a cada clique.

**Ajuste que a IA encontrou ao implementar:** nos projetos concluídos, as tasks ficavam travadas na tela, e assim nunca daria para reabrir. Por isso:
- o banco ganhou a coluna `concluido_pelas_tasks`;
- só esses projetos continuam com as tasks liberadas;
- GALT e Riachuelo (históricos) continuam travados, inclusive no servidor;
- ao reabrir, o resumo final, se já existir, é apagado, para não ficar desatualizado.

**Verificação no banco local, pela tela:**
- deixei a Folhagem & Cia com uma task pendente e marquei a última: o projeto virou "Concluído · Entregue 03/08/2026 a 18/11/2026 · 30 dias antes do previsto";
- desmarquei a task: o projeto voltou para "Em andamento" com o resumo da semana;
- os dados de teste foram restaurados depois.

**No Neon:** a coluna foi aplicada com `banco:migrar`. Nenhum projeto estava com todas as tasks feitas, então não havia teste para desfazer.

### Resumos da IA na entrada e exportação em PDF (18/11)

**O que pedi:** mostrar os resumos de IA em "O que o CITi Legacy faz" e criar um exportável bonito dos resumos. Pedi para discutir antes de fazer.

**Discussão:** a IA propôs as opções e eu escolhi:
- conteúdo: um PDF por projeto, com o histórico;
- visual: fundo claro com detalhes verdes;
- formato: PDF pelo próprio navegador (página de impressão), sem biblioteca nova.

Ficaram de fora o boletim da empresa inteira e a imagem para WhatsApp/Slack.

**O que a IA fez:**
- **Entrada:** um 4º card, "Resumos semanais com IA", com a seção em 2×2. O card só descreve a ideia, sem mostrar resumos reais, porque a entrada é pública.
- **Botão "Exportar PDF"** no card do resumo, na Visão geral.
- **Página `/exportar/[projetoId]`:**
  - folha A4 branca, com a logo do CITi;
  - dados do projeto em quatro caixas;
  - resumo em destaque num bloco verde-claro;
  - tabela de etapas com barras de progresso;
  - histórico das semanas em três colunas;
  - rodapé com a fonte do resumo (Gemini e modelo);
  - na tela aparece a barra "Voltar ao projeto / Salvar como PDF"; na impressão, só a folha, com regras `@media print` e `@page A4`.
- **Detalhe técnico:** o rodapé do site foi movido para a `Estrutura`, para que a versão de impressão saia sem cabeçalho nem rodapé do app. As cores do documento são explícitas, porque no tema escuro do site `bg-white` é a cor das superfícies escuras.

**Verificação:**
- vi a página na tela, com a Clínica Movimento: resumo, etapas, 3 semanas anteriores e rodapé;
- testei o PDF salvo pelo navegador e funcionou.

### Novo projeto pelo admin (18/11)

**O que pedi:** o cadastro de projetos pelo admin (o item que estava pendente). Também pedi os acabamentos: boletim da empresa em PDF e envio por e-mail.

**Decisões:**
- os caminhos do repositório vêm sugeridos a partir do nome da etapa, e o admin pode editar;
- o e-mail será enviado pelo Resend;
- editar e excluir projetos ficaram fora do escopo.

**O que a IA fez:**
- `/projetos/novo`, com as seções Projeto, Equipe e Etapas, e o botão "+ Novo projeto" na lista;
- etapas adicionáveis e removíveis;
- o caminho sugerido acompanha o nome da etapa até o admin editar o campo;
- validação compartilhada entre navegador e servidor (`lib/novo-projeto.ts`), com mensagens em pt-BR ("Etapa 1: escreva pelo menos uma task.");
- a ação `criarProjeto` grava tudo numa transação: cliente novo, se houver, projeto, equipe, etapas e tasks. O id vem do nome, com sufixo se já existir;
- ajuste de texto: com "Projeto todo" selecionado na Participação, o aviso agora diz "Este projeto ainda não tem commits".

**Verificação (pela tela, no banco local):**
- salvar vazio mostra a lista do que falta;
- criei o "Portal do Aluno", para o cliente novo "Colégio Recife", com 2 etapas e 1 pessoa;
- a página abriu com "faltam 100 dias", uma etapa em andamento e outra "começa em 47 dias", e "Ainda sem commits";
- conferi as abas Sobre e Participação, o PDF, o card na lista e a página do membro;
- depois apaguei o projeto de teste.
