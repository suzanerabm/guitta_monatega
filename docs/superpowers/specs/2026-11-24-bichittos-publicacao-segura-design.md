# Publicação segura dos Bichittos — design

Data: 24 de novembro de 2026
Status: aguardando aprovação da proprietária

## Intenção

Voltar a publicar os posts agendados dos Bichittos no Instagram (`bichittos.official`) e na Página
do Facebook, usando **exatamente o mesmo modelo seguro que já funciona no Guitta Monatega Studio**
(`docs/meta-studio-safe-reactivation-2026-11-12.md`).

Nas palavras da proprietária, o objetivo central é **não perder a conta**. Os Bichittos estão
pausados desde o incidente de 15/10/2026 (`docs/meta-social-publishing-incident-2026-10-15.md`),
quando a conta da Kammara foi bloqueada, provavelmente por chamadas em looping do publicador antigo.
Os Bichittos ainda usam esse publicador antigo, travado por `publishingPaused = true` em
`src/app/api/cron/bichittos-publish/route.ts`.

A Kammara vai passar pelo mesmo processo depois. Este projeto deve deixar isso fácil, mas **não**
religa a Kammara.

## Objetivos

1. Os Bichittos publicam imagem e carrossel automaticamente, com as mesmas garantias do Studio:
   - zero ou uma chamada à Meta por execução;
   - sem polling, sleep ou retry;
   - Instagram e Facebook em execuções separadas;
   - marca `inFlight` antes de toda chamada;
   - qualquer erro ou ambiguidade leva a `needs_review` e desliga o controle persistente da marca;
   - religar exige ação humana;
   - orçamento persistente por ocorrência e teto diário por marca;
   - sem catch-up e sem antecipação.
2. Reels continuam manuais (`manual-only`, zero chamadas), como no Studio.
3. O primeiro post automático é na **sexta, 27/11/2026: `012` Bobbin, no Instagram e no
   Facebook**.
4. O código seguro passa a ser **compartilhado pelas marcas**, e não uma cópia por marca (decisão
   do Claude; ver abaixo).

## Não-objetivos

- **Recuperar posts perdidos.** Tudo que estava agendado antes do dia da ativação fica fora da
  automação. Isso vale tanto para o período desde 15/10 quanto para o de hoje, 24/11 (Taylo). A
  proprietária publica à mão o que quiser. A automação nunca enxerga datas passadas.
- Religar a Kammara. Ela fica para um projeto seguinte e depende de a conta estar liberada pela
  Meta.
- Reels automáticos.
- Mudar a agenda do Studio, que continua com um post por dia.

## Anti-objetivos (falha mesmo que funcione)

- Qualquer caminho em que uma execução faça mais de uma chamada à Meta, ou em que um erro gere
  repetição automática.
- Reaproveitar o publicador antigo dos Bichittos ou o `CRON_SECRET` compartilhado como única
  barreira.
- Uma marca enxergar ou usar a credencial, o estado ou o controle de outra marca.
- Uma mudança para os Bichittos alterar o comportamento já validado do Studio. Os testes atuais do
  Studio têm que continuar passando sem afrouxar nada.
- Ligar a agenda inteira de uma vez, sem os passos isolados.

## Decisões da proprietária

1. **Mesmo modelo do Studio** em tudo, menos onde está dito abaixo.
2. **Dois posts no mesmo dia são permitidos se estiverem em horários bem diferentes.** Hoje, isso
   só acontece em 25/12 (`021` às 09:00 e `022` às 10:00).
   - Dois posts no mesmo horário, ou próximos demais, continuam sendo conflito de agenda e resultam
     em zero chamadas.
   - A regra do Studio (uma ocorrência por dia) não muda para o Studio.
3. **Para frente, sem recuperar atrasados.**
4. **Ativação, como no Studio:**
   1. deploy com tudo desligado e conferência de que nada sai;
   2. primeiro post, `012` Bobbin, na sexta 27/11, **nas duas plataformas** (Instagram e depois
      Facebook, em execuções separadas), para testar a automação completa;
   3. se o Bobbin sair certo nas duas, a agenda segue normal.
5. **Tokens: usar os que já estão na Vercel.** Os tokens dos Bichittos (Instagram e Página do
   Facebook) foram gerados corretamente pela proprietária e continuam válidos. O problema foi só o
   publicador antigo. **Não** se geram tokens novos.
   - Quem construir pode conferir, sem chamar a Meta, que as variáveis existem com os nomes
     esperados.
   - Se um token falhar no primeiro post, a automação para na primeira chamada, sem repetir, como
     aconteceu no Studio em 14/11.

## Decisões do Claude (a proprietária pode revisar)

1. **Publicador compartilhado.** Generalizar `src/lib/guitta-studio-social/` em um módulo
   parametrizado por marca. Cada marca tem a sua própria configuração:
   - fila;
   - prefixo de variáveis de ambiente;
   - prefixo no S3;
   - controle persistente;
   - teto diário;
   - política de mesmo dia.

   O Studio passa a ser uma configuração desse módulo, com o mesmo comportamento e os mesmos
   testes, e o mesmo vale para os Bichittos. Motivo: a Kammara vem em seguida, e uma correção de
   segurança precisa valer para as três marcas.
2. **Apagar o publicador antigo dos Bichittos** (`src/lib/bichittos-social/meta.ts`, `run.ts` e o
   que só ele usa) e substituir a rota `bichittos-publish`.
   - A fila (`publication-queue.json`) é mantida e convertida, se o formato exigir.
   - O watchdog (`src/lib/social-publishing-watchdog.ts`) passa a ler o estado novo.
