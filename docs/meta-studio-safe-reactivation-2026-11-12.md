# Reativação segura da publicação Meta — Guitta Monatega Studio

Data: 13 de novembro de 2026
Branch de implementação: `main`
Status operacional: **Instagram e Facebook ativos para imagens e carrosséis; Reel manual**

## Escopo

Esta implementação existe somente para a marca Guitta Monatega Studio. Kammara e Bichittos
permanecem pausados e não fazem parte do teste.

O objetivo da primeira etapa é provar, com respostas simuladas, que lentidão, interrupção ou erro
externo nunca podem virar polling, repetição ou rajada de chamadas.

## Barreiras da rota manual

1. A rota só é habilitada pelo valor literal `GUITTA_STUDIO_META_ROUTE_ENABLED=true`; ausente ou
   qualquer outro valor retorna HTTP 503 antes de autenticação, S3 ou Meta.
2. A autenticação usa `GUITTA_STUDIO_META_MANUAL_SECRET`, exclusivo do Studio; o `CRON_SECRET`
   compartilhado não autoriza esta rota.
3. A rota manual não é registrada no cron.
4. O circuit breaker manual persistente tem padrão desligado.
5. Ligar o circuit breaker não basta: são obrigatórias uma ocorrência, uma plataforma e uma operação
   exatas, além de uma autorização com vencimento de no máximo 24 horas.
6. A automação aceita imagem simples e carrossel. Reel termina como `manual-only` com zero chamadas
   à Meta e sem criar estado de publicação.
7. O seletor enxerga somente a ocorrência da data corrente em `America/Sao_Paulo`, depois de seu
   horário agendado. Datas anteriores não têm catch-up e datas futuras nunca são antecipadas.
8. A autorização é descartável: ela é consumida no S3 antes de cada chamada Meta. A etapa seguinte
   exige uma nova autorização humana para a mesma ocorrência, plataforma, operação e, no carrossel,
   índice exato do slide.
9. Mais de uma ocorrência elegível no mesmo dia é conflito de agenda e resulta em zero chamadas.
10. Cada ocorrência possui um orçamento persistente e finito de chamadas Meta. Atingir o teto leva
    a revisão humana sem fazer outra chamada.

## Cron restrito do Studio

O agendamento automático usa uma rota separada, `/api/cron/guitta-studio-scheduled-publish`, e não
reutiliza o segredo nem a autorização descartável da rota manual.

1. A rota exige simultaneamente `GUITTA_STUDIO_META_CRON_ENABLED=true`, o `CRON_SECRET` da Vercel e
   o objeto persistente `_schedule-control.json` com `enabled: true`.
2. O cron é exclusivo do Guitta Monatega Studio. Os publicadores de Kammara e Bichittos continuam
   pausados e não são alterados por este controle.
3. Somente as plataformas explicitamente listadas no controle persistente são permitidas. Nesta
   fase, a lista é `instagram` e `facebook`; Reel retorna `manual-only` com zero chamadas.
4. O cron roda a cada 15 minutos, somente entre 09:00 e 18:45 de `America/Sao_Paulo`. Uma execução
   faz zero ou uma chamada Meta.
5. Somente a publicação com a data local exata do dia pode avançar. Não há busca de atrasados,
   antecipação de datas futuras ou recuperação automática no dia seguinte.
6. Antes de cada chamada, uma autorização é reservada por escrita condicional no S3. Execuções
   concorrentes não podem consumir a mesma versão do controle.
7. Há um teto adicional de 32 chamadas Meta por dia para todo o cron do Studio. Esse teto fica
   acima do necessário para o maior carrossel válido, mas impede crescimento ilimitado.
8. Conflito de agenda, estado ambíguo, `needs_review`, erro crítico ou exceção inesperada desligam o
   controle persistente. Religar exige ação humana.
9. Depois de todas as plataformas autorizadas da ocorrência chegarem a `published`, execuções
   posteriores retornam sem adquirir lock ou gravar estado.
10. O watchdog verifica Instagram e Facebook do Studio depois da janela de publicação.

## Regra estrutural contra looping

Cada execução realiza **zero ou uma chamada Meta**. O adaptador usa também um teto técnico de uma
chamada; mesmo um erro de programação não permite uma segunda requisição pela mesma instância.

Além do limite por execução, a autorização persistente é consumida antes da chamada. Repetir a URL,
inclusive em outra execução, produz zero chamadas até uma pessoa autorizar expressamente a próxima
etapa.

