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

### Boletim semanal da empresa em PDF (18/11)

**O que a IA fez:**
- **`lib/boletim.ts`:** monta o boletim uma vez só, e ele serve ao PDF e ao e-mail:
  - semana do resumo mais recente;
  - números da semana: em andamento, atrasados, etapas paradas e commits;
  - projetos em andamento ordenados com os atrasados primeiro, cada um com os alertas e o resumo da IA;
  - lista dos concluídos.
- **`/exportar/boletim`:**
  - mesmo visual A4 do PDF do projeto;
  - as peças comuns (cabeçalho, caixas, seções do resumo) foram separadas em `components/exportar/folha.tsx`, para os dois documentos ficarem iguais;
  - o botão "Boletim da semana (PDF)" fica na tela de Projetos.

**Verificação:** a página abriu pela navegação do app com a semana de 09/11 a 15/11, os números (4 em andamento, 1 atrasado, 4 etapas paradas, 32 commits) e a Plataforma de Voluntariado em primeiro lugar, com os quatro alertas e o resumo.

### Boletim por e-mail (18/11)

**O que a IA fez:**
- **`lib/email.ts`:** HTML do e-mail com tabelas e estilos embutidos, o formato que os leitores de e-mail aceitam. Tem o mesmo conteúdo do boletim em PDF, mais um link para cada projeto e o botão "Ver o boletim em PDF". O envio é uma chamada direta à API HTTP do Resend, sem biblioteca, com timeout de 15 s.
- **Cron de sexta:** depois de gerar os resumos, monta o boletim lendo o banco direto e envia. O cache ainda teria os resumos antigos, por isso a leitura direta (`carregarResumos`, que agora também serve à versão com cache).
- **`npm run boletim:enviar`:** envia na hora. Com `--html arquivo.html`, só grava o e-mail para conferir.
- Sem `RESEND_API_KEY` ou `BOLETIM_PARA`, o envio é pulado com o motivo, sem quebrar o cron.

**Verificação:**
- gerei o HTML com os dados locais e conferi o visual no navegador (um ajuste: a coluna do prazo foi alargada para não quebrar a linha);
- sem a chave, o script avisa "boletim NÃO enviado: RESEND_API_KEY não configurada".

**Decisão sobre os destinatários (18/11):**
- **Limite:** sem domínio verificado, o Resend só envia para o e-mail da conta.
- **Opções analisadas com a IA:**
  - verificar um domínio no Resend;
  - trocar para o Brevo, que aceita só um remetente verificado;
  - manter como está.
- **Escolha:** manter, porque na demonstração o boletim chega no e-mail da conta, e isso basta para mostrar o envio automático.
- **Em produção:** o CITi verificaria o próprio domínio no Resend e definiria `BOLETIM_DE` e `BOLETIM_PARA`, sem mudar o código.

### Links do e-mail e volta depois do login (18/11)

**O que relatei:** o botão "Ver o boletim em PDF" do e-mail levava a uma página que não existia.

**Causa:** o link estava certo, mas a página `/exportar/boletim` ainda não estava publicada, porque os commits não tinham sido enviados ao GitHub. A IA conferiu: no site, `/exportar/boletim` e `/projetos/novo` davam 404.

**Problema que a IA encontrou junto:** quem abria um link do e-mail sem estar logado caía no login e, depois de entrar, ia para a lista de projetos, e não para o link.

**O que a IA fez:**
- **Destino guardado:** o redirecionamento para o login leva o destino (`/login?voltar=/exportar/boletim`), e depois de entrar a pessoa volta para ele.
- **Só destinos internos:** só caminhos do próprio site são aceitos. Um `?voltar=//outro-site` vai para `/projetos`, para o link não virar redirecionamento para fora.
- **Sair:** levava ao login em vez da página inicial, por uma disputa entre a proteção das páginas e o redirecionamento. Agora vai para a entrada.

**Verificação no navegador:**
- abrir `/exportar/boletim?origem=email` sem login → login com o destino guardado → depois de entrar, de volta ao boletim;
- `?voltar=//exemplo.com/x` → `/projetos`;
- login sem destino → `/projetos`;
- Sair → página inicial.

### Botão "Enviar por e-mail" no boletim (18/11)

**O que pedi:** um botão para enviar o relatório semanal por e-mail, ao lado de "Salvar como PDF".

**O que a IA fez:**
- ação do servidor `enviarBoletimAgora`, que monta o boletim com os dados do banco e usa o mesmo envio do cron;
- botão com os estados "Enviando…", "Boletim enviado para jv***@cin.ufpe.br" e mensagem de erro, se houver;
- **destinatários:** saem só da configuração do servidor (`BOLETIM_PARA`), para o botão não virar uma forma de mandar e-mail para qualquer endereço;
- a barra da versão de impressão (`BarraDeImpressao`) ganhou um espaço para ações extras, usado só no boletim.

**Verificação:** cliquei pela tela. O botão mostrou "Enviando…" e depois "Boletim enviado para jv***@cin.ufpe.br", e o Resend aceitou o envio.

## Melhorias visuais para a banca (18/11)

Escrevi um documento com as melhorias visuais e funcionalidades novas, em 5 blocos e em ordem de prioridade, com as regras da identidade do CITi. A IA trabalha bloco a bloco: apresenta o plano e espera o meu ok.

### Bloco 1: logotipo, base visual e duas correções

**O que pedi:**
- lockup "citi | LEGACY" no padrão de submarca do CITi;
- semáforo de status em três níveis;
- assinatura visual para tudo o que a IA gera;
- skeletons no lugar de "Carregando…";
- corrigir a Visão geral do GALT, parada em "Carregando…", e os gráficos apagados da Participação.

**Antes de escrever código**, a IA verificou os dados do Gantt (bloco 3) e investigou as duas falhas no site publicado.

**Decisões que tomei (a IA recomendou):**
- **Cores dos membros:** a paleta atual tem azul e rosa, que o documento proíbe. Ficou como exceção, só para identificar pessoas nos gráficos.
- **"Atenção" (âmbar):** projeto ainda no prazo, mas com alguma etapa atrasada ou parada.
- **PDF e e-mail:** o PDF ganhou o semáforo e a borda da IA. O e-mail só o rótulo "✦ Gerado por IA", porque gradiente falha em leitores de e-mail.
- **Corte:** o bloco 5 (membros) fica reduzido, para sobrar tempo para o vídeo e a documentação.

**O que a IA fez:**
- **Identidade:**
  - cores novas (vermelho `#FF3B3B`, roxo `#A78BFA`, borda em branco a 8%) e rótulo de seção em maiúsculas espaçadas;
  - botão secundário com fundo branco a 5% e borda a 25%; cards com cantos de 12px.
- **Logotipo:** componente `Lockup` em três tamanhos: o normal no cabeçalho, o pequeno no rodapé (e no Modo Reunião), o grande no login. A versão clara vai nas folhas em PDF e no e-mail.
- **Semáforo:** `nivelProjeto` e `nivelEtapa` (`lib/status.ts`) dão verde, âmbar ou vermelho a partir das regras que já existiam. Os selos do projeto viraram "No prazo", "Atenção", "Atrasado" e "Concluído", e barras, alertas, boletim e e-mail seguem a mesma cor.
- **Assinatura de IA:** borda de 1px em gradiente roxo→verde e o rótulo "✦ GERADO POR IA" em gradiente, no resumo do projeto e nos PDFs. Resumos feitos sem IA (por regras) não recebem a assinatura. Os títulos "O que andou" e "O que travou" ficaram verde e vermelho.
- **Skeletons:** os 9 "Carregando…" viraram blocos animados no formato de cada tela (`components/ui/esqueletos.tsx`).

**As duas correções (causa encontrada pela IA):**
- **GALT em "Carregando…":** o conteúdo já vinha pronto do servidor, mas o React só o põe na tela no próximo quadro de animação (`requestAnimationFrame`). Em aba em segundo plano esse quadro não acontece, e a página ficava presa no carregamento. Acontecia em qualquer projeto concluído aberto assim.
  - Correção: um temporizador aplica o conteúdo que estiver esperando (`useMostrarConteudoPendente`, em `components/layout/estrutura.tsx`).
- **Participação apagada:** a animação de entrada começava em opacidade 0 e, quando o navegador não animava, o bloco ficava transparente. As animações agora não mexem na opacidade e não seguram o estado inicial: se não rodarem, o conteúdo aparece completo.

**Verificação:**
- **Correção do GALT:** na versão de produção (`next build` + `next start`), simulei uma aba que não desenha bloqueando o quadro de animação. Sem a correção, a página ficou no skeleton; com ela, o conteúdo apareceu.
- **No navegador:** conferi lista de projetos, Visão geral, Participação, boletim e PDF do projeto.
- **E-mail:** gerei o HTML sem enviar (`npm run boletim:enviar -- --html`).
- **Código:** `tsc`, `eslint` e `next build` sem erros.

**Ajuste que pedi depois:** os marcadores (bolinhas) antes dos tópicos do resumo têm a cor do título da parte: verde em "O que andou", vermelho em "O que travou", branco (preto no PDF) em "O que fazer primeiro". Vale no app, nos PDFs e no e-mail. A IA também deixou as barras das etapas no PDF do projeto na cor do semáforo, que tinham ficado todas verdes.

### PDF em tema claro ou escuro (18/11)

**O que pedi:** poder gerar o PDF em modo claro ou escuro, com um botão para alternar, para eu ver qual prefiro e definir o padrão depois.

**O que a IA fez:**
- **Cores:** as cores das folhas (resumo do projeto e boletim) saíram do código e viraram uma paleta em variáveis CSS, com versão clara e escura. A escura usa a identidade do CITi: fundo escuro, texto branco, verde `#00DB58`, semáforo e borda da IA.
- **Botão "Claro | Escuro":** fica na barra da página (não sai no PDF). A escolha fica guardada no navegador.
- **Padrão:** escolhi o **escuro**, depois de comparar os dois PDFs. O tema escuro vale sempre que o claro não foi escolhido, inclusive antes de a página carregar o JavaScript (sem piscar o branco).

