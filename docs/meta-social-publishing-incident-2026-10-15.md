# Incidente dos publicadores Meta — 15 de outubro de 2026

Status: **publicação automática suspensa nas três marcas**  
Escopo: Kammara, Bichittos e Guitta Monatega Studio  
Última atualização: 16 de outubro de 2026

## Objetivo deste documento

Este é o registro canônico do incidente que deixou a conta `kammara.official` bloqueada na Meta e da revisão de segurança exigida antes de qualquer reativação.

O documento existe para:

- preservar os fatos e separar evidência de hipótese;
- registrar as falhas técnicas e processuais;
- impedir que a mesma arquitetura seja reintroduzida;
- definir os requisitos mínimos de uma futura implementação;
- orientar resposta, recuperação, auditoria e liberação.

Este documento não autoriza a reativação dos publicadores. Reativação exige revisão técnica completa e autorização explícita da proprietária das contas.

## Resumo executivo

Em 15 de outubro de 2026, a conta Kammara no Instagram tornou-se indisponível publicamente, passou a recusar o acesso e apareceu bloqueada na área administrativa da Meta. Foi recebido um alerta indicando atividade automatizada em looping.

A investigação encontrou um comportamento agressivo no publicador:

- uma única execução podia consultar o processamento de uma mídia até 75 vezes;
- o intervalo entre consultas era de 2 segundos;
- depois disso, a publicação do mesmo container podia ser tentada até 6 vezes;
- o mesmo padrão existia em Kammara, Bichittos e Guitta Monatega Studio;
- não havia um orçamento global de chamadas, circuit breaker por marca ou telemetria por requisição externa.

Os registros da Vercel mostram uma execução da rota Kammara às 15h43 de 15/10/2026, no horário de São Paulo. Eles não registram cada `fetch` de saída para a Meta, portanto o número real de chamadas daquela execução não pode ser reconstruído com precisão.

Há uma hipótese técnica forte de que o padrão de chamadas contribuiu para o bloqueio, especialmente pela proximidade temporal e pelo alerta recebido. Entretanto, a Meta não forneceu confirmação causal. O documento não deve transformar essa hipótese em fato.

Como contenção, os três publicadores foram pausados, seus crons removidos da Vercel e os endpoints receberam uma trava interna que responde `503` com `paused: true` antes de executar qualquer integração Meta.

## Impacto observado

### Kammara

- perfil público indisponível;
- senha recusada durante tentativas de acesso;
- conta ausente ou bloqueada na área administrativa;
- publicação automática interrompida;
- recuperação dependente da análise e dos mecanismos da Meta.

### Bichittos e Studio

- nenhuma indisponibilidade confirmada durante o incidente;
- exposição ao mesmo risco arquitetural;
- automação suspensa preventivamente.

### Operação

- calendário automático das três marcas interrompido;
- futuras publicações dependem de decisão manual até a substituição segura do sistema;
- necessidade de rotacionar credenciais antes de qualquer reativação;
- perda de confiança no publicador atual, que não deve ser reutilizado como está.

## Linha do tempo confirmada

### Antes do incidente

- Os três publicadores usavam a mesma estratégia geral de criação, consulta de status e publicação de mídia.
- O estado de cada ocorrência era persistido no S3 e havia locks condicionais para reduzir duplicidade entre execuções concorrentes.
- Foi adicionada uma retentativa de `media_publish` para lidar com a resposta de mídia ainda não pronta.
- Não foi realizada uma análise formal do pior caso de chamadas externas antes da entrada em produção.
- Não havia telemetria que contabilizasse cada chamada feita à Meta.

### 15 de outubro de 2026

- A Vercel registrou uma requisição `GET /api/cron/kammara-publish` às 15h43:56, horário de São Paulo.
- O agente da requisição era `vercel-cron/1.0` e a rota retornou HTTP `200`.
- A conta Kammara ficou indisponível e bloqueada.
- Foi recebido um alerta relacionando o bloqueio a solicitações automatizadas em looping.
- O cron da Kammara foi removido da produção.
- A rota da Kammara recebeu uma trava de emergência.
- O mesmo padrão de polling foi identificado em Bichittos e Studio.
- Os crons de Bichittos e Studio também foram removidos.
- As três rotas foram testadas em produção e confirmadas com `paused: true`.