3. **Mesmo dia, regra concreta:**
   - Duas ocorrências da mesma data precisam ter **pelo menos 4 horas** de diferença. Menos que
     isso é conflito: zero chamadas e controle desligado.
   - Só uma ocorrência é trabalhada por vez: a mais antiga do dia que ainda não terminou.
   - A segunda só começa quando a primeira estiver `published` em todas as plataformas
     autorizadas.
   - Se a primeira for para revisão, o controle desliga e a segunda não sai.
4. **Ajustar 25/12:** mover `022` ("Feliz Natal!") de 10:00 para **15:00**, para cumprir a regra
   das 4 horas. A proprietária pode escolher outro horário.
5. **Estado antigo no S3** (`publications/bichittos/001.json`, `WELCOME.json`,
   `CHILDRENS-DAY.json`): fica intocado.
   - O estado novo usa o mesmo prefixo `publications/bichittos/`, já que as ocorrências futuras
     não têm objeto.
   - Se o publicador encontrar um objeto sem `schemaVersion` compatível para a ocorrência do dia,
     vai para `needs_review` com zero chamadas.
6. **Variáveis dos Bichittos.**
   - As credenciais e IDs **mantêm os nomes que já existem na Vercel e no código**:
     `BICHITTOS_META_ACCESS_TOKEN`, `BICHITTOS_FACEBOOK_PAGE_ACCESS_TOKEN`,
     `BICHITTOS_INSTAGRAM_USER_ID`, `BICHITTOS_FACEBOOK_PAGE_ID`,
     `BICHITTOS_META_GRAPH_API_VERSION`, `BICHITTOS_AWS_ROLE_ARN`, `BICHITTOS_AWS_REGION` e
     `BICHITTOS_AUTOMATION_BUCKET`.
   - Só são novas as barreiras que o Studio tem e os Bichittos ainda não têm:
     - interruptor de rota e de cron;
     - segredo manual próprio.

     Os nomes exatos ficam com quem construir, seguindo o padrão `GUITTA_STUDIO_*`.
7. **Cron:** uma rota agendada própria dos Bichittos, na mesma janela do Studio (a cada 15 min,
   09:00–18:45 de São Paulo). Studio e Bichittos não compartilham estado, autorização nem teto
   diário.
8. **Isolamento no S3 também na AWS, não só no código.**
   - Os Bichittos usam uma role própria (`BICHITTOS_AWS_ROLE_ARN`, via OIDC da Vercel).
   - Essa role fica limitada a `publications/bichittos/*`: GetObject, PutObject condicional e
     ListBucket só nesse prefixo.
   - Se a role existente for mais ampla, ela é restringida. Se não existir, é criada.
   - Essa mudança na AWS é feita com autorização da proprietária, antes do primeiro deploy, e conferida com
     uma leitura de teste (dry-run) que não chama a Meta.
9. **Terminar o teste do Studio antes de começar.** O teste do token do Studio em 24/11 (`007`
    Rui Merengue movido para hoje, commit `33eb7d3`) precisa chegar a `published` antes de qualquer
    deploy deste projeto. Em seguida:
    - a fila do Studio e as datas dos testes voltam ao normal;
    - o encerramento é registrado no documento de reativação do Studio.

    A generalização parte desse estado restaurado.
10. **Sem passos de uma plataforma só.** Como o Bobbin já sai nas duas plataformas, não há
    plataforma pulada para recuperar.
11. **Watchdog lê a lista de plataformas liberadas.** Hoje ele espera as duas plataformas sempre que
    o controle está ligado. Passa a cobrar só as plataformas autorizadas no controle persistente,
    para não dar alarme falso se uma plataforma for pausada sozinha.

## Restrições

- Next.js deste repositório tem mudanças incompatíveis. Antes de mexer em rotas, consultar
  `node_modules/next/dist/docs/` (ver `AGENTS.md`).
- Nenhum teste automatizado chama a Meta real ou usa credenciais reais.
- Tokens só em cabeçalho `Authorization: Bearer`, nunca em URL ou log.
- Escritas de controle no S3 sempre condicionais (ETag).
- Cada passo de ativação em produção (ligar interruptor, ligar controle, liberar plataforma) é feito
  por uma pessoa, um de cada vez, com a fila restaurada e documentada no fim. Esse registro vai num
  documento de reativação dos Bichittos, nos moldes do do Studio.

## Dados conhecidos

- **Fila:** 95 itens, de 10/10/2026 a 27/08/2027, quase todos às 09:00, terças e sextas.
  - Formatos: 70 imagens, 18 carrosséis (de 2 a 5 imagens) e 7 Reels.
- **Próximos posts:**
  - `012` Bobbin, 27/11 — primeiro post automático, nas duas plataformas;
  - `005` Rui Merengue, 01/12;
  - `006` Ninha, 04/12.
- **IDs da Meta:** a Página dos Bichittos tem o ID `479583432209461`, que aparece como prefixo dos
  IDs de post já publicados.
- **Bucket de estado:** `kammara-automation-state-451633548946`, prefixo `publications/bichittos/`.

## Fica com quem construir

- A forma exata da generalização: config por marca, nomes de arquivos e módulos.
- A conversão de formato da fila dos Bichittos, se necessária.
- Os nomes exatos das variáveis de ambiente.
- A organização dos testes, desde que os do Studio continuem cobrindo o que cobrem hoje e os
  Bichittos tenham a mesma cobertura, mais os casos de mesmo dia.