**Problema que a IA encontrou junto:** o PDF claro saía com faixas escuras nas margens entre as páginas. O navegador pinta as margens conforme o `color-scheme`, que no site é escuro. Na impressão, o tema claro agora usa `color-scheme: light`, e o escuro usa o mesmo tom nas margens e na folha, sem emenda.

**Verificação:**
- **PDFs:** gerei os dois PDFs nos dois temas com um Chromium sem janela e conferi as páginas. As margens ficaram brancas no claro e uniformes no escuro.
- **Navegador:** troquei o tema no boletim pela tela.

### E-mail no mesmo tema do PDF (18/11)

**O que pedi:** que o e-mail do boletim siga o modo escolhido (claro ou escuro).

**O que a IA fez:**
- **Cores:** o HTML do e-mail ganhou duas paletas, só com cores sólidas, porque leitores de e-mail lidam mal com transparência e gradiente. O e-mail também declara o esquema de cores, para o leitor não inverter as cores sozinho.
- **Botão "Enviar por e-mail":** envia no tema selecionado na barra do boletim. A mensagem de confirmação diz qual tema foi.
- **Cron de sexta:** envia no escuro, o padrão.
- **Link "Ver o boletim em PDF":** leva `?tema=`, e a página abre no mesmo tema do e-mail.
- **Script:** `npm run boletim:enviar` aceita `--tema claro|escuro`.

**Verificação:**
- **E-mail:** gerei o HTML nos dois temas, sem enviar, e conferi no navegador.
- **Link:** abri `/exportar/boletim?tema=claro`. A folha ficou clara, o botão marcou "Claro" e a URL foi limpa.

### Bloco 2: tela de Projetos com previsão de entrega (18/11)

**Verificação dos dados (antes do código):**
- **Data de conclusão das tasks:** não existia. A IA conferiu que todas as tasks feitas citadas nos dados fictícios têm um commit com o mesmo texto, de onde dá para tirar a data.
- **Simulação da previsão:** com essas datas, todos os projetos apareciam atrasados na previsão, porque a Infra/Deploy dura o projeto inteiro e conclui tasks devagar. Sem contraste para a banca.

**Decisões que tomei (a IA recomendou):**
1. **"Entregas na semana":** tasks concluídas nos últimos 7 dias.
2. **Datas fictícias:** ajustadas para ter contraste. A Folhagem fica no prazo; Clínica e Mezzalira um pouco fora; a Plataforma bem atrasada.
3. **Previsão e status:** a previsão entra no semáforo. Um projeto no prazo cuja previsão passa do prazo vira "Atenção".
4. **Botão "Apresentar":** fica para o bloco 4, com o Modo Reunião.

**O que a IA fez:**
- **Banco:** campo `feita_em` nas tasks. Marcar uma task grava a data de hoje; desmarcar apaga.
- **Gerador:** a data de cada task feita vem do último commit que a cita. Etapas com `recentes` no cenário têm um mínimo de tasks concluídas nas últimas 4 semanas (usado em 2 etapas da Folhagem).
- **`lib/previsao.ts`:**
  - ritmo = tasks das últimas 4 semanas ÷ 4;
  - previsão da etapa = hoje + restantes ÷ ritmo;
  - etapa sem ritmo fica "parada" e sem previsão;
  - previsão do projeto = a maior data entre as etapas abertas, e essa etapa é o gargalo.
- **Tela de Projetos:**
  - faixa com 4 indicadores (em andamento, atrasados em vermelho, tasks entregues na semana, commits na semana em verde);
  - cards com barra segmentada por etapa, "2 de 6 etapas · 70%", previsão ("prev. 16/12 · no prazo" em verde, "prev. 13/01 · +68 dias" em vermelho) e avatares da equipe nas cores dos gráficos;
  - borda vermelha nos atrasados e ordem atrasados → atenção → no prazo, com legenda abaixo da lista.
- **Boletim (PDF e e-mail):** o mesmo semáforo e a linha de previsão em cada projeto.
- **Celular:** os cards não estouram mais a largura, e o cabeçalho cabe numa linha (o nome do usuário some; o botão Sair fica).

**Resultado (hoje, 18/11):**

| Projeto | Status | Previsão |
|---|---|---|
| Plataforma de Voluntariado | Atrasado | 13/01, +68 dias |
| Clínica Movimento | Atenção | 30/12, +19 dias |
| Metalúrgica Mezzalira | Atenção | 13/01, +26 dias |
| Folhagem & Cia | No prazo | 16/12 |

**Verificação:** conferi as previsões direto do banco local, a tela no navegador (desktop e celular, 375 px sem rolagem lateral), `tsc` e `eslint`.

**Ajuste que pedi depois:** a Mezzalira aparecia com "+26 dias" em vermelho, mas nenhuma etapa vermelha ou âmbar explicava o atraso.

**Causa (a IA explicou):**
- **Gargalo artificial:** a Infra/Deploy dura o projeto inteiro e conclui tasks devagar. O ritmo das últimas 4 semanas (0,25 task por semana) projetava 8 semanas. Era um efeito da etapa longa, e não um problema real do projeto.
- **Barra e previsão desencontradas:** a barra mostrava o status de hoje, e a previsão, o futuro, sem ligar uma ao outro.

**O que mudou:**
- **Mezzalira:** a Infra/Deploy passou a ter 2 tasks recentes, como a da Folhagem. A previsão ficou em 16/12, no prazo. O projeto segue em "Atenção" pelo motivo real: etapas paradas, em âmbar na barra.
- **Barra:** uma etapa cuja previsão passa do prazo dela fica em âmbar (`nivelEtapa`). Vale para a barra dos cards e da Visão geral.
- **Card:** mostra o gargalo ("gargalo principal: Financeiro") quando a previsão passa do prazo. O rótulo era "gargalo"; pedi "gargalo principal".
- **Folhagem:** para continuar no prazo com a regra nova, os prazos fictícios de Estoque e de Pedidos foram adiados em uma semana (04/12 e 18/12).

**Resultado:**

| Projeto | Status | Previsão |
|---|---|---|
| Plataforma | Atrasado | +68 dias, gargalo Painel da ONG |
| Clínica | Atenção | +19 dias, gargalo Financeiro |
| Mezzalira | Atenção | no prazo; etapas paradas |
| Folhagem | No prazo | no prazo |

### Fundo com brilho verde e conteúdo mais largo (18/11)

**O que pedi:** melhorar o fundo, que estava chapado (preto uniforme e espaço sobrando nas laterais).

**O que a IA fez:**
- **Brilho:** um brilho verde suave (gradiente radial) no canto superior direito, fixo atrás do conteúdo, como no site do CITi. É um só por tela, como pede a identidade. Aparece nas telas internas e no login; fica fora da entrada, que tem foto de fundo própria, e da impressão.
- **Largura:** o conteúdo das telas internas foi de 1024 px para 1152 px (`max-w-6xl`), para sobrar menos preto em telas largas.

### Visual inspirado no site do CITi (18/11)

**O que pedi:** analisar o citi.org.br e ver o que dava para aproveitar, com uma prévia visual de cada recomendação antes de alterar.

**O que a IA encontrou:**
- **Mesma base:** o site usa a mesma paleta do Legacy (fundo `#0A0A0A`, verde `#00DB58`, pílulas).
- **Mais tratamento visual:** cabeçalho flutuante em pílula com vidro fosco; títulos em dois pesos ("Começamos pela **pergunta certa.**"); números enormes como destaque ("+30 anos"); seções com faixa verde-escura.
- **Contradição:** o site usa glassmorphism no cabeçalho, que o meu documento proibia. Decidi seguir o site.

**O que a IA fez (aprovei as 4 depois de ver a prévia):**
1. **Faixa verde-escura no topo** das telas internas e do login, no lugar do brilho no canto. Desce do verde ao fundo e rola com a página.
2. **Cabeçalho flutuante em pílula** com vidro fosco (`backdrop-blur`), solto do topo. O item ativo do menu é um botão verde sólido.
3. **Títulos em dois pesos** (`TituloPagina`), com um rótulo verde acima:
   - "Projetos **em andamento.**" (painel da semana, com as datas);
   - "Membros **do CITi.**";
   - "Novo **projeto.**"
4. **Indicadores grandes** (44 a 52 px, Inter Tight), com a palavra-chave em negrito ("**commits** na semana").

**Verificação:** conferi a tela de Projetos (1440 px e celular de 375 px, sem rolagem lateral), a Visão geral de um projeto e a entrada. No celular, o botão Sair estourava a pílula por 16 px; a IA ajustou os espaçamentos.

### Semana do painel e dados até o dia da entrega (18/11)

**O que perguntei:** se as datas do painel estavam certas e se batiam com os dados.

**O que a IA encontrou:**
- **Rótulo errado:** dizia "11/11 a 18/11" (8 dias), mas os números contavam de 12 a 18/11.
- **Duas semanas na tela:** o painel usava os últimos 7 dias; o resumo da IA e o boletim, a semana de 09 a 15/11. Por isso o boletim dizia 32 commits e o painel, 17.
- **Dados acabavam antes:** os commits fictícios terminavam em 16/11, então os "últimos 7 dias" já tinham 2 dias vazios, e os números mudariam no dia da entrega.

**Decisões (aprovei a recomendação):**
- **Mesma semana em todo lugar:** o painel usa a mesma semana do resumo e do boletim, a semana fechada mais recente. Os números vêm de `montarBoletim`, que ganhou a contagem de tasks entregues na semana.
- **Commits até 19/11, o dia da entrega.**

**Como a IA estendeu os dados sem estragar o que já estava calibrado:**
- **Primeira tentativa:** mudar a data de referência redistribuiu todos os commits e desfez as previsões ajustadas (a Mezzalira voltou a "+27 dias"). Descartada.
- **Solução:** o gerador acrescenta commits de ajuste em 17, 18 e 19/11 (`commitsAte` em `cenarios.mjs`) depois de gerar todo o resto. Assim, nada do que veio antes muda.
- **Só etapas ativas:** as que já estavam paradas continuam paradas.
- **Mensagens de ajuste:** os commits novos não citam tasks, então não mudam as datas de conclusão.

