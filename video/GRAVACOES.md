# Gravações para o pitch

Este é um roteiro para deixar aberto ao lado enquanto você grava. Faça **um arquivo por clipe**, com o nome indicado em cada um. Sobra tempo no começo e no fim de cada clipe, então não precisa acertar o corte.

## Antes de começar (computador)

- **Monitor:** grave no **monitor externo (3072×1728)**. Ele é 16:9, como o vídeo, e não precisa de corte. A tela do notebook é 16:10.
- **Ferramenta:** o gravador do próprio GNOME, sem instalar nada.
  1. Aperte **Print Screen**.
  2. Clique no ícone de **câmera de vídeo** (alterna de foto para vídeo).
  3. Escolha **Tela** e clique no monitor externo.
  4. Ligue o **ponteiro** (ícone de seta) e clique no botão redondo para começar.
  5. Para parar, clique no botão vermelho que aparece na barra do topo.
  6. O arquivo vai para `~/Vídeos/Screencasts` (.webm). Renomeie com o nome do clipe.
- **Clipes com rolagem ou arraste** (órbita, Gantt, slides): o gravador do GNOME cai para cerca de 10 quadros por segundo durante o movimento, e a imagem engasga. Para esses clipes vale instalar o OBS, que grava estável a 60 fps (`flatpak install flathub com.obsproject.Studio`). No OBS: fonte "Captura de tela (PipeWire)", saída MP4, 60 fps.
- **Não perturbe:** ligue no menu do canto superior direito do GNOME, para não aparecer notificação no meio.
- **Navegador:**
  - abra o **site publicado** (citi-legacy.vercel.app), não o localhost;
  - entre como admin antes de gravar;
  - esconda a barra de favoritos (Ctrl+Shift+B) e feche as outras abas;
  - deixe em **tela cheia (F11)**;
  - zoom em 100%; se a interface ficar pequena, use 110%.
- **Links:** ao passar o mouse sobre um card que é link, o Chrome mostra o endereço no canto inferior esquerdo. Passe o mouse rápido sobre os cards ou deixe o cursor em áreas sem link.
- **Mouse:** mova devagar, como se estivesse apresentando para alguém. Fique **1 segundo parado antes e depois de cada clique**. Não deixe o cursor parado em cima de texto importante.
- **Erros:** se errar, não pare a gravação. Volte ao início da ação e repita, que eu uso a melhor tentativa.

## Clipes do computador

### 1. `projetos.webm` (cerca de 20 s)

Usado no fim de "a ideia" e no começo da demonstração.

1. Comece na tela de Projetos, com a página no topo, e espere 3 segundos parado.
2. Passe o mouse devagar pelos cards, da esquerda para a direita.
3. Pare em cima do destaque **"Precisa de você agora"** por 2 segundos.
4. Role devagar até o fim e volte ao topo.

### 2. `projeto-mezzalira.webm` (cerca de 25 s)

1. Na tela de Projetos, clique no card da **Metalúrgica Mezzalira**.
2. Espere a página carregar e fique 2 segundos parado.
3. Role devagar até o Gantt e passe o mouse pelo tracejado da previsão.
4. Abra uma etapa e **marque uma task**. Espere a barra andar.
5. **Desmarque a mesma task** depois de gravar.

> Atenção: no site publicado, marcar a task muda o banco de produção. Por isso precisa desmarcar no fim.

### 3. `marcar-reuniao.webm` (cerca de 40 s)

Esta é a parte da agenda (2:18).

1. Abra o modo reunião e clique em **"Marcar reunião"**.
2. Escolha data e hora.
3. **Selecione só você** nos destinatários, para nenhum convite real ir para outra pessoa.
4. Clique em **Enviar convite**.
5. Troque para o seu e-mail (Gmail) e abra o convite que chegou.
6. Clique em **"Adicionar ao Google Agenda"** e mostre o evento já preenchido.
7. Salve o evento e mostre ele na agenda da semana.

Se a troca de abas ficar confusa, grave em três clipes: `reuniao-app`, `reuniao-email` e `reuniao-agenda`.

### 4. `reuniao-slides.webm` (cerca de 20 s)

1. No modo reunião, passe 3 ou 4 slides com a seta do teclado, devagar, com cerca de 3 segundos em cada.
2. Clique em **Exportar PDF** e mostre o PDF que abre na nova aba.

### 5. `membros-orbita.webm` (cerca de 25 s)

1. Abra Membros na visualização **Órbita**.
2. Fique 3 segundos parado, para a órbita girar sozinha.
3. Arraste para girar devagar, e pare.
4. Clique em uma pessoa e espere o perfil abrir.
5. Role devagar até a **órbita de colaboração**.

### 6. `colaboracao.webm` (cerca de 15 s)

1. No perfil, na órbita de colaboração, clique num colega.
2. Mostre o perfil dele abrindo.

## Celular e iPad

Este material é para o fechamento (3:30).

- **Antes de gravar:**
  - ligue o **Foco / Não perturbe**;
  - deixe o brilho no máximo e a bateria acima de 50%;
  - deixe os aparelhos em **modo retrato**, e o iPad também em paisagem, se quiser uma alternativa;
  - arrume a tela de início: o ícone do CITi Legacy visível, com fundo de tela escuro ou neutro.
- **Para gravar:** Central de Controle → botão de gravação de tela, com 3 segundos de contagem.
- **Arquivos:** mande os originais por AirDrop ou cabo, **sem cortar nem comprimir**.

### 7. `ipad.mov` (cerca de 20 s)

1. Comece na tela de início, parado por 2 segundos.
2. Toque no ícone do **CITi Legacy**. O app abre em tela cheia.
3. Fique 3 segundos na página inicial e role um pouco, devagar.
4. Abra o menu e entre em **Projetos**. Fique 3 segundos parado.

### 8. `celular.mov` (cerca de 20 s)

Mesmo roteiro do iPad.

## Opcional

### 9. `git-push.webm` (cerca de 10 s)

Um `git push` real no seu terminal, com fonte grande (Ctrl+= três vezes).

## Enviar para mim

Coloque tudo em `video/public/gravacoes/`. A pasta não vai para o git: ela fica dentro de `video/`, que já está fora do deploy, e eu incluo no .gitignore.