Não existem `sleep`, laço de polling ou retry no publicador seguro.

### Instagram — imagem simples

```text
PENDING
  -> criar container uma vez; persistir ID; encerrar
CONTAINER_CREATED
  -> aguardar pelo menos 60 segundos; encerrar sem chamada
WAITING_FOR_MEDIA
  -> consultar uma vez; persistir resultado; encerrar
MEDIA_READY
  -> solicitar publicação uma vez; persistir ID; encerrar
PUBLISH_REQUESTED
  -> aguardar pelo menos 5 minutos; confirmar uma vez; encerrar
PUBLISHED
```

Um container em processamento pode ser consultado no máximo três vezes, sempre em execuções
separadas. Depois da primeira consulta, as esperas são de 5 e 15 minutos. Se ainda não estiver
pronto, o estado passa para `NEEDS_REVIEW`.

### Facebook — imagem simples

```text
PENDING
  -> publicar uma vez; persistir ID; encerrar
PUBLISH_REQUESTED
  -> aguardar pelo menos 5 minutos; confirmar uma vez; encerrar
PUBLISHED
```

Instagram e Facebook nunca são publicados na mesma execução. A plataforma seguinte só começa em
outra execução depois que a anterior chega ao estado persistente `published`.

### Instagram — carrossel

Cada transição abaixo termina a execução. Para cada slide: criar uma vez, aguardar pelo menos 60
segundos e consultar uma única vez. Um slide que não estiver pronto nessa consulta vai para revisão
humana; não existe retry automático do slide.

Depois que todos os slides estiverem prontos, o publicador cria o contêiner pai, consulta seu estado
em execuções posteriores, publica e confirma. O índice do slide faz parte da autorização descartável,
impedindo que uma autorização do slide 1 seja usada para o slide 2.

### Facebook — carrossel (somente rota manual supervisionada)

Cada slide é criado como foto não publicada em uma execução separada. Somente depois de todos os IDs
estarem persistidos o post pai é publicado, também em execução separada, e depois confirmado.

Se o calendário mudar de dia durante qualquer fluxo, a ocorrência deixa de ser selecionável. O estado
parcial fica preservado para auditoria, mas a automação não continua nem tenta recuperar no dia seguinte.

## Resposta a interrupção e ambiguidade

Antes de toda chamada externa, o estado grava uma marca `inFlight` com operação, correlação e
horário. A marca só é removida depois que o resultado é persistido.

Se o processo cair depois da chamada e antes da gravação final, a execução seguinte encontra
`inFlight` e vai para revisão humana com **zero chamadas**. A escrita não é repetida.

Timeout, falha de rede ou resposta sem identificador também exigem revisão humana. Erro crítico de
token, permissão, bloqueio ou rate limit pausa a marca após a primeira resposta, sem retry.

## Orçamento de chamadas

| Unidade | Máximo |
|---|---:|
| Uma execução | 1 chamada Meta |
| Uma execução enquanto aguarda | 0 chamadas Meta |
| Instagram imagem, fluxo feliz | 4 chamadas, cada uma em execução diferente |
| Instagram imagem lenta | até 6 chamadas, espaçadas em execuções diferentes |
| Facebook imagem | 2 chamadas, cada uma em execução diferente |
| Instagram carrossel de N imagens, fluxo feliz | `2N + 4`, cada chamada em execução diferente |
| Facebook carrossel de N imagens, fluxo feliz | `N + 2`, cada chamada em execução diferente |
| Orçamento absoluto de uma ocorrência de carrossel | `3N + 8`; depois disso, revisão humana |
| Reel | 0 chamadas Meta; publicação manual |
| Cron do Studio em um dia | máximo adicional de 32 chamadas Meta; depois disso, pausa |

Os números do fluxo completo não são uma rajada: cada chamada depende de estado persistido e de
uma nova execução posterior. Não há mecanismo que percorra essas etapas em um único processo.

## Testes antes de qualquer deploy