**Verificação:**
- **Previsões:** simulei com "hoje" em 18/11 e em 19/11 e a história se mantém. Plataforma atrasada (+68/+69 dias), Clínica em atenção (gargalo Financeiro, +19/+20), Mezzalira em atenção com etapa parada e previsão no prazo, Folhagem no prazo.
- **Commits:** de 09 a 16/11, os números por dia são os mesmos de antes.
- **Painel:** mostra "Semana de 09/11 a 15/11", 9 tasks e 32 commits, igual ao boletim.

### Bloco 3A: desfazer nas tasks, editar projeto e lixeira (18 e 19/11)

**O que pedi:**
- confirmação e "desfazer" ao marcar ou desmarcar task;
- editar e apagar projetos, com o nome do cliente digitado para confirmar;
- lixeira de 30 dias, com o link "Lixeira" aparecendo só quando houver algo nela.

**Decisões:**
- **Tasks:** cada marcação mostra um aviso com o efeito na etapa ("Estoque: 75% → 88%") e o botão **Desfazer**. Confirmação ("Tem certeza?") só quando a ação muda o status do projeto: marcar a última task (conclui) ou desmarcar num projeto concluído (reabre). A IA propôs assim para não travar quem marca várias tasks seguidas.
- **Apagar é uma ação grave:** pedi que o nome do cliente seja exigido **nos dois passos**, ao mover para a lixeira e ao apagar de vez. A IA tinha sugerido exigir só no "apagar de vez".
- **Etapas com commits:** não podem ser removidas na edição, só renomeadas, para não apagar o histórico de quem trabalhou nelas.

**O que a IA fez:**
- **Avisos:** no canto da tela, com ação (`lib/avisos.ts`, `components/ui/avisos.tsx`).
- **Janela de confirmação:** `<dialog>` nativo, com campo "digite o nome do cliente" que ignora maiúsculas e acentos (`components/ui/dialogo.tsx`). O servidor confere o nome de novo.
- **Menu "⋯" no cabeçalho do projeto:** "Editar projeto" e "Mover para a lixeira…".
- **Edição (`/projetos/editar/[id]`):** o formulário de novo projeto vem preenchido. As etapas mantêm o id, para os commits continuarem ligados a elas. Tasks com o mesmo título mantêm se estavam feitas e a data de conclusão.
- **Lixeira:**
  - coluna `apagado_em`; projetos na lixeira saem de listas, indicadores, boletim, e-mail e membros;
  - página `/projetos/lixeira` com Restaurar e Apagar de vez;
  - limpeza automática depois de 30 dias, no cron de sexta e a cada projeto movido para a lixeira.

**Verificação no navegador:**
- **Task:** marcar mostrou o aviso "Estoque: 75% → 88%", e Desfazer voltou a task.
- **Editar:** a Folhagem abriu com 5 etapas travadas (têm commits) e 1 removível. Salvei e o progresso continuou em 65%.
- **Mover para a lixeira:**
  - com "Folhagem" o botão ficou travado; com "folhagem & cia", liberou;
  - o projeto saiu da lista (3 em andamento, 24 commits na semana) e apareceu "Lixeira · 1";
  - surgiu o aviso com Desfazer.
- **Apagar de vez:** com o nome do cliente, a lixeira ficou vazia.

**Não testado:** a janela de confirmação ao concluir ou reabrir um projeto. Nenhum projeto de exemplo está a uma task de terminar.

**Incidentes:**
- **Servidor em loop:** o servidor de desenvolvimento entrou em loop de recompilação (a página recarregava sem parar), por causa de arquivos velhos em `.next`. Resolvido apagando `.next` com o servidor parado.
- **Resumos apagados no teste:** apagar a Folhagem de vez também apagou os resumos dela no banco **local**. A IA recarregou os dados e copiou os 4 resumos do Neon (só leitura), sem gastar chamadas à IA.

### Bloco 3B: Gantt com previsão na Visão geral (19/11)

**O que pedi:** a linha do tempo da seção 5 do meu documento, no topo da Visão geral.

**O que a IA fez (`components/projeto/gantt.tsx`):**
- **Cabeçalho:**
  - "Entrega prevista para DD/MM" (vermelho ou verde);
  - selo "X dias de atraso" ou "no prazo";
  - "prazo era DD/MM · ritmo das últimas 4 semanas";
  - **gargalo principal** à direita e brilho no canto do card (vermelho, verde ou âmbar).
  - Projetos concluídos mostram "Entregue em DD/MM" e a comparação com o prazo.
- **Uma linha por etapa:** nome e "quem mais sabe: Nome · XX%"; eixo de meses; linha de **hoje** com selo; traço branco no prazo de cada etapa.
- **Estados da barra:**
  - concluída: verde;
  - em execução: trilho até hoje, com o % em verde;
  - atrasada: faixa vermelha do prazo até hoje, contorno e selo "+X dias";
  - previsão: tracejado até a data prevista, vermelho ou verde;
  - parada: "sem previsão · parada há X semanas", em âmbar;
  - não iniciada: contorno tracejado.
- **Interação:** dica ao passar o mouse (início, prazo, %, tasks, previsão); o clique abre as tasks da etapa e rola até elas; as barras crescem na entrada.
- **Celular:** o gráfico rola dentro do card e já abre mostrando "hoje".
- **Reatividade:** como fica dentro da Visão geral, marcar uma task atualiza as barras e a previsão na hora.

**Verificação no navegador:**
- **Plataforma** (atrasada): "Entrega prevista para 14/01", "69 dias de atraso", gargalo principal Painel da ONG, faixas vermelhas com "+X dias".
- **Folhagem** (no prazo): 17/12, "no prazo" em verde.
- **Clínica:** 31/12, "20 dias de atraso", gargalo principal Financeiro.
- **GALT** (concluído): "Entregue em 20/03 · 7 dias depois do previsto".
- **Interação:** dica e clique conferidos; no celular, sem rolagem lateral na página.
- **Ajuste feito durante o teste:** os rótulos "prev. DD/MM" cortavam no fim do eixo, então a IA aumentou a folga.
- **Ajuste que pedi depois:** a dica da primeira etapa abria para cima e era cortada pela borda do gráfico. Agora, nas duas primeiras linhas, a dica abre para baixo.

### Previsão das etapas contínuas (Infra/Deploy) (19/11)

**O que propus:** usar a média do projeto como ritmo da Infra/Deploy, para ela não distorcer a previsão. Discutimos e deleguei à IA a escolha da melhor opção, com testes.

**O problema:** a Infra/Deploy dura o projeto inteiro e as tasks dela vêm em pulsos (CI no começo, deploy no fim). O ritmo das últimas 4 semanas sai baixo ou zero, o que gerava atraso falso ("+26 dias") ou "sem previsão · parada há 11 semanas".

**Opções testadas pela IA** (4 projetos × 3 datas: 19/11, 26/11 e 03/12):
- **A:** a etapa contínua usa o ritmo médio das outras etapas em execução.
- **B:** a etapa contínua fica fora da previsão ("acompanha o projeto").
- **C:** a etapa contínua usa o próprio ritmo, com janela de 8 semanas.

**Resultado:**
- **C** continuou gerando atraso falso (Folhagem e Mezzalira com +27 dias em 19/11).
- **A e B** deram a mesma previsão do projeto nos 12 cenários, e a Infra nunca virou gargalo falso.
- **A** mantém a informação de quanto falta na Infra; **B** esconde.

**Decisão da IA: opção A.**
- **Etapa contínua:** é a que tem a janela planejada cobrindo 80% ou mais do prazo do projeto. Hoje são só as 4 Infra/Deploy; a maior etapa comum, Estoque, cobre 69%.
- **Sem média disponível:** se nenhuma outra etapa tem ritmo, usa o próprio ritmo e pode aparecer como parada.
- **Na tela:** o Gantt mostra "prev. DD/MM · média", e a dica explica "etapa contínua: ritmo médio das outras etapas".

**Resultado nos dados:** a previsão de nenhum projeto mudou. A Infra/Deploy ganhou data própria:

| Projeto | Previsão da Infra/Deploy |
|---|---|
| Folhagem | 03/12 |
| Clínica | 12/12 |
| Mezzalira | 12/12 |
| Plataforma | 17/12 (antes: "parada há 11 semanas") |

### Ícone de casa no cabeçalho (19/11)

**O que pedi:** um símbolo de casa no cabeçalho, levando à página inicial (a entrada do site).

**O que a IA fez:**
- **Ícone:** casa em traço (`IconeCasa`) à direita de "Membros" (pedi para mudar de lugar; antes ficava antes de "Projetos"), com o rótulo "Página inicial" para leitores de tela.
- **Celular:** o ícone empurrava o botão Sair para fora da pílula, então o lockup ficou um pouco menor no celular (logo de 24 px e texto de 10 px). O tamanho no computador não mudou.

**Verificação:** desktop e celular de 375 px, sem rolagem lateral.

### Bloco 4: Modo Reunião (19/11)

**O que pedi:** transformar os dados do app numa apresentação pronta para a reunião semanal da diretoria (seção 7 do documento). Aprovei as três recomendações da IA:
- **Frase principal de cada projeto:** o que travou, para atrasados e em atenção; o que andou, para os no prazo.
- **Responsáveis nas prioridades:** encontrados pelos nomes da equipe citados no texto.
- **Tela cheia:** botão e tecla F.

**O que a IA fez:**
- **Entrada:** botão **"▶ Apresentar"** na tela de Projetos, que abre `/reuniao`. A rota ocupa a tela inteira, sem cabeçalho nem rodapé, e continua exigindo login.
- **Slides:** montados no servidor com os dados que já existem: a mesma semana do painel e do boletim, a previsão e os resumos da IA, **sem nova chamada à IA**.
  1. **Capa:** "Semana de 09/11 a 15/11." e os 4 indicadores grandes.
  2. **Panorama:** um projeto por linha, com barra por etapa, selo e previsão.
  3. **Um slide por projeto** (atrasados → atenção → no prazo):
     - selo, nome, cliente e % concluído em destaque;
     - etapas atrasadas, commits na semana e quem mais sabe;
     - **Gantt compacto**: as mesmas regras, sem rótulos de data;
     - a previsão e a frase principal com o rótulo "✦ IA".
  4. **Prioridades da semana:** até 2 itens "O que fazer primeiro" por projeto, com as iniciais coloridas de quem é citado.