### 16 de outubro de 2026

- Foi iniciada a auditoria documental e de segredos.
- Não foi confirmada nenhuma credencial real versionada nos três repositórios examinados.
- Os tokens Meta na Vercel foram confirmados como variáveis do tipo `Secret`, com valores ocultos.
- Arquivos locais `.env.*.local` estavam ignorados pelo Git, mas alguns tinham permissão `644`; as permissões foram corrigidas para `600`.

## Evidências técnicas

### Código que permitia polling excessivo

O fluxo de processamento usava um laço equivalente a:

```text
até 75 vezes:
  consultar status do container
  se FINISHED: continuar
  se ERROR ou EXPIRED: interromper
  caso contrário: esperar 2 segundos
```

O tempo máximo desse laço era de aproximadamente 150 segundos.

Depois, `media_publish` podia usar outro laço:

```text
até 6 vezes:
  tentar publicar o mesmo creation_id
  se a Meta disser que a mídia ainda não está pronta:
    esperar 5 segundos
  para qualquer outro erro:
    interromper
```

Esses laços eram limitados e, portanto, não constituíam um loop infinito no processo. Ainda assim, eram agressivos e podiam produzir uma rajada de chamadas que se assemelha a comportamento automatizado abusivo.

### Limite teórico por publicação de imagem

No pior caso permitido pelo código, uma ocorrência de imagem podia envolver:

- 1 chamada para criar o container do Instagram;
- até 75 consultas de status;
- até 6 chamadas de publicação;
- 1 verificação do objeto publicado;
- 1 obtenção do Page Token do Facebook;
- 1 publicação da foto no Facebook;
- 1 verificação do objeto publicado no Facebook.

Total teórico máximo: **86 chamadas à Graph API em uma única execução**.

O total real pode ter sido muito menor. Como não havia instrumentação por chamada de saída, não é possível afirmar quantas ocorreram no incidente.

### O que os logs provam

- Houve uma execução da rota Kammara às 15h43:56.
- A execução foi originada pelo cron da Vercel.
- A rota respondeu HTTP `200`.
- Não foram observadas várias chamadas HTTP externas à rota do publicador no histórico consultado.

### O que os logs não provam

- Quantos `fetch` internos foram enviados à Meta.
- Quais respostas intermediárias a Meta retornou.
- Se todas as tentativas teóricas foram utilizadas.
- Se o bloqueio foi causado exclusivamente pelo publicador.
- Se houve comprometimento da conta ou de credenciais.

## Análise de causa

### Causa técnica provável

O publicador tratava um processamento assíncrono externo como espera síncrona dentro da mesma execução. Isso concentrou consultas e retentativas em uma janela curta.

### Falhas contribuintes

1. **Ausência de orçamento de chamadas**  
   O sistema não possuía um teto global pequeno e testável por execução e por ocorrência.

2. **Polling síncrono e frequente**  
   Consultar a Meta a cada 2 segundos por até 150 segundos não era uma política conservadora.

3. **Retentativa de operação de escrita**  
   Repetir `media_publish` sobre o mesmo container aumenta o risco quando a resposta anterior é ambígua.

4. **Circuit breaker insuficiente**  
   Não havia uma trava persistente por marca ativada automaticamente no primeiro erro de autenticação, permissão, rate limit ou bloqueio.

5. **Telemetria insuficiente**  
   A aplicação registrava o resultado geral, mas não o número, tipo e duração das chamadas externas.

6. **Risco compartilhado**  
   O mesmo mecanismo foi replicado nas três marcas sem uma revisão independente do impacto.

7. **Revisão de produção incompleta**  
   Testes de fluxo feliz e prevenção de duplicidade não substituíram uma análise explícita de carga, falhas e pior cenário.

8. **Scripts capazes de reativar crons**  
   Scripts de sincronização existentes podem voltar a inserir entradas no `vercel.json`. Eles não devem ser executados enquanto não forem redesenhados.

## Responsabilidade e aprendizado

O problema deveria ter sido evitado antes da produção. A existência de locks e estado persistente não compensava o volume potencial de chamadas. Uma integração com plataforma externa deve assumir lentidão, respostas ambíguas, limites, indisponibilidade e mecanismos antifraude.

