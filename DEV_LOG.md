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