- **Navegação:** ← → e espaço, Home e End, **Esc** volta para Projetos, **F** para tela cheia; botões em pílula, barra de progresso e fade entre slides.
- **Escala:** o slide é desenhado numa tela fixa de 1280 × 720 e escalado inteiro para o espaço disponível, como num programa de apresentação.

**Problema que a IA encontrou e corrigiu:** na primeira versão, o tamanho dos textos acompanhava a largura, mas o Gantt tinha medidas fixas. Em janelas menores, ele invadia a previsão e o quadro da IA. A tela fixa escalada resolveu.

**Verificação no navegador:**
- **Slides:** todos os 7 conferidos numa janela de 736 px.
- **Teclado:** ←, →, Home e End funcionaram; Esc voltou para `/projetos`.
- **Ajuste durante o teste:** a lista de prioridades encostava no logo do rodapé; a IA diminuiu os espaços.

**Não testado:** a tela cheia (tecla F). O navegador só a permite quando a pessoa clica ou aperta a tecla de verdade, o que o teste automático não faz.

### Modo Reunião em PDF (19/11)

**O que pedi:** exportar a reunião como PDF.

**O que a IA fez:**
- **Botão e tecla:** "Exportar PDF (P)" nos controles da apresentação, mais a tecla **P**. Os dois abrem a impressão do navegador ("Salvar como PDF").
- **Formato:** na impressão aparecem **todos os slides, um por página de 1280 × 720 (16:9)**, com o mesmo visual da tela (fundo escuro, brilho, topo com data e "slide X / N", marca e barra de progresso). Isso usa uma página nomeada no CSS (`@page slide`), sem afetar o PDF A4 dos resumos e do boletim.
- **Animações:** ficam desligadas na impressão. Sem isso, as barras do Gantt sairiam vazias, porque a impressão capturaria o começo da animação.

**Verificação:** gerei o PDF com um Chromium sem janela: 7 páginas de 960 × 540 pt (16:9), com a capa, o panorama, os 4 projetos (Gantt completo) e as prioridades.

**Ajuste que pedi depois:** exportei pelo Firefox e o PDF saiu em A4 em pé: cada slide no topo da folha, cortado à direita, com o resto da página em branco.

**Causa:** o tamanho 16:9 estava numa "página nomeada" do CSS (`@page slide`), que o Firefox não aplicou; ele usou a regra geral de A4.

**Correção:** o próprio componente da apresentação define `@page { size: 1280px 720px; margin: 0 }` e o fundo escuro só enquanto `/reuniao` está aberto. Como vem depois da regra A4, ela vale nessa tela; os PDFs de resumo e boletim continuam em A4.

**Verificação:** conferi de novo no Chromium (7 páginas em 16:9). No Firefox, a IA não conseguiu gerar o PDF sem janela; a conferência fica para eu exportar de novo.

**Nome do arquivo:** pedi que o PDF se chamasse algo como "reunião da diretoria semana x a y". O título da página, que vira o nome do arquivo, agora é "Reunião da diretoria - semana 09-11 a 15-11", calculado a partir da semana do boletim. As datas usam hífen porque o navegador troca "/" por "_" no nome do arquivo.

**Ajuste que pedi depois:** no PDF exportado pelo Firefox, a caixa de texto da IA vinha com defeito.

**Causa (a IA analisou o meu PDF):**
- **Texto pixelado:** o rótulo em gradiente ("✦ IA · O QUE TRAVOU", "✦ DOS RESUMOS DA IA") usa texto recortado do fundo (`background-clip: text`), que na impressão o Firefox transforma em imagem de baixa resolução.
- **Gradiente cortado:** o gradiente ocupava a caixa inteira, então o rótulo curto mostrava só o roxo do começo.

**Correção:**
- **Na impressão:** o rótulo da IA sai em verde sólido, como texto de verdade (nítido e selecionável), igual ao e-mail. A borda em gradiente continua.
- **Na tela:** o gradiente agora cobre só a largura do texto e vai do roxo ao verde.
- **Alcance:** vale para todos os PDFs (reunião, resumo do projeto e boletim).

**Verificação:** gerei o PDF de novo. O rótulo virou texto extraível ("✦ IA · O QUE TRAVOU") e aparece nítido no recorte ampliado.

### Modo Reunião por e-mail (19/11)

**O que pedi:** um envio por e-mail à esquerda de "Sair", na apresentação.

**O que a IA fez:**
- **Botão:** "Enviar por e-mail" nos controles da apresentação. Os destinatários são os mesmos do boletim (`BOLETIM_PARA`), vindos só do servidor.
- **E-mail próprio da reunião** (tema escuro, como a apresentação):
  - assunto "Reunião da diretoria · semana 09/11 a 15/11";
  - os 4 indicadores e o panorama (projeto, status, % e previsão);
  - as **prioridades da semana** com o projeto e as pessoas citadas;
  - botão "Abrir a apresentação", com a dica de que a tecla P exporta em PDF.
- **Código compartilhado:** a lógica das prioridades e da frase principal foi para `lib/reuniao.ts`, usada pela apresentação e pelo e-mail. O envio pelo Resend virou uma função comum (`enviarEmail`) para o boletim e a reunião.

**Verificação:** conferi o HTML do e-mail no navegador e fiz um envio real pelo botão: "Enviado para jv***@cin.ufpe.br."

### Marcar reunião com convite e link da agenda (19/11)

**O que pedi:** que o envio por e-mail da apresentação virasse "marcar a reunião": uma janela com data e horário e, se possível, conexão com a agenda.

**Decisão:**
- **Opções:** a IA propôs anexar o convite padrão (.ics) e o link "Adicionar ao Google Agenda". A integração oficial com o Google Calendar ficou de fora: exige login com Google e autorização revisada pelo Google, sem tempo para isso hoje.
- **Escolha:** pedi **só o link** do Google Agenda.

**O que a IA fez:**
- **Botão "Marcar reunião"**, no lugar de "Enviar por e-mail", abre uma janela com:
  - data (sugestão: o próximo dia útil) e horário (sugestão: 14h);
  - duração (30 min, 1h ou 1h30);
  - local ou link e recado, opcionais;
  - os destinatários com o e-mail parcialmente oculto.
- **Convite por e-mail:**
  - assunto "Convite: Reunião da diretoria · sex 20/11, 14h00";
  - bloco "Você foi convidado" com data, horário, local, recado e o botão **"Adicionar ao Google Agenda"**;
  - embaixo, a pauta da semana (indicadores, panorama e prioridades) e o link da apresentação.
- **Para quem marcou:** a tela mostra a confirmação e o mesmo link da agenda.
- **Link da agenda:** abre o Google Agenda com o evento preenchido (título, horário de Recife, local e o link da apresentação), sem login nem permissão especial.
- **Atalhos:** com a janela aberta, os atalhos da apresentação ficam desligados. Sem isso, digitar "p" no recado abriria a impressão.
- **Código:** a lógica do convite (validação, textos de data e link da agenda) está em `lib/convite.ts`.

**Verificação no navegador:**
- **Janela:** abriu com 20/11 às 14h e 1h. Preenchi local e recado; os "p" digitados não dispararam a impressão.
- **Envio:** um convite real foi enviado: "Convite para sex, 20/11 · 14h00 às 15h00 enviado para jv***@cin.ufpe.br."
- **Link da agenda:** saiu com `dates=20261120T140000/20261120T150000`, `ctz=America/Recife` e o local.

**Ajuste que pedi depois:** retirar o sigilo dos e-mails. Os destinatários agora aparecem por extenso ("jvgvg@cin.ufpe.br") na janela "Marcar reunião" e nas confirmações de envio do convite e do boletim. A função `destinatariosMascarados` virou `destinatarios`.

**Seleção no "Para" (pedi a opção 1 entre as que a IA apresentou):**
- **Seleção:** o "Para" da janela virou uma lista de seleção com os endereços configurados em `BOLETIM_PARA`, todos marcados. Dá para desmarcar quem não deve receber.
- **Segurança mantida:** o servidor só aceita endereços que estão na configuração. A tela escolhe entre eles; não dá para mandar para um endereço qualquer. Para ter mais opções, basta incluir mais e-mails separados por vírgula na configuração.
- **Opções descartadas:** "membros do CITi" (os dados fictícios não têm e-mail das pessoas) e "campo livre" (o app viraria um disparador de e-mail).

**Verificação:** a lista mostra "jvgvg@cin.ufpe.br" marcado; com tudo desmarcado, o envio é bloqueado com "Escolha pelo menos um destinatário."

**Ajuste que pedi depois:** bloquear o envio se ninguém estiver selecionado. O botão "Enviar convite" fica desativado sem destinatário, e aparece o aviso "Selecione pelo menos um destinatário para enviar." A janela de confirmação (`Dialogo`) ganhou a opção `bloqueado`. O servidor continua recusando o envio sem destinatário.

**Verificação:**
- **Botão:** marcado, ativo; desmarcado, desativado e com o aviso; marcado de novo, ativo.
- **Atalhos:** a IA conferiu também que Esc e P apertados dentro da janela não saem da apresentação nem abrem a impressão.

### Bloco 5: membros (19/11)

**O que pedi:**
- seguir as recomendações da IA (cargo = papel no projeto mais recente, calendário com todo o período rolando na horizontal, sem o alerta de carga, que ninguém dispararia nos dados);
- avatares no **verde do CITi** para todos, em vez de uma cor por pessoa;
- ícones de **e-mail, LinkedIn e GitHub**, deixando claro ao passar o mouse que é protótipo;
- membros editáveis e apagáveis como os projetos, com confirmação **menos incisiva** (só uma caixa) e lixeira no mesmo formato;
- **quem tem commits não pode ser apagado**: a única mudança possível é virar ex-membro;
- um botão **"+ Adicionar membro"**.