O princípio obrigatório daqui em diante é:

> Nenhum mecanismo automático pode transformar lentidão ou erro externo em uma sequência rápida de novas solicitações.

## Contenção executada

### Produção

- cron `/api/cron/kammara-publish` removido;
- cron `/api/cron/bichittos-publish` removido;
- cron `/api/cron/guitta-studio-publish` removido;
- rota Kammara bloqueada antes da autenticação e da chamada ao publicador;
- rota Bichittos bloqueada antes da autenticação e da chamada ao publicador;
- rota Studio bloqueada antes da autenticação e da chamada ao publicador;
- watchdog mantido ativo somente para leitura de estado e envio de alertas; ele não publica nem chama a Meta.

### Verificação da contenção

As três rotas foram consultadas após o deploy e responderam `503`:

```json
{ "paused": true }
```

### Commits de contenção

- `dc4fcf7` — pausa do publicador Kammara;
- `1e0b1e8` — pausa preventiva de todos os publicadores Meta.

Os commits foram enviados para `origin/main` e `mosaicq/main`.

### Agendadores locais

- o `launchd` local da Kammara não estava carregado durante a investigação;
- nenhum processo local de publicação foi identificado como origem do incidente;
- os arquivos locais de agendamento não devem ser carregados novamente.

## Situação de segredos e credenciais

### Evidência encontrada

- nenhum token Meta real foi encontrado nos arquivos Git rastreados;
- nenhuma Access Key AWS ou chave privada real foi confirmada na revisão do histórico;
- os exemplos versionados contêm apenas nomes de variáveis ou valores falsos de teste;
- tokens de produção estão armazenados como `Secret` na Vercel;
- o código de produção usa `Authorization: Bearer` e não imprime o token;
- os logs consultados não exibiram tokens;
- `.env.*.local` permanece ignorado pelo Git;
- permissões dos arquivos locais sensíveis foram restringidas para `600`.

### Limite da conclusão

A auditoria não encontrou evidência de vazamento. Isso não equivale a provar que uma credencial jamais foi exposta por qualquer sistema externo. Por isso, credenciais associadas ao incidente devem ser rotacionadas antes de uma futura reativação.

### Regras obrigatórias para segredos

- um token por marca e por contexto operacional sempre que a Meta permitir;
- menor conjunto possível de permissões;
- nenhuma credencial em URL, query string, legenda, arquivo versionado ou saída de console;
- nenhuma resposta completa da Meta registrada se puder conter token;
- `.env.*.local` com permissão `600`;
- segredos apenas no cofre do ambiente de execução;
- rotação após incidente, mudança de responsável ou suspeita de exposição;
- inventário documentado de proprietário, finalidade, permissões, criação e próxima revisão, sem registrar o valor.

## Arquitetura obrigatória para uma futura versão

### Princípio: uma etapa por execução

O processamento assíncrono deve ser modelado como estado persistente. Uma execução faz uma etapa pequena e termina. É proibido aguardar em laço até a Meta responder.

Estados mínimos:

```text
PENDING
  -> CONTAINER_CREATED
  -> WAITING_FOR_MEDIA
  -> MEDIA_READY
  -> PUBLISH_REQUESTED
  -> PUBLISHED

Qualquer estado pode ir para:
  -> NEEDS_REVIEW
  -> BRAND_PAUSED
```

### Regras de transição

- `PENDING`: criar o container uma única vez e persistir o `creation_id` antes de encerrar.
- `CONTAINER_CREATED`: agendar a primeira consulta futura; não consultar imediatamente em loop.
- `WAITING_FOR_MEDIA`: realizar uma única consulta de status por execução.
- `MEDIA_READY`: solicitar publicação uma única vez.
- `PUBLISH_REQUESTED`: confirmar em execução posterior, sem repetir uma escrita ambígua.
- `PUBLISHED`: estado terminal e imutável.
- `NEEDS_REVIEW`: nenhuma nova chamada automática.
- `BRAND_PAUSED`: nenhuma ocorrência da marca pode alcançar a Meta.

### Política conservadora interna

