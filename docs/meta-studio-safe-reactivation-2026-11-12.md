# Reativação segura da publicação Meta — Guitta Monatega Studio

Data: 12 de novembro de 2026
Branch de implementação: `safety-studio-meta-state-machine`
Status operacional: **não implantado, não autorizado e sem chamadas reais à Meta**

## Escopo

Esta implementação existe somente para a marca Guitta Monatega Studio. Kammara e Bichittos
permanecem pausados e não fazem parte do teste.

O objetivo da primeira etapa é provar, com respostas simuladas, que lentidão, interrupção ou erro
externo nunca podem virar polling, repetição ou rajada de chamadas.

## Barreiras que continuam ativas

1. A rota só é habilitada pelo valor literal `GUITTA_STUDIO_META_ROUTE_ENABLED=true`; ausente ou
   qualquer outro valor retorna HTTP 503 antes de autenticação, S3 ou Meta.
2. A autenticação usa `GUITTA_STUDIO_META_MANUAL_SECRET`, exclusivo do Studio; o `CRON_SECRET`
   compartilhado não autoriza esta rota.
3. Não há cron de publicação no `vercel.json`.
4. O circuit breaker persistente tem padrão desligado.
5. Ligar o circuit breaker não basta: são obrigatórias uma ocorrência, uma plataforma e uma operação
   exatas, além de uma autorização com vencimento de no máximo 24 horas.
6. O primeiro estágio aceita somente imagem simples. Carrossel e Reel terminam em revisão humana
   com zero chamadas à Meta.
7. A fila vencida não é processada sem que uma ocorrência específica seja autorizada.
8. A autorização é descartável: ela é consumida no S3 antes de cada chamada Meta. A etapa seguinte
   exige uma nova autorização humana para a mesma ocorrência, plataforma e operação exata.

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

Instagram e Facebook nunca são publicados na mesma execução.

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
| Carrossel ou Reel nesta etapa | 0 chamadas Meta |

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
- carrossel é recusado com zero chamadas.

Nenhum teste automatizado usa credenciais ou API real da Meta.

## Etapas ainda obrigatórias

1. Revisar esta implementação e os testes.
2. Resolver ou isolar o teste preexistente do watchdog que depende de variáveis AWS locais.
3. Definir uma nova ocorrência de teste, simples e não pertencente à fila vencida.
4. Validar a mídia sem chamar a Meta.
5. Rotacionar as credenciais do Studio e conferir permissões manualmente.
6. Fazer deploy com rota pausada, cron ausente e circuit breaker desligado.
7. Validar somente leitura de estado.
8. Obter autorização explícita da proprietária para uma plataforma e uma ocorrência.
9. Executar uma única publicação manual.
10. Observar conta, logs e estado por pelo menos 24 horas.

Carrossel, Reel, cron recorrente e qualquer outra marca exigem avaliações e autorizações separadas.