**O que a IA fez:**
- **Lista:** avatar verde com iniciais, cargo, "No CITi desde", nº de projetos e minibarra do maior IC. O botão "+ Adicionar membro" fica ao lado do título; o link "Lixeira · N" só aparece com itens.
- **Perfil:**
  - cabeçalho com avatar grande, cargo, selo "Ex-membro" e contatos;
  - 3 indicadores: commits, etapas em que é referência e projetos atrasados (em âmbar se houver);
  - **calendário de contribuições** em 4 tons, com dica de data e commits, legenda "menos → mais" e abertura na parte mais recente;
  - **"Referência em"**, com barra de IC;
  - os cards de projeto de antes.
- **Contatos:** os ícones parecem links, mas não abrem nada. A dica diz "Protótipo. No app real, abriria o LinkedIn de Helena Duarte". Nenhum endereço fictício foi inventado.
- **Menu "⋯" do perfil:** "Editar membro" e "Mover para a lixeira…". Para quem tem commits, a opção de apagar fica desativada com a explicação "tem commits nos projetos; para registrar a saída, marque como ex-membro". O servidor confere a mesma regra.
- **Formulário (adicionar e editar):** nome, mês de entrada e "Ex-membro" com a data de saída.
- **Lixeira de membros** (`/membros/lixeira`):
  - Restaurar e Apagar de vez, com a confirmação de uma caixa ("Entendo que…");
  - limpeza automática em 30 dias, no mesmo cron;
  - quem está na lixeira sai da lista e das equipes dos projetos.
- **Banco:** coluna `apagado_em` em `pessoas`.

**Verificação no navegador:**
- **Lista:** avatares verdes, cargos e barras de IC.
- **Perfil da Helena:** 78 commits, 4 etapas como referência; calendário e dica de protótipo conferidos; o menu bloqueia o apagar porque ela tem commits.
- **Fluxo completo com um membro de teste:** adicionar → mover para a lixeira (o botão só libera com a caixa marcada) → "Lixeira · 1" → apagar de vez (lixeira vazia).
- **Edição:** a página abre preenchida, com Marcos Vilela como ex-membro desde 15/07/2026.


**Ajustes que pedi depois:**
- **Foto:** a foto do perfil vem do GitHub quando ele está vinculado.
- **Contatos na edição:** campos para os links e o e-mail das redes no formulário do membro.

**O que a IA fez:**
- **Banco:** colunas `email`, `linkedin` e `github` em `pessoas`.
- **Formulário de membro:** ganhou a seção "Contatos (opcional)". O LinkedIn aceita o link ou o nome do perfil e vira o endereço completo; o GitHub aceita o usuário ou o link e guarda só o usuário.
- **Avatar:** com GitHub preenchido, mostra a foto `github.com/<usuário>.png`. Se a foto não carregar, voltam as iniciais no verde do CITi.
- **Ícones:**
  - com o contato cadastrado, viram links de verdade (e-mail, perfil do LinkedIn, perfil do GitHub), e a dica mostra o endereço;
  - sem cadastro (todos os membros fictícios), a dica diz "Protótipo. Sem LinkedIn cadastrado para … Cadastre em ‘Editar membro’".

**Verificação:**
- **Membro de teste:** cadastrei com e-mail de exemplo, LinkedIn e o GitHub de demonstração do próprio GitHub (`octocat`). A foto carregou no avatar, e os três ícones viraram links (`mailto:`, `linkedin.com/in/…` e `github.com/octocat`; o link colado do GitHub foi guardado como usuário).
- **Lixeira de membros:** testei também o **Restaurar** (lixeira → restaurar → o perfil voltou) e depois apaguei o membro de teste de vez.

### Repositório do GitHub funcional (19/11)

**O que pedi:**
- **Primeiro:** só o visual de "linkar o repositório" no novo projeto. Mudei de ideia: **fazer funcional**.
- **Depois:** pedi a melhor opção gratuita, mesmo que trabalhosa.

**Opções que a IA comparou:**

| Opção | Resultado |
|---|---|
| Sem token | 60 consultas/hora; mal dá para uma sincronização |
| **Token pessoal (PAT)** | 5.000 consultas/hora, grátis |
| **Webhook do repositório** | O GitHub avisa o app a cada `push`: tempo real, grátis |
| GitHub App | O caminho de produção para várias organizações; mais configuração |

**Escolha:** token + webhook. O GitHub App fica como "o caminho em produção" na documentação.
- **Token:** fine-grained, "Only select repositories", **Contents: read-only** (vale para repositórios privados também).
- **Configuração:** criei o token e o webhook e cadastrei `GITHUB_TOKEN` e `GITHUB_WEBHOOK_SECRET` no `.env.local` e na Vercel (Production e Preview). A IA nunca viu os valores.

**O que a IA fez:**
- **Projeto:** campo "Repositório no GitHub" no formulário (novo e edição), conferido na hora pela API. Colunas `repositorio` e `sincronizado_em` em `projetos`.
- **`lib/github.ts`:** lê os commits pela API REST (os últimos 100; depois só os novos, em lotes de 10), com mensagens claras para repositório inexistente, token recusado e limite atingido. Também confere a assinatura do webhook (HMAC SHA-256, comparação em tempo constante).
- **`lib/sincronizar.ts`:**
  - **autor:** ligado ao membro pelo **usuário do GitHub** do perfil. Quem não tem cadastro fica de fora e é informado; um membro cadastrado com commits entra na equipe como "Colaborador (via GitHub)";
  - **etapa:** pelos caminhos (glob com `**` e `*`);
  - **data:** no horário de Recife;
  - **linhas efetivas:** aproximadas por adicionadas − removidas.
- **Onde a sincronização roda:**
  - botão **"Sincronizar"** no cabeçalho do projeto, com o repositório e "sincronizado há X";
  - ao salvar o projeto com repositório novo;
  - no **webhook** `/api/github/webhook` (ping e push);
  - no cron de sexta, antes dos resumos.
- **GitHub único:** o mesmo usuário do GitHub não pode estar em dois membros. Isso apareceu no teste: com dois perfis com o mesmo GitHub, não dava para saber de quem eram os commits.

**Verificação** (com o próprio repositório deste projeto, `joaovgalvao1/citi-legacy`, num projeto e membro temporários no banco local):
- **Sincronização:** 49 commits reais em 3,6 s; a segunda vez trouxe 0 novos.
- **Etapas:** distribuição por caminho correta (components 39, app 37, lib/data/db 29, scripts 11); 3 commits fora de qualquer etapa.
- **Telas:** o cabeçalho mostra o repositório; a Participação mostra os 49 commits da semana e o IC; o botão Sincronizar respondeu "0 commits novos".
- **Webhook:** sem assinatura ou com assinatura errada, recusado; ping e push assinados, aceitos (o push sincronizou o projeto ligado).
- **Limpeza:** o projeto e o membro temporários foram apagados do banco local.

**Não testado:** o webhook chamado pelo GitHub de verdade, que só alcança o site publicado. Fica para depois do push.

**Problemas que encontrei ao criar o projeto "CITi Legacy" no app (vinculado ao próprio repositório):**
1. **Etapas sem commits:** todas as etapas apareciam como "ainda sem commits". Os caminhos tinham sido salvos com `src/` (`src/app/**`), mas este repositório não tem pasta `src`. Mesmo corrigindo os caminhos, os commits já sincronizados não seriam reclassificados.
2. **Previsão absurda:** "Entrega prevista para 14/01 (+56 dias)". A etapa "Entrega do desafio" tinha 2 dias e 1 task feita, e o ritmo dividia por 4 semanas fixas (0,25 task por semana → 8 semanas).

**Correções (a IA propôs e eu aprovei):**
- **Ritmo:** etapa com menos de 4 semanas divide as tasks feitas pelo tempo desde o início dela (mínimo 1 dia). Nos projetos de exemplo nada mudou, porque as etapas abertas têm mais de 4 semanas. A do CITi Legacy foi para **23/11 (+4 dias)**.
- **Reclassificação:** ao editar o projeto, se os caminhos de alguma etapa mudam (ou etapas entram ou saem), os commits já gravados são reclassificados pelos arquivos que alteraram (`reclassificarCommits`).
- **Sugestão de caminho:** sem o `src/` fixo (`telas/**`). A dica do campo explica que são as pastas do repositório como estão no GitHub (ex.: `app/**`).

**Verificação:** previsões recalculadas para 19/11; os 6 projetos de exemplo ficaram iguais, e o CITi Legacy deu 23/11.

**Resumo da IA do projeto CITi Legacy (banco local):**
- **Aviso da IA:** os resumos são semanais, e o painel, o boletim e a reunião usam a semana do resumo mais recente. Um resumo da semana 16/11 só para o CITi Legacy mudaria a semana de tudo e deixaria os outros projetos sem resumo.
- **Escolha:** pedi a opção B, que gera a semana **16/11 a 22/11 para os 5 projetos em andamento** (5 pedidos à IA), como o cron de sexta faria.
- **Execução:** o Gemini estava sobrecarregado (503) em 2 projetos, que caíram no resumo automático por regras. A IA esperou 30 s e refez só esses dois. Os 5 ficaram gerados pela IA.
- **Resumo do CITi Legacy:** citou as 4 etapas concluídas e a "Entrega do desafio" com Documentação e Vídeo do pitch pendentes.
- **Painel local:** passou para a semana 16/11 a 22/11 (5 projetos, 14 tasks e 77 commits, incluindo os 49 reais).

### Geração semanal dentro dos limites da IA (19/11)

**O que pedi:** limitar quantos resumos são gerados por vez, de acordo com os limites da API, porque gerar todos de uma vez sobrecarrega a IA.

**O que a IA encontrou:**
- **Sem pausa:** o cron pedia os resumos um atrás do outro, e na primeira falha (503 sobrecarregado ou 429 limite) caía direto no resumo automático (regras).
- **Tempo da função:** cada tentativa podia passar por 3 modelos com 15 s de espera cada, e uma função da Vercel no plano gratuito tem 60 s.