- rota pausada produz zero acessos S3 e Meta;
- autorização ausente ou expirada produz zero acessos à ocorrência e à Meta;
- cada operação do adaptador faz exatamente uma requisição;
- tokens ficam no cabeçalho e não aparecem na URL;
- Instagram e Facebook não executam juntos;
- container lento respeita três consultas e esperas crescentes;
- rate limit faz uma chamada, pausa a marca e não repete;
- interrupção com `inFlight` impede repetição;
- falha de S3 depois da resposta Meta preserva `inFlight` e bloqueia nova chamada;
- passado, futuro e horário futuro do próprio dia produzem zero chamadas;
- Reel é recusado antes de gravar estado e produz zero chamadas;
- carrossel cria e verifica um único slide por execução;
- autorização de carrossel não pode ser reutilizada em outro slide;
- Instagram e Facebook concluem carrosséis em máquinas de estado independentes.
- a rota do cron rejeita o segredo manual e aceita somente o `CRON_SECRET`;
- o cron desligado retorna antes de ler estado ou chamar a Meta;
- o controle agendado recusa qualquer plataforma fora da lista persistente e ocorrências de outra data;
- cada autorização agendada incrementa condicionalmente o contador antes da Meta;
- o teto diário recusa a chamada seguinte sem gravar outro estado;
- depois de `published`, o cron não continua gravando locks.

Nenhum teste automatizado usa credenciais ou API real da Meta.

## Sequência de ativação

1. Executar testes, TypeScript, lint dos arquivos alterados e build de produção.
2. Criar `_schedule-control.json` desligado no bucket de automação.
3. Publicar a rota e o agendamento com o interruptor de ambiente ainda desligado.
4. Confirmar que a rota responde pausada e que não houve chamada Meta.
5. Habilitar o interruptor de ambiente, republicar e confirmar que o controle persistente desligado
   ainda produz zero chamadas.
6. Ligar o controle persistente como última ação.
7. Conferir os logs e o estado depois da primeira publicação agendada.

Reel e qualquer outra marca exigem avaliações e autorizações separadas.

## Registro da ativação

Em 13 de novembro de 2026, o commit `840d4dd` foi validado em Preview e promovido para produção.
A ativação ocorreu em três passos independentes: rota com variável `false`, rota com variável `true`
e controle do S3 desligado, e finalmente controle do S3 ligado com escrita condicional. Os metadados
do deploy confirmaram o cron `*/15 12-21 * * *`. O controle iniciou com contador zero e sem
autorização anterior. A primeira ocorrência automática elegível é `006`, em 14 de novembro de 2026
às 09:00 de `America/Sao_Paulo`.

Ainda em 13 de novembro, o commit `9a646a9` adicionou o Facebook do Studio à lista persistente de
plataformas autorizadas. O controle foi pausado antes da alteração, o Preview foi validado, o deploy
foi promovido com o controle ainda pausado e somente então a lista `instagram, facebook` foi ativada
por escrita condicional. O contador permaneceu em zero. Instagram e Facebook continuam avançando
em execuções separadas, nunca na mesma chamada do cron.

No teste isolado do Facebook da ocorrência `005`, o controle foi limitado exclusivamente a
`facebook` e o Instagram permaneceu marcado como concluído. A única execução autorizada detectou
que `GUITTA_STUDIO_FACEBOOK_PAGE_ACCESS_TOKEN` não estava configurado na Vercel antes de enviar uma
requisição de publicação. O estado passou para `needs_review` e o controle foi pausado automaticamente,
sem post no Facebook, sem repetição e sem chamada ao Instagram. A fila foi restaurada em seguida e o
cron voltou a autorizar somente o Instagram até a credencial exclusiva da Página ser configurada.

Depois que `GUITTA_STUDIO_FACEBOOK_PAGE_ACCESS_TOKEN` foi cadastrado como segredo exclusivo de
produção, a ocorrência `005` foi novamente isolada com autorização apenas para `facebook`. Em 13 de
novembro de 2026 às 18:45 de `America/Sao_Paulo`, uma única execução publicou a imagem e persistiu o
ID `1376392398892999_122124305385500542`, sem tocar no Instagram e sem repetição. O controle foi
pausado imediatamente após a resposta da Meta e a fila original foi restaurada. A ativação contínua
do Facebook dependia da confirmação humana de que esse post estava visível na Página.

A visibilidade do post foi confirmada manualmente pela responsável da Página. O estado da ocorrência
`005` foi então alterado de `publish_requested` para `published` sem nova chamada à Meta e, somente
depois, o controle persistente passou a autorizar `instagram, facebook`. As duas gravações no S3
usaram os ETags lidos imediatamente antes da operação; uma alteração concorrente teria impedido a
ativação. Kammara e Bichittos permanecem pausados, e Reels continuam exclusivamente manuais.
