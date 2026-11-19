# Pitch do CITi Legacy: roteiro do vídeo

**Duração:** cerca de 3:50 (o limite é 5:00).

**Formato:** animação feita em código (Remotion), no visual do próprio app (pulso, constelação, órbitas), com gravações reais das telas, zoom e destaques. Ninguém aparece na câmera.

**Voz:** a decidir (narração própria ou voz sintética). A narração abaixo tem cerca de 520 palavras, o que dá uns 3:45 num ritmo calmo. Os tempos das cenas se ajustam ao áudio final.

**Push ao vivo:** simulado na animação. Não depende do webhook na hora de gravar.

---

## Cena 1: abertura (0:00–0:15)

**Tela:**
- tela preta;
- um pulso verde, o traçado de monitor cardíaco do app, atravessa a tela da esquerda para a direita;
- no fim do traçado, o pulso vira o logo **citi | LEGACY**.

**Narração:**
> Todo projeto do CITi tem um ritmo. E todo esse trabalho já está registrado num lugar: no código.

---

## Cena 2: o contexto (0:15–0:40)

**Tela:**
- pontos verdes, âmbar e vermelhos caem como estrelas, cada um um commit, e se ligam em constelações, uma por projeto;
- surgem contadores: **5 projetos em andamento · 21 pessoas · centenas de commits**;
- por um instante, aparecem ícones de planilha e de mensagens de grupo, e logo somem.

**Narração:**
> Acompanhar vários projetos ao mesmo tempo (prazos, escopo, quem está fazendo o quê) exige atenção toda semana. Normalmente, isso vira planilha, cobrança de status no grupo e reunião só para saber como está cada projeto.

---

## Cena 3: a ideia (0:40–1:00)

**Tela:**
- as constelações se reorganizam em cards, que se encaixam;
- os cards viram a **tela de Projetos real** (transição para a gravação);
- o slogan entra na tela: *Todos os projetos do CITi, acompanhados semana a semana.*

**Narração:**
> O CITi Legacy faz esse acompanhamento direto do código. A equipe trabalha normalmente no GitHub, e a plataforma transforma commits e tasks em andamento, previsão de entrega e prioridades. Sem planilha, sem ninguém preencher nada.

---

## Cena 4: demonstração (1:00–2:30)

Gravações reais do app, com zoom suave e destaques em verde.

### 4a. Projetos (1:00–1:20)

**Tela:**
- os indicadores da semana;
- o semáforo nos cards;
- zoom no destaque **"Precisa de você agora"**, com o resumo da IA ao lado.

**Narração:**
> Cada projeto ganha uma cor pela situação real. A previsão usa o ritmo das últimas semanas e aponta o gargalo antes de virar atraso. E o projeto mais crítico sobe para o topo, já com o resumo da IA.

### 4b. O projeto (1:20–1:40)

**Tela:**
- Gantt com o tracejado de previsão;
- uma task é marcada e a barra de progresso anda.

**Narração:**
> Dentro do projeto, cada etapa tem prazo, tasks e quem mais conhece aquela parte. Marcou uma task, tudo se atualiza.

### 4c. Do push ao painel, simulado (1:40–1:58)

**Tela:**
- à esquerda, um terminal animado digita `git push`;
- uma linha de luz verde atravessa até o painel, à direita;
- um novo nó acende na constelação e o pulso do card bate.

**Narração:**
> E quando alguém faz um push, o GitHub avisa na hora. O commit entra na etapa certa pelos arquivos que alterou.

### 4d. Domingo à noite (1:58–2:15)

**Tela:**
- um relógio marca **domingo, 23h**;
- a IA escreve o resumo (o texto aparece com a assinatura roxo e verde);
- o e-mail do boletim chega.

**Narração:**
> Todo domingo à noite, a IA lê a semana de cada projeto (o que andou, o que travou e o que fazer primeiro) e o boletim chega por e-mail.

### 4e. Segunda de manhã (2:15–2:30)

**Tela:**
- o modo reunião passando os slides;
- o botão "Exportar PDF" gera o arquivo.

**Narração:**
> E na segunda, a reunião da diretoria já chega montada, em slides ou em PDF.

---

## Cena 5: pessoas (2:30–2:55)

**Tela:**
- a **Órbita de membros** girando e parando numa pessoa;
- o perfil dela;
- a **Órbita de colaboração**, com os colegas mais próximos.

**Narração:**
> Também dá para ver as pessoas por trás dos projetos: quem conhece cada parte e quem trabalhou com quem. Quando a equipe muda, o histórico fica. É daí que vem o nome Legacy.

---

## Cena 6: o uso de IA (2:55–3:30)

**Tela dividida:**
- **à esquerda, "No produto":** o resumo sendo escrito, com a memória das semanas anteriores aparecendo em camadas;
- **à direita, "No desenvolvimento":** trechos do DEV_LOG passando;
- no centro, em destaque: *"Você propõe, eu decido."*

**Narração:**
> A IA está em dois lugares. No produto, ela resume a semana com memória das anteriores. E no desenvolvimento, que levou três dias, trabalhei com uma regra: a IA propõe, eu decido. A ideia, as hipóteses e o rumo foram meus, e cada passo está registrado.

---

## Cena 7: fechamento (3:30–3:50)

**Tela:**
- um iPad com o app instalado na tela de início (o ícone citi LEGACY);
- a órbita se fecha num ponto;
- o logo e a URL **citi-legacy.vercel.app**.

**Narração:**
> CITi Legacy. Todos os projetos do CITi, acompanhados semana a semana.

---

## Produção

| Item | Como | Quem |
|---|---|---|
| Cenas animadas (1, 2, 3, 4c, 4d, 6, 7) | Remotion (React), com as cores, fontes e elementos do app | IA |
| Gravações das telas (4a, 4b, 4e, 5) | gravação automática do navegador em 1920×1080, sempre igual | IA |
| Narração | gravação própria **ou** voz sintética (por exemplo, a voz do Gemini, que usa a mesma chave do app) | você decide |
| Trilha | música livre de direitos, em volume baixo | IA sugere, você aprova |
| Montagem e exportação | Remotion → MP4 1080p | IA |
| Revisão final | assistir e pedir ajustes | você |