**O que a IA fez (`lib/resumo.ts`, cron):**
- **Ritmo:** no máximo 1 pedido à IA a cada 4,5 s (≈13 por minuto, abaixo dos 15 por minuto do Gemini gratuito), ajustável por `IA_INTERVALO_MS`. Vale para cada pedido, inclusive para cada modelo tentado.
- **Novas tentativas:** se a IA falhar, tenta de novo depois de 10 s e de 25 s antes de cair no resumo automático. Sem chave configurada, não repete.
- **Prazo:** cada pedido só começa se houver tempo de terminar antes do prazo da execução (`definirPrazoIA`). O cron usa 55 s dos 60 s da função (`maxDuration = 60`).
- **Cron em duas etapas** (`vercel.json`):
  - **23h00:** sincroniza o GitHub, limpa a lixeira e gera os resumos que couberem no tempo;
  - **23h30** (`?etapa=pendentes`): gera os que ficaram pendentes (sem resumo ou com o automático) e **só então envia o boletim**, com os resumos completos.
- **Sem gasto repetido:** projeto que já tem o resumo da semana feito pela IA é pulado (`resumoPronto`). Repetir o cron não gasta pedidos à toa.

**Verificação:**
- **Pular resumos prontos:** com os resumos da semana 16/11 já gerados, todos os 7 projetos foram pulados; uma semana sem resumo aparece como pendente.
- **`maxDuration`:** conferido na documentação do Next desta versão (compatível com Cache Components).
- **Não testado:** a rota do cron, porque o `CRON_SECRET` só existe na Vercel.

### Roda do CITi e Órbita de colaboração (19/11)

**O que pedi:**
- Uma visualização em círculo na página de membros, com as pessoas ao redor e uma interação que gira os membros. Pedi à IA para idealizar e mostrar visualmente antes.
- Depois do protótipo: fazer as duas ideias (roda na lista e órbita no perfil), manter o formato antigo como modo de visualização, ter a roda também para quem já saiu e um filtro por projeto.

**O que a IA propôs:**
- Um protótipo interativo com os dois conceitos.
- **A, Roda do CITi:** os membros em volta de um círculo, com quem está no topo em destaque no centro.
- **B, Órbita de colaboração:** a pessoa no centro e os colegas mais perto quanto mais trabalharam juntos.

**O que a IA fez:**
- **`components/membros/roda.tsx`** (componente reutilizável):
  - **Giro:** arrastando (mouse ou toque), com a roda do mouse, com as setas ← →, pelos botões ou clicando num avatar, que gira até o topo. Enter, ou clicar no avatar em foco, abre o perfil.
  - **Profundidade:** quem está longe do topo fica menor e mais apagado.
  - **Animação:** só com transições de CSS, sem depender de `requestAnimationFrame`.
- **`/membros`:**
  - modos **Roda | Lista** (a lista é o formato antigo, com os cards);
  - **filtro por projeto**: no filtro, o centro e os cards mostram o papel e o IC naquele projeto;
  - as abas **Na empresa / Já saíram** e a busca valem para os dois modos; ex-membros aparecem em cinza na roda.
- **Perfil** (`components/membros/orbita.tsx`): "Órbita de colaboração", ao lado de "Referência em".
  - **Colaboração:** conta os commits de cada colega nas mesmas etapas em que a pessoa trabalhou, nos projetos em comum.
  - **Distância e linha:** quanto mais commits, mais perto do centro e mais grossa a linha.
  - **Navegação:** clicar no colega em foco abre a órbita dele.

**Verificação no navegador** (desktop 1280 px e celular 375 px):
- giro por botão, teclado, clique e arraste;
- filtro por projeto (GALT mostra 2 ex-membros na aba "Já saíram");
- alternância Roda/Lista;
- órbita da Helena (Davi mais perto, com 53 commits nas mesmas etapas).
- **Correção (botões × arraste):**
  - **Bug:** quando o "soltar" do mouse se perdia (por exemplo, ao soltar fora da área ou da janela), a roda continuava em modo arraste. Ela seguia o mouse sem botão apertado, ficava sem animação e brigava com os botões ← →.
  - **Correção:** o arraste agora termina também quando o mouse se move sem botão apertado, quando a captura do ponteiro se perde ou quando o navegador inicia um arraste nativo de link. O bloqueio de clique depois de arrastar vale só para o clique imediato.
- **Setas reposicionadas:** saíram de baixo da roda e foram para as laterais, centralizadas na altura (no celular, ficam nos cantos de baixo, onde a roda não ocupa espaço). Viraram botões redondos maiores e mais fáceis de acertar. O contador "N / total" ficou abaixo da roda.
- **Perfil reorganizado:** Projetos (agora em um card, com os projetos empilhados) e "Referência em" ficam lado a lado, e a Órbita de colaboração fica embaixo, centralizada (até 768 px de largura). No celular, tudo empilha.

### Nova página de entrada (19/11)

**O que pedi:** atualizar a página inicial com o contexto de todas as mudanças (identidade visual, interface, funcionalidades). Ela é a porta de entrada e o marketing do produto, então precisa chamar a atenção.

**O que a IA encontrou:** a página ainda mostrava só os 4 recursos da primeira versão, com o visual antigo (títulos todos em negrito, sem a faixa verde, prévia simples). Ficavam de fora:
- o semáforo e a previsão de entrega;
- o Gantt;
- o modo reunião e o PDF;
- o boletim e o convite de agenda;
- o GitHub;
- a roda e a órbita de membros.

**Plano aprovado e feito:**
- **Destaque:**
  - título no estilo do app ("Todo projeto deixa um **legado.**"), com texto fino e destaque verde;
  - faixa verde e o fundo da identidade do CITi;
  - botão "Entrar" com brilho e selos (GitHub, IA toda sexta, modo reunião em PDF);
  - à direita, uma vitrine: card de projeto com semáforo (Atenção), barra de etapas, previsão e gargalo principal, resumo da IA com a borda roxo e verde, e um mini Gantt com "hoje" e o atraso previsto tracejado;
  - em volta, uma órbita de pessoas sem nome girando devagar.
- **Números reais agregados:**
  - projetos em andamento, com a contagem por cor do semáforo;
  - concluídos, pessoas, commits;
  - resumos escritos pela IA.
- **Grade de recursos "Tudo o que a diretoria precisa numa sexta":** semáforo e previsão, resumo com IA, quem sabe o quê (IC e órbita), modo reunião (miniatura 16:9, teclas e PDF), boletim e convite, e o fluxo do GitHub (push, webhook assinado, commits por etapa, painel). Cada bloco tem uma mini ilustração em HTML.
- **Como funciona:** 3 passos (cadastrar o projeto, conectar o GitHub, receber a sexta pronta).
- **Legado:** "Quando alguém sai, o conhecimento fica", com dois números reais: ex-membros e etapas em que quem mais sabia já saiu.
- **Chamada final:** card verde com o logo grande e o botão de entrar.
- **Privacidade e movimento:** nenhum nome de projeto, cliente ou pessoa aparece (as ilustrações usam conteúdo genérico, e os nomes são ocultados com •••). As animações param com "reduzir movimento".
- **Cabeçalho:** a faixa verde agora aparece em todas as telas, e o cabeçalho e o rodapé têm a mesma largura em todas as telas.
- **Removido:** `components/entrada/previa.tsx`, a prévia antiga.

**Verificação:**
- **Desktop (1280 px) e celular (375 px):** sem rolagem lateral, e a vitrine cabe no celular.
- **Ajuste:** o rótulo "hoje" do mini Gantt encostava no título e foi afastado.

### Projeto CITi Legacy no banco hospedado (19/11)

**O que pedi:** criar no banco hospedado (Neon) o projeto CITi Legacy, que até então só existia no banco local.

**O que a IA fez:**
- **Conferência (só leitura):** o Neon já tinha as colunas novas (repositório, GitHub do membro, lixeira, `feita_em`), mas não tinha o projeto nem o membro.
- **Cópia do banco local para o Neon:** um script provisório, que só insere e não sobrescreve nada, rodou primeiro como simulação e depois gravou:
  - o cliente CITi;
  - o membro João Vitor Godoy (GitHub joaovgalvao1);
  - o projeto, com 5 etapas e 16 tasks;
  - a equipe;
  - 49 commits;
  - o resumo da IA da semana 16/11.
- **Sincronização:** com o novo `npm run banco:sincronizar -- [projetoId]` (`scripts/sincronizar.ts`), mais 10 commits novos vieram do GitHub, totalizando 59.
- **Cache do site:** o próximo push dispara o webhook, que atualiza o cache dos dados no site (antes do projeto existir no Neon, o webhook não tinha a que se ligar).
- **Resumos da semana 16/11 no Neon:** no site, só o CITi Legacy tinha o resumo da semana nova; os outros 4 projetos em andamento estavam com o de 09/11, porque os resumos gerados pela IA na noite de 18/11 só foram gravados no banco local. Os 4 foram copiados para o Neon (só inserção, sem nova chamada à IA). O cache do site se renova sozinho em algumas horas.

### Resumos no domingo, reunião na segunda (19/11)

**O que pedi:** mudar a geração dos resumos de sexta para domingo, para a reunião da diretoria poder acontecer na segunda, e revisar todas as datas do código.

**O que a IA fez:**
- **Cron** (`vercel.json`): de sábado 02h/02h30 UTC (sexta 23h/23h30 em Recife) para segunda 02h/02h30 UTC (**domingo 23h/23h30 em Recife**). Agora o resumo cobre a semana inteira, de segunda a domingo; antes, os commits de sábado e domingo ficavam de fora.
- **Bug evitado na semana do resumo:**
  - **Problema:** o cron calculava a semana pela data UTC. Domingo 23h em Recife já é segunda em UTC, então o resumo seria gravado para a semana nova, que ainda está vazia.
  - **Correção:** a semana agora é calculada pelo horário de Recife.
  - **Simulação:** a execução de 23/11 02h UTC cai na semana de 16/11.