Estes são limites internos, não limites declarados pela Meta:

- no máximo 2 chamadas Meta por execução;
- nenhuma repetição dentro da mesma execução;
- primeira consulta de processamento somente após pelo menos 60 segundos;
- consultas posteriores com espera crescente, por exemplo 5 e 15 minutos;
- no máximo 3 consultas automáticas de status por container;
- no máximo 1 chamada automática a `media_publish`;
- timeout curto por chamada;
- ao esgotar qualquer limite: `NEEDS_REVIEW`.

Qualquer alteração nesses números exige justificativa documentada, testes do pior caso e aprovação antes do deploy.

### Tratamento de erros

| Classe | Comportamento obrigatório |
|---|---|
| Autenticação, token, permissão, conta bloqueada | Pausar a marca imediatamente; zero retry |
| HTTP 429 ou rate limit da Meta | Pausar a marca; zero retry automático |
| Validação ou mídia inválida | `NEEDS_REVIEW`; zero retry |
| Container `ERROR` ou `EXPIRED` | `NEEDS_REVIEW`; não recriar automaticamente |
| Timeout ou falha de rede antes de escrita | Registrar; uma nova execução futura pode avaliar |
| Timeout após escrita ou resposta ambígua | `NEEDS_REVIEW`; nunca repetir sem reconciliação |
| HTTP 5xx | Sem retry imediato; reavaliação futura limitada e contabilizada |

### Idempotência e concorrência

- uma ocorrência possui uma única chave estável;
- todas as transições usam escrita condicional no estado persistente;
- o estado deve ser salvo antes e depois de cada operação externa;
- um lock expirado não autoriza repetir uma escrita cujo resultado seja desconhecido;
- concorrência detectada encerra a execução sem chamar a Meta;
- publicação parcialmente concluída exige reconciliação manual ou consulta segura, nunca reinício cego.

### Circuit breaker

Cada marca deve ter uma chave persistente e independente:

```text
publishingEnabled: false
pauseReason: string
pausedAt: timestamp
pausedBy: system | human
```

Requisitos:

- padrão seguro é `false`;
- erros críticos mudam automaticamente para `false`;
- a rota verifica a chave antes de ler a fila ou obter credenciais;
- reativação exige ação humana autenticada e registrada;
- nenhum deploy pode alterar silenciosamente a chave operacional.

### Isolamento entre marcas

Kammara, Bichittos e Studio devem ter separadamente:

- token;
- Instagram User ID;
- Facebook Page ID;
- prefixo de estado;
- lock;
- orçamento de chamadas;
- circuit breaker;
- alertas;
- métricas;
- cron ou agenda;
- autorização de reativação.

Uma biblioteca pode compartilhar código puro e testado, mas nunca estado, credenciais ou falhas operacionais.

## Observabilidade obrigatória

Cada execução precisa registrar, sem segredos:

- marca e ocorrência;
- etapa inicial e final;
- quantidade total de chamadas externas;
- endpoint lógico, sem query string;
- método HTTP;
- horário, duração e tentativa;
- status HTTP;
- código, subcódigo e `fbtrace_id` da Meta quando disponíveis;
- decisão tomada: aguardar, publicar, parar, revisar ou pausar marca;
- razão do encerramento;
- identificador de correlação da execução.

Nunca registrar:

- access token;
- Authorization header;
- cookies ou session cookies;
- valores completos de variáveis de ambiente;
- URL com credencial;
- dados pessoais desnecessários.

Alertas mínimos:

- primeira falha crítica;
- qualquer rate limit;
- qualquer erro de autenticação;
- orçamento de chamadas atingido;
- tentativa de chamar uma marca pausada;
- ocorrência presa além do tempo previsto;
- diferença entre estado local e plataforma.

## Testes obrigatórios antes de produção

### Testes unitários

- contar chamadas `fetch` em todos os cenários;
- falhar se uma execução ultrapassar o orçamento;
- autenticação inválida produz uma chamada e pausa;
- rate limit produz uma chamada e pausa;
- timeout após escrita não provoca repetição;
- container lento não cria loop;
- concorrência produz zero chamada Meta para o perdedor;
- ocorrência publicada produz zero chamada Meta;
- marca pausada produz zero chamada Meta.