- **Convite da reunião:** a data sugerida passou de "próximo dia útil" para **a próxima segunda** (`proximaSegunda`).
- **Textos** trocados de sexta para domingo ou segunda:
  - página inicial (o selo da IA, "Tudo o que a diretoria precisa **na segunda.**", "Chegue pronto na segunda", "domingo · 23h", a mini ilustração do convite "segunda, 14h");
  - avisos de "o primeiro resumo sai no próximo domingo" (visão geral, resumos, PDF do projeto);
  - rodapé do boletim (PDF e e-mail);
  - comentários do código e README.
- **Sem mudança:** a semana de segunda a domingo e a escolha da semana mais recente com resumo para o painel e o boletim. Na segunda, a reunião mostra a semana que acabou de fechar.

### Textos da página inicial: foco no acompanhamento (19/11)

**O que pedi:** revisar os textos que ainda falavam do objetivo antigo (guardar o conhecimento de quem sai) e recalcular a rota.

**Como chegamos na mensagem:**
- **Dor:** a IA propôs três frases para a dor. A mais forte ("a diretoria descobre os problemas tarde demais") afirmava algo que eu não tenho como comprovar no CITi.
- **Decisão:** em vez de afirmar uma dor, a página mostra o que o produto faz. O foco é o acompanhamento dos projetos: atualizações por e-mail, prazos, resumos da IA para ver a situação e manter o escopo, e a reunião semanal da diretoria.

**O que mudou:**
- **Destaque:**
  - "Todos os projetos do CITi, **acompanhados semana a semana.**" / "Prazos, escopo e prioridades à vista, **direto do código.**";
  - parágrafo novo sobre andamento, previsão, resumo da IA e reunião de segunda;
  - título um pouco menor, para caber em 3 linhas no desktop.
- **Números:** "projetos entregues" e "pessoas nas equipes".
- **Recursos:**
  - subtítulo novo, sobre andamento, prazos, escopo e prioridades num só lugar;
  - textos do semáforo ("mostra se a entrega cabe no prazo"), do resumo da IA (manter o foco no escopo), do modo reunião e do boletim;
  - "Quem sabe o quê" virou "Quem conhece cada parte".
- **Seção do legado:** saiu "Quando alguém sai, o conhecimento fica.", que vendia uma dor, e entrou "E quando a equipe muda, **o histórico fica.**", como benefício de fechamento. Os rótulos dos números foram suavizados.
- **Chamada final:** "Pronto para a **reunião de segunda?**".
- **Descrição do site** (Google e compartilhamento): "Todos os projetos do CITi, acompanhados semana a semana: andamento, prazos, resumo com IA e reunião da diretoria."

### Fundo de órbitas e nova chamada final (19/11)

**O que pedi:**
- Trocar a chamada final ("Pronto para a reunião de segunda?"), que fazia o app parecer só um organizador de reuniões.
- Melhorar o fundo da página inicial, porque a imagem estava com qualidade baixa.
- Pedi para ver as opções antes de aplicar, sem me limitar àquela imagem.

**O que a IA encontrou:** a imagem tinha só 320×630 px e era esticada para mais de 700 px de largura.

**O que a IA propôs:** 4 fundos desenhados em vetor (lâminas do CITi, malha de pontos, órbitas e grafo de commits) e 3 chamadas finais.

**Minha escolha:** o fundo C (órbitas) e a chamada 1. Pedi também para aproveitar o tamanho da página e enriquecer o visual ao descer.

**O que a IA fez:**
- **`components/entrada/fundo.tsx`:** órbitas em SVG, com 4 anéis (dois tracejados), pessoas em verde, roxo e cinza, brilho radial verde e anéis girando devagar em sentidos opostos. As animações param com "reduzir movimento".
- **Órbitas pela página:** uma grande atrás da vitrine do topo, mais três alternando os lados (recursos, como funciona, histórico) e uma no centro do card da chamada final. Elas ficam atrás do conteúdo e só aparecem nos vãos.
- **Celular:** a órbita do topo fica mais apagada para não passar por cima do texto.
- **Chamada final:** "Todos os projetos, **num só lugar.**" / "Entre e veja como cada projeto está nesta semana."
- **Imagem antiga:** a página não usa mais `fundo-citi.webp`, mas o arquivo continua em `public/marca`.

### Página inicial mais leve (19/11)

**O que pedi:** a página inicial estava travando no meu navegador. Pedi o que fazer para garantir a experiência de qualquer pessoa, e também usar o fundo de ramificações no lugar de uma das órbitas, para não ficar repetitivo.

**Causas encontradas pela IA:**
- **Anéis girando dentro de SVG:** eram 20, em SVGs de até 1369 px. Girar um grupo dentro de um SVG redesenha a imagem inteira a cada quadro, e isso acontecia nas 5 órbitas ao mesmo tempo, mesmo fora da tela.
- **Desfoque de fundo** (vidro fosco) nos cards da vitrine e na faixa de números, sobre conteúdo em movimento, o que obriga a refazer o desfoque a cada quadro.
- **Pulso** dos pontos de status animando a sombra (`box-shadow`), o que redesenha continuamente.

**O que a IA fez:**
- **Órbitas** (`components/entrada/fundo.tsx`):
  - anéis e brilho viraram uma imagem parada;
  - só as "pessoas" giram, cada anel numa camada HTML com `will-change: transform`, que a placa de vídeo move sem redesenhar;
  - cada órbita só anima enquanto está na tela (IntersectionObserver);
  - no celular (até 640 px) e com "reduzir movimento", o fundo fica parado.
- **Ramificações:** um grafo de commits parado (linhas de branch com nós verdes e roxos) substituiu a órbita ao lado de "Como funciona".
- **Sem desfoque:** os cards da vitrine e a faixa de números passaram a ter fundo sólido. Só o cabeçalho continua com desfoque.
- **Pulso:** passou a animar tamanho e transparência num `::after`, sem redesenhar a página.
- **Hidratação:** as posições das pessoas são arredondadas, para servidor e navegador gerarem o mesmo HTML.

**Medição** (no navegador do app, 1280 px):

| | Antes | Depois |
|---|---|---|
| Animações contínuas | 27 (20 dentro de SVG) | 8 a 12, conforme a parte da página (nenhuma dentro de SVG) |
| Elementos com desfoque | 4 | 1 (o cabeçalho) |
| Quadros por segundo | ~70 | ~75, sem quadros lentos |

A melhora deve ser bem maior em computadores e celulares mais fracos.

### Tela de projetos mais limpa e o modo Sinais vitais (19/11)

**O que pedi:** a tela de projetos parecia poluída, como se tivesse muita informação. Pedi para melhorar a experiência sem perder conteúdo e para criar outro modo de visualização fora do óbvio, como fizemos em Membros.

**Diagnóstico da IA:**
- **O mesmo sinal repetido:** o atraso aparecia até 5 vezes por card (etiqueta, borda vermelha, fatias vermelhas da barra, "+69 dias" e "atrasado há 13 dias").
- **Cor demais:** a barra de 6 fatias coloridas virava um arco-íris em cada card.
- **Indicadores grandes:** 4 cards de números ocupavam quase uma tela antes do primeiro projeto.
- **Fonte monoespaçada** em várias linhas do card, o que cansava a leitura.

**Proposta, mostrada antes de aplicar, e meus ajustes:**
- **Barra:** pedi que ela seguisse a cor da situação (vermelho, âmbar ou verde), em vez de ficar só verde.
- **Botões do topo:** mantidos como estavam.
- **Modo novo:**
  - a IA mostrou primeiro Linha do tempo e Mapa; pedi algo menos óbvio;
  - depois vieram Anéis da semana, Sinais vitais e Constelação;
  - escolhi **Sinais vitais**.

**O que mudou:**
- **Indicadores:** viraram uma faixa compacta, com os mesmos números.
- **Cards:**
  - um sinal só, a cor da situação no ponto, na barra única de progresso e na data prevista;
  - uma linha de resumo ("70% · entrega prevista 14/01");
  - no máximo 3 avatares e "+N";
  - sem borda vermelha;
  - etapas, prazo, previsão completa, gargalo principal e alerta aparecem ao passar o mouse ou focar com o teclado, e ficam sempre visíveis em telas de toque.
- **Agrupamento:** "Precisam de atenção" primeiro e "No prazo" depois.
- **Sinais vitais** (botão "Cards | Sinais vitais", só em Em andamento):
  - cada projeto vira um monitor cardíaco, em que cada batimento é um dia com commits nas últimas 4 semanas;
  - a altura do batimento acompanha a quantidade, em escala de raiz quadrada, para um dia com muitos commits não achatar os outros;
  - a linha reta mostra dias parados, e a cor é a da situação do projeto;
  - um ponto pulsa no fim da linha enquanto o projeto está ativo e fica cinza quando está parado;
  - à direita aparece a leitura do ritmo (ritmo firme, acelerando, ritmo caindo ou parado há N dias) e o total de commits;
  - passar o mouse em cada dia mostra a data e a quantidade de commits.
- **Dados:** os commits por dia são calculados no servidor, sem nada novo no banco.

**Verificação:**
- **Desktop** (1280 px): os dois modos, conferidos visualmente.
- **Celular** (375 px): sem rolagem lateral, e os detalhes dos cards ficam visíveis no toque.

### Tela de projetos: evolução visual (19/11)

**O que pedi:** voltar os 4 cards de indicadores como estavam (andamento, atrasados, tasks, commits), porque a faixa compacta não me agradou, e evoluir o visual da página, que estava fraco.

**Diagnóstico da IA:** era tudo retângulo cinza igual sobre o preto, sem profundidade e com pouca marca do CITi. O que o produto tem de mais valioso (o resumo da IA e o ritmo de cada projeto) ficava escondido dentro de cada projeto. A IA mostrou uma proposta visual antes de aplicar, e eu aprovei.

**O que mudou:**
- **Indicadores** (os mesmos 4 cards grandes), cada um com um mini gráfico:
  - **Em andamento:** proporção de projetos atrasados, em atenção e no prazo.
  - **Atrasados:** card em tom vermelho, com o nome do projeto e há quantos dias está atrasado.
  - **Tasks:** barrinhas de tasks entregues por dia da semana.
  - **Commits:** uma linha com o ritmo de commits da semana.
- **"Precisa de você agora":**
  - o projeto atrasado mais grave ganha um card largo no topo, com progresso, entrega prevista e gargalo;
  - ao lado vem o resumo da semana feito pela IA ("O que travou" e "Fazer primeiro");
  - o card só aparece quando há um projeto atrasado, e sai do grupo para não repetir.
- **Cards:**
  - monograma com as iniciais do cliente, na cor da situação;
  - anel de progresso no lugar da barra;
  - um pulso em miniatura com as 2 últimas semanas de commits, o mesmo traçado dos Sinais vitais;
  - entrega prevista e gargalo numa linha;
  - ao passar o mouse, o card sobe levemente, a borda acende na cor da situação e aparecem os detalhes e a equipe.
  - **No celular:** a etiqueta da situação fica escondida, porque a cor do monograma e do anel já mostra a situação e assim o nome cabe.
- **Órbitas** da página inicial, discretas, atrás do cabeçalho.

**Verificação:** desktop (1280 px) e celular (375 px), sem rolagem lateral.

### Projetos: sem Sinais vitais, pulso no destaque e foto no avatar (19/11)

**O que pedi:** tirar a opção Sinais vitais, colocar no card "Precisa de você agora" o pulso no lugar da barra, como nos outros cards, e mostrar a foto do membro ao passar o mouse no círculo dele, quando houver.

**O que a IA fez:**
- **Sinais vitais:** saíram o modo e o botão de alternância. O traçado do pulso continua nos cards.
- **Destaque:** a barra deu lugar ao pulso das 2 últimas semanas, e entrou o anel de progresso, igual aos outros cards.
- **Avatares:**
  - ao passar o mouse, o círculo cresce e, se o membro tiver GitHub cadastrado, mostra a foto dele;
  - a foto só carrega quando o card aparece na tela (lazy) e some se não carregar;
  - quem passa de 3 membros ("+N") aparece listado na dica do "+N".
- **Verificação:** a foto do João Vitor (joaovgalvao1) aparece ao passar o mouse no card do CITi Legacy.
- **Foto sempre visível:** pedi a foto como padrão, sem precisar passar o mouse. Os avatares saíram do bloco de detalhes e foram para a linha do pulso, sempre visíveis, também no destaque. Quem tem GitHub cadastrado aparece com a foto, e os outros com as iniciais.

### Fundos trocados e foto que leva ao perfil (19/11)

**O que pedi:** aplicar os fundos sugeridos (ramificações em Projetos e órbitas em Membros) e fazer o clique na foto do membro, no card do projeto, levar ao perfil dele.

**O que a IA fez:**
- **Projetos:**
  - as ramificações de commits ficam atrás do cabeçalho, descem do canto direito e somem antes dos cards (máscara em degradê);
  - substituíram a órbita, que aparecia cortada.
- **Membros, modo Roda:**
  - as órbitas ficam concêntricas com a roda, dentro do card dela, e dão a impressão de que a roda continua pelo fundo;
  - o anel mais interno e o ponto central saem (nova opção `centro={false}` em `Orbitas`), para não passar por cima do cartão do meio.
- **Membros, modo Lista:** uma órbita discreta atrás do topo da grade, à direita.
- **Perfil do membro:** sem fundo, porque a órbita de colaboração já está lá.
- **Foto que leva ao perfil:**
  - clicar (ou apertar Enter) na foto ou nas iniciais de um membro, no card do projeto, abre o perfil dele, sem abrir o projeto;
  - a dica mostra "Nome · ver perfil", e o círculo cresce ao passar o mouse ou focar.

**Verificação:**
- **Desktop (1280 px):** clicar no avatar de Otávio Neves abriu `/membros/otavio-neves`.
- **Celular (375 px):** roda e fundos sem rolagem lateral.

### Órbita integrada em Membros e grafo de commits em Projetos (19/11)

**O que pedi:**
- **Membros:**
  - o topo da órbita aparecia cortado no modo Roda;
  - trocar o nome "Roda" por "Órbita";
  - tirar o card cinza e deixar a órbita como parte da tela, ampliada;
  - depois, mais um ajuste: o topo continuava cortando e a parte de baixo passava do rodapé.
- **Projetos:** evoluir a ramificação, que era só uma reta no canto direito.

**O que a IA fez:**
- **Membros:**
  - **Nome:** o modo passou a se chamar "Órbita".
  - **Sem card:** a roda fica direto no fundo da página, e as órbitas aumentaram (280% da roda no celular, 220% no desktop), concêntricas com ela.
  - **Topo cortado:** a órbita ficava atrás da faixa verde do topo, que cobria a parte de cima. Agora fica na mesma camada da faixa e por cima dela.
  - **Abaixo do rodapé:** a área de conteúdo das telas internas agora começa atrás do cabeçalho e recorta só na vertical (`overflow-y: clip`). O rodapé ganhou fundo sólido. A página termina no rodapé, sem sobra.
  - **Rolagem lateral:** `overflow-x: clip` no `html` e no `body`, para os fundos grandes não criarem rolagem lateral.
- **Projetos** (`components/projetos/grafo.tsx`):
  - **Grafo de commits real:** cada projeto em andamento é um ramo que sai de um tronco à esquerda, na cor da situação.
  - **Nós:** cada nó é um dia com commits nas últimas 4 semanas (maior = mais commits).
  - **Merges:** quando dois projetos vizinhos tiveram commits no mesmo dia, um traço roxo liga os ramos.
  - **Posição:** atravessa a tela de ponta a ponta atrás do cabeçalho, some à esquerda (atrás do título) e embaixo (antes dos cards).
  - **Leveza:** é parado, sem animação.

**Verificação:**
- **Membros:** desktop e celular, sem rolagem lateral; a altura da página termina no rodapé.
- **Projetos:** título legível sobre o grafo.
- **Página de projeto:** sem mudança visual com o novo espaçamento.
- **Ajuste seguinte:**
  - o modo "Lista" de Membros passou a se chamar **"Cards"**;
  - a área da Órbita ganhou espaço em cima e embaixo, e o rodapé desceu junto, para o anel maior aparecer inteiro;
  - no desktop, as órbitas passaram a 190% da roda: o anel maior vai de 17 px a 1164 px e o rodapé começa em 1299 px;
  - no celular, o anel cabe na altura (de 126 px a 1010 px, rodapé em 1143 px), mas na largura continua maior que a tela.

### Constelação de commits em Projetos e ajustes finos em Membros (19/11)

**O que pedi:**
- **Membros:**
  - descer a órbita até o limite que desenhei num print (logo abaixo dos filtros);
  - subir o rodapé para um pouco abaixo do piso da órbita;
  - deixar o rodapé transparente, para não cortar o círculo pontilhado.
- **Projetos:** não gostei da ramificação. Pedi para idealizar algo no chat antes. Entre as três ideias (ondas de atividade, pulso da empresa e constelação), escolhi a **constelação**. Depois pedi, com outro print desenhado, as constelações espalhadas pela largura toda.

**O que a IA fez:**
- **Membros:**
  - **Posição:** a área da Órbita ganhou mais espaço em cima, e o anel começa logo abaixo dos filtros (239 px, com os filtros terminando em 218 px).
  - **Espaço embaixo:** menor, com o rodapé uns 40 px abaixo do piso no desktop e uns 70 px no celular.
- **Rodapé:** transparente. O recorte dos fundos saiu do conteúdo e foi para o fim da página (`overflow: clip` no `body`), então o pontilhado passa por trás do rodapé sem alongar a página.
- **Projetos** (`components/projetos/constelacao.tsx`, no lugar de `grafo.tsx`):
  - **Estrelas:** cada commit da semana é uma estrela (até 18 por projeto), e as estrelas de um projeto se ligam numa constelação na cor da situação.
  - **Posições:** relativas ao centro da tela, valendo em qualquer largura, como no desenho:
    - a constelação do projeto atrasado fica na margem esquerda, descendo ao lado dos indicadores;
    - as de atenção vão logo depois do título até o centro-direita;
    - a do projeto no prazo fica à direita, entrando na margem.
  - **Espaço livre:** as estrelas evitam o título e os indicadores, e uma poeira de estrelas brancas pequenas cobre a faixa.
  - **Sorteio** com semente fixa (o id do projeto): a constelação é sempre a mesma. Sem animação.

**Verificação** (1534 px de largura, a mesma do print): vermelha em x 79–144, âmbar em x 625–1101 e verde em x 1222–1365.

### Constelações dentro das órbitas (19/11)

**O que pedi:** tirar a ramificação antiga da página inicial e, na página inicial e em Membros, integrar as constelações ao fundo de órbitas. A tela de projetos fica como está.

**O que a IA fez:**
- **Página inicial:** saiu a ramificação ao lado de "Como funciona", e o componente `Ramificacoes` foi removido.
- **`Orbitas`** ganhou estrelas (opção `estrelas`, ligada por padrão):
  - 5 constelações de 4 a 8 estrelas, nos vãos entre os anéis, em verde, roxo e âmbar;
  - uma poeira de estrelas brancas pequenas pelo campo da órbita;
  - tudo na parte parada do desenho, sem custo de animação;
  - sorteio com semente fixa por órbita, para servidor e navegador desenharem igual.
- **Onde aparece:** em todas as órbitas da página inicial e nas duas de Membros (modos Órbita e Cards).

### Textos da página inicial com as novidades (19/11)

**O que pedi:** atualizar os textos da página inicial com as mudanças recentes.

**O que a IA mudou:**
- **"Semáforo, pulso e previsão de entrega"** (antes "Semáforo e previsão de entrega"): agora cita o pulso de commits de cada projeto e o destaque do projeto mais crítico no topo, com o resumo da IA ao lado.
- **"Quem conhece cada parte":** cita a órbita de membros e a órbita de colaboração.
- **"Conectado ao repositório":** cada membro aparece com a foto do GitHub.
- **Como funciona, passo 3:** "Todo domingo à noite: resumo da IA, boletim por e-mail e slides da reunião prontos." (antes "todo fim de semana").
- **Sem mudança:** os outros textos já refletiam o domingo, a reunião de segunda e o foco no acompanhamento.