### Testes de estado

- todas as transições permitidas;
- rejeição de transições regressivas;
- locks e escritas condicionais;
- recuperação após interrupção em cada ponto;
- reconciliação de estados ambíguos;
- isolamento entre marcas.

### Testes de integração simulados

- fluxo feliz de imagem;
- carrossel lento;
- Reel lento;
- HTTP 400, 401, 403, 429 e 5xx;
- resposta inválida;
- indisponibilidade de S3;
- alerta indisponível;
- duas execuções simultâneas;
- deploy repetido sem reativação automática.

Nenhum teste automatizado de CI deve usar a API real da Meta.

## Processo de liberação futura

1. Recuperar e estabilizar a conta Kammara.
2. Obter e arquivar qualquer retorno da Meta sobre o bloqueio.
3. Rotacionar as credenciais relacionadas.
4. Implementar a máquina de estados sem loops.
5. Adicionar circuit breaker persistente por marca.
6. Adicionar telemetria e orçamento de chamadas.
7. Passar por revisão de código independente.
8. Executar toda a suíte simulada.
9. Demonstrar o pior caso de chamadas em relatório.
10. Fazer deploy com as três marcas ainda pausadas.
11. Testar somente a leitura do estado, sem Meta.
12. Solicitar autorização explícita para um teste manual em uma marca.
13. Executar uma única publicação e observar por pelo menos 24 horas.
14. Revisar logs e estado com a proprietária.
15. Autorizar ou rejeitar a próxima marca separadamente.

Nenhuma data editorial justifica ignorar essas etapas.

## Checklist antes de cada reativação

- [ ] Conta acessível e sem revisão pendente na Meta.
- [ ] Token novo e armazenado como segredo.
- [ ] Permissões mínimas conferidas.
- [ ] Token não aparece em Git, logs ou URLs.
- [ ] Circuit breaker começa desligado.
- [ ] Cron ausente durante testes.
- [ ] Orçamento de chamadas coberto por testes.
- [ ] Zero loops de polling no código.
- [ ] Zero retries imediatos de escrita.
- [ ] Idempotência e concorrência testadas.
- [ ] Alertas testados sem Meta.
- [ ] Métricas por chamada disponíveis.
- [ ] Rollback e pausa testados.
- [ ] Aprovação explícita registrada.
- [ ] Apenas uma marca liberada por vez.

## Procedimento de incidente futuro

Ao primeiro sinal de bloqueio, rate limit, autenticação inválida ou comportamento inesperado:

1. ativar o circuit breaker da marca;
2. remover ou suspender o cron correspondente;
3. não testar token;
4. não repetir publicação;
5. preservar logs e estado;
6. registrar horário local e UTC;
7. identificar o total real de chamadas;
8. verificar se outras marcas compartilham código ou credenciais;
9. avisar a proprietária com fatos, sem especulação;
10. abrir post-mortem antes de qualquer reativação.

## Proibições até nova aprovação

- não executar os scripts `sync-vercel-integration.mjs`;
- não carregar os arquivos `com.*.publisher.plist`;
- não chamar manualmente endpoints de publicação;
- não testar tokens contra a Meta;
- não reintroduzir entradas de cron no `vercel.json`;
- não publicar pela automação, mesmo em data comemorativa;
- não considerar um deploy bem-sucedido como autorização operacional.

## Pontos ainda em aberto

- número real de chamadas realizadas na execução do incidente;
- código e mensagem exatos registrados pela Meta;
- confirmação da Meta sobre a causa do bloqueio;
- duração e resultado da revisão da conta;
- decisão sobre manter publicação própria ou adotar uma plataforma especializada;
- revisão independente da futura arquitetura.

Esses pontos devem permanecer explicitamente desconhecidos até existir evidência. Não preencher lacunas com suposições.

## Estado operacional atual

Enquanto este documento estiver marcado como publicação suspensa:

- Kammara: **pausado**;
- Bichittos: **pausado**;
- Guitta Monatega Studio: **pausado**;
- watchdog de estado e e-mail: **ativo, sem chamadas à Meta**;
- publicação manual por scripts internos: **proibida**;
- recuperação da conta Kammara: **dependente da Meta**.
