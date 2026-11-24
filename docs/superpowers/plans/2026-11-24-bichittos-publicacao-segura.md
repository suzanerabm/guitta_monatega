# Publicação segura dos Bichittos — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Os Bichittos passam a publicar pelo mesmo publicador seguro do Studio, agora compartilhado
por marca, com o primeiro post automático em 27/11/2026.

**Architecture:**
- O código de `src/lib/guitta-studio-social/` vai para `src/lib/safe-social/` e passa a receber uma
  configuração de marca (`SafeBrand`). Essa configuração define:
  - o prefixo das variáveis de ambiente;
  - o prefixo no S3;
  - a fila;
  - o teto diário;
  - a regra de mesmo dia.
- Cada marca tem a sua própria `BrandStore` (cliente S3, role, bucket e chaves) e as suas próprias
  rotas finas. Elas chamam handlers compartilhados.
- O publicador antigo dos Bichittos é apagado.

**Tech Stack:** Next.js (App Router, ver `node_modules/next/dist/docs/` antes de mexer em rotas),
TypeScript, Vitest, `@aws-sdk/client-s3`, `@vercel/oidc-aws-credentials-provider`, Vercel Cron.

**Spec:** `docs/superpowers/specs/2026-11-24-bichittos-publicacao-segura-design.md`

## Global Constraints

- Zero ou uma chamada à Meta por execução. Sem polling, sleep ou retry. Instagram e Facebook nunca
  na mesma execução.
- Nenhum teste chama a Meta real ou usa credencial real. Tokens só em `Authorization: Bearer`.
- Escritas de controle e de estado no S3 sempre condicionais (`IfMatch` / `IfNoneMatch: "*"`).
- Comportamento do Studio inalterado. Os testes atuais do Studio são movidos e renomeados, mas
  nenhuma asserção é afrouxada.
- Variáveis dos Bichittos mantêm os nomes existentes:
  - `BICHITTOS_META_ACCESS_TOKEN`
  - `BICHITTOS_FACEBOOK_PAGE_ACCESS_TOKEN`
  - `BICHITTOS_INSTAGRAM_USER_ID`
  - `BICHITTOS_FACEBOOK_PAGE_ID`
  - `BICHITTOS_META_GRAPH_API_VERSION`
  - `BICHITTOS_AWS_ROLE_ARN`
  - `BICHITTOS_AWS_REGION`
  - `BICHITTOS_AUTOMATION_BUCKET`
- Novas barreiras dos Bichittos, espelhando o Studio:
  - `BICHITTOS_META_CRON_ENABLED`
  - `BICHITTOS_META_ROUTE_ENABLED`
  - `BICHITTOS_META_MANUAL_SECRET`
- Prefixo de estado dos Bichittos: `publications/bichittos/`. O estado antigo (`001.json`,
  `WELCOME.json`, `CHILDRENS-DAY.json`) nunca é escrito.
- Mesmo dia nos Bichittos: mínimo de **4 horas** entre ocorrências da mesma data. Uma ocorrência
  por vez, a mais antiga primeiro. O Studio mantém "uma ocorrência por dia".
- Cron dos Bichittos: `*/15 12-21 * * *`, a mesma janela do Studio. O teto diário dos Bichittos é
  **32** chamadas, igual ao do Studio.
- Reels: `reel-manual-only`, zero chamadas.

## Review Focus

1. **Ocorrência dos Bichittos com estado antigo no S3** (objeto sem `schemaVersion: 3`) no dia dela.
   Esperado: `needs-review`, controle desligado, zero chamadas. Teste na Task 3.
2. **Dois posts no mesmo dia, o primeiro publicado só nas plataformas liberadas** (por exemplo,
   controle com `["instagram"]`). Esperado: o segundo começa, porque "terminado" significa as
   plataformas liberadas. Teste na Task 2.
3. **O post mais cedo do dia é um Reel e o mais tarde é uma imagem.** Esperado: o Reel não bloqueia
   e a imagem segue. Teste na Task 2.
4. **Execução dos Bichittos com só as variáveis `GUITTA_STUDIO_*` presentes.** Esperado: erro
   "`BICHITTOS_… is not configured`" e zero `fetch`. Nunca usa a credencial do Studio. Teste na
   Task 3.
5. **Watchdog com o controle ligado só para Instagram.** Esperado: sem alarme por Facebook
   `pending`. Teste na Task 4.

---

### Task 0: Encerrar o teste do token do Studio (operacional, antes de qualquer código)

**Files:**
- Modify: `src/lib/guitta-studio-social/publication-queue.json` (ocorrência `007`)
- Modify: `docs/meta-studio-safe-reactivation-2026-11-12.md` (seção "Registro da ativação")

- [ ] **Step 1:** Ler `publications/guitta-monatega-studio/007.json` no bucket
  `kammara-automation-state-451633548946`.
  - Só prosseguir quando `instagram.status` e `facebook.status` forem `published`.
  - Se algum estiver em `needs_review`, parar e reportar à proprietária.
- [ ] **Step 2:** Pedir à proprietária a confirmação visual do post do Rui Merengue no Instagram e
  na Página.
- [ ] **Step 3:** Voltar o `scheduledAt` da `007` para `"2026-11-21T09:00:00-03:00"`.
- [ ] **Step 4:** Rodar `npx vitest run src/lib/guitta-studio-social`. Esperado: tudo PASS.
- [ ] **Step 5:** Acrescentar ao documento do Studio um parágrafo com os fatos verificados nos
  passos 1 a 3, sem afirmar o que não foi conferido:
  - token da Página expirado em 13/11;
  - pausa da `006` em 14/11, com Instagram publicado;
  - token definitivo gerado pelo usuário do sistema Guitta Publisher em 24/11;
  - `007` movida para 24/11 e publicada, com os IDs lidos no S3;
  - fila restaurada.
- [ ] **Step 6:** Commit: `chore: close Studio token verification with Rui Merengue`.

### Task 1: Mover o publicador seguro para `src/lib/safe-social/`, parametrizado por marca (sem mudar comportamento)

**Files:**
- Move (`git mv`) de `src/lib/guitta-studio-social/` para `src/lib/safe-social/`:
  - `types.ts`, `select-due.ts`, `meta.ts`, `safe-publisher.ts`, `state.ts`, `scheduled-run.ts`,
    `run.ts`;
  - e todos os `*.test.ts` correspondentes.
- Create: `src/lib/safe-social/brands.ts`
- Create: `src/lib/safe-social/cron-handlers.ts`
- Keep: `src/lib/guitta-studio-social/publication-queue.json`, onde está.
- Modify: `src/app/api/cron/guitta-studio-scheduled-publish/route.ts` (+ `route.test.ts`)
- Modify: `src/app/api/cron/guitta-studio-publish/route.ts`
- Modify: `src/lib/social-publishing-watchdog.ts` (+ teste): só os imports do Studio.

**Interfaces:**
- Produces, em `brands.ts`:
  ```ts
  export type SameDayPolicy = { kind: "single" } | { kind: "min-gap"; minGapMs: number };
  export type SafeBrand = {
    id: "guitta-studio" | "bichittos";          // usado como `brand` do MetaClient
    alertBrand: PublishingBrand;                // de "@/lib/social-publishing-alerts"
    envPrefix: "GUITTA_STUDIO" | "BICHITTOS";
    statePrefix: string;                        // termina em "/"
    queue: { mode: string; timezone: string; items: PublicationItem[] };
    maxMetaCallsPerDay: number;
    sameDay: SameDayPolicy;
  };
  export const GUITTA_STUDIO: SafeBrand; // statePrefix "publications/guitta-monatega-studio/", cap 32, sameDay single
  ```
- Produces, em `state.ts`, `createBrandStore(brand: SafeBrand): BrandStore` e
  `storeFor(brand: SafeBrand): BrandStore` (memoizado por `brand.id`). O `BrandStore` expõe, com as
  mesmas assinaturas de hoje (sem o prefixo "Studio" nos nomes):
  - `acquire`, `save`, `readPublicationState`, `verifyStateAccess`;
  - `readBrandControl`, `consumeBrandAuthorization`, `pauseBrand`;
  - `readScheduleControl`, `consumeScheduleAuthorization`, `pauseSchedule`.

  Região, role e bucket vêm de `${envPrefix}_AWS_REGION`, `${envPrefix}_AWS_ROLE_ARN` e
  `${envPrefix}_AUTOMATION_BUCKET`, lidos dentro de `createBrandStore`.
- Produces:
  - `performMetaOperation(brand: SafeBrand, options: PerformMetaOperationOptions): Promise<MetaResult>`
    em `meta.ts`. `required()` lê `${brand.envPrefix}_${name}`.
  - `advancePublication(brand: SafeBrand, options: AdvanceOptions)` em `safe-publisher.ts`.
  - `runScheduledPublisher(brand: SafeBrand, now = new Date(), store = storeFor(brand))` em
    `scheduled-run.ts`.
  - `runManualPublisher(brand: SafeBrand, now = new Date(), dryRun = false, store = storeFor(brand))`
    em `run.ts`.
- Produces, em `cron-handlers.ts`:
  - `scheduledCronGET(brand: SafeBrand): (request: Request) => Promise<Response>`: corpo atual da
    rota agendada do Studio, com `${envPrefix}_META_CRON_ENABLED` + `CRON_SECRET`;
  - `manualRouteGET(brand: SafeBrand): (request: Request) => Promise<Response>`: corpo atual da rota
    manual, com `${envPrefix}_META_ROUTE_ENABLED` + `${envPrefix}_META_MANUAL_SECRET`.
- Os textos de resposta e de alerta passam a usar `brand.alertBrand`. Para o Studio, mantêm o texto
  atual: "Guitta Studio …", "O cron seguro do Studio …". Guarde essas strings por marca em `brands.ts`.

- [ ] **Step 1:** `git mv` dos arquivos listados. Ajustar imports relativos. Rodar
  `npx vitest run src/lib/safe-social`. Esperado: PASS, só com caminhos mudados.
- [ ] **Step 2:** Criar `brands.ts` com `GUITTA_STUDIO`. Parametrizar `state.ts`, `meta.ts`,
  `safe-publisher.ts`, `scheduled-run.ts` e `run.ts` com as interfaces acima. Nos testes:
  - trocar `vi.mock("./state")` por um `BrandStore` falso passado como argumento;
  - manter cada asserção.
- [ ] **Step 3:** Criar `cron-handlers.ts`. As duas rotas do Studio viram:
  ```ts
  export const runtime = "nodejs";
  export const maxDuration = 30;
  export const GET = scheduledCronGET(GUITTA_STUDIO); // ou manualRouteGET
  ```
  Antes, conferir em `node_modules/next/dist/docs/` se exportar `GET` como valor e `maxDuration`
  continua suportado. Atualizar o `route.test.ts` do Studio para mockar
  `@/lib/safe-social/scheduled-run` e `@/lib/safe-social/state`.
- [ ] **Step 4:** Rodar `npx vitest run && npx tsc --noEmit`. Esperado: 399+ testes PASS e zero
  erros de tipo.
- [ ] **Step 5:** Commit: `refactor: move safe Meta publisher to brand-parameterized safe-social`.

### Task 2: Regra de mesmo dia por marca

**Files:**
- Modify: `src/lib/safe-social/select-due.ts`, `src/lib/safe-social/scheduled-run.ts`
- Test: `src/lib/safe-social/select-due.test.ts`, `src/lib/safe-social/scheduled-run.test.ts`

**Interfaces:**
- Consumes: `SafeBrand.sameDay` (Task 1).
- Produces, em `select-due.ts`:
  ```ts
  export type WorkSelection =
    | { kind: "none" }
    | { kind: "conflict"; occurrences: string[] }
    | { kind: "item"; item: PublicationItem };
  export function selectWorkItem(
    items: PublicationItem[], now: Date, timeZone: string, policy: SameDayPolicy,
    isFinished: (item: PublicationItem) => boolean,
  ): WorkSelection;
  ```
  Regras:
  - `due` = itens de hoje com horário já passado (como hoje).
  - Política `single`: `due.length > 1` é conflito. É exatamente o comportamento atual do Studio.
  - Política `min-gap`:
    1. considerar **todos** os itens da data de hoje, inclusive os futuros, ordenados por
       `scheduledAt`;
    2. se dois itens consecutivos tiverem diferença menor que `minGapMs`, é conflito;
    3. senão, retornar o primeiro de `due` em que `isFinished` é falso;
    4. se não houver nenhum, retornar `none`.
  - Um Reel conta como terminado para a ordenação. Ele continua devolvendo `reel-manual-only` só
    quando for o item selecionado.
- `scheduled-run.ts` usa `selectWorkItem`. `isFinished(item)` é `true` quando o item é um Reel ou
  quando o estado lido tem todas as `control.allowedPlatforms` em `published`.
  - Para isso, ler o controle antes da seleção, sem mudar os retornos `schedule-paused` e
    `needs-review` existentes.
  - Ler o estado das ocorrências de hoje: no máximo 2 leituras no S3 por dia nos Bichittos e
    nenhuma chamada à Meta.

- [ ] **Step 1: Testes que falham** (em `select-due.test.ts`, com `policy = { kind: "min-gap", minGapMs: 4 * 3600_000 }`):
  - `"min-gap: 09:00 and 10:00 on the same day is a conflict even before 10:00"`: às 09:30, espera
    `{ kind: "conflict", occurrences: ["021", "022"] }`.
  - `"min-gap: 09:00 and 15:00 works the earliest unfinished first"`: às 15:30, com `isFinished`
    falso para os dois, espera o item das 09:00.
  - `"min-gap: second item starts once the first is finished"`: às 15:30, com o das 09:00
    terminado, espera o das 15:00.
  - `"min-gap: an earlier reel does not block a later image"` (Review Focus 3).
  - `"single: two due items stay a conflict"`: o comportamento do Studio fica preso por teste.
- [ ] **Step 2:** Rodar `npx vitest run src/lib/safe-social/select-due.test.ts`. Esperado: FAIL
  com `selectWorkItem` não exportado.
- [ ] **Step 3:** Implementar `selectWorkItem` e usá-lo em `scheduled-run.ts`.
- [ ] **Step 4:** Acrescentar ao `scheduled-run.test.ts`:
  - `"min-gap brand: first published on allowed platforms lets the second run"` (Review Focus 2):
    controle `["instagram"]`, 09:00 com Instagram publicado e Facebook pendente. Às 15:30, espera
    `advance` chamado com a ocorrência das 15:00.
  - `"min-gap brand: conflict pauses the schedule with zero calls"`.
- [ ] **Step 5:** Rodar `npx vitest run src/lib/safe-social`. Esperado: PASS, incluindo todos os
  testes antigos do Studio.
- [ ] **Step 6:** Commit: `feat: per-brand same-day policy for the safe publisher`.

### Task 3: Marca Bichittos no publicador seguro e remoção do publicador antigo

**Files:**
- Modify: `src/lib/safe-social/brands.ts` (adicionar `BICHITTOS`)
- Modify: `src/lib/bichittos-social/publication-queue.json`: `022` vira
  `"scheduledAt": "2026-12-25T15:00:00-03:00"`.
- Replace: `src/app/api/cron/bichittos-publish/route.ts` por
  `export const GET = manualRouteGET(BICHITTOS)`.
- Create: `src/app/api/cron/bichittos-scheduled-publish/route.ts`, com
  `export const GET = scheduledCronGET(BICHITTOS)`, e `route.test.ts`.
- Modify: `vercel.json`: adicionar o cron
  `{ "path": "/api/cron/bichittos-scheduled-publish", "schedule": "*/15 12-21 * * *" }`.
- Delete: `src/lib/bichittos-social/{meta.ts,run.ts,state.ts,select-due.ts,select-due.test.ts,types.ts}`.
- Modify: `src/lib/social-meta-publishers.test.ts` e `src/lib/social-meta/brand-control.test.ts`:
  remover só as entradas dos Bichittos. As da Kammara ficam.
- Create: `.env.bichittos.example`, espelhando `.env.guitta-studio.example`, com os nomes listados
  em Global Constraints.
- Test: `src/lib/safe-social/brand-isolation.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export const BICHITTOS: SafeBrand = {
    id: "bichittos",
    alertBrand: "Bichittos",
    envPrefix: "BICHITTOS",
    statePrefix: "publications/bichittos/",
    queue,
    maxMetaCallsPerDay: 32,
    sameDay: { kind: "min-gap", minGapMs: 4 * 60 * 60 * 1000 },
  };
  ```
  A fila é importada de `@/lib/bichittos-social/publication-queue.json`. Os itens já têm a forma de
  `PublicationItem`; os campos extras são ignorados.

- [ ] **Step 1: Testes que falham** em `brand-isolation.test.ts`:
  - `"Bichittos Meta call reads only BICHITTOS_* env"` (Review Focus 4): com só
    `GUITTA_STUDIO_META_ACCESS_TOKEN` etc. definidos, `performMetaOperation(BICHITTOS, …)` rejeita
    com `/BICHITTOS_META_GRAPH_API_VERSION is not configured/` e o `fetchImpl` mockado é chamado 0
    vezes.
  - `"Bichittos store writes only under publications/bichittos/"`: com o `S3Client.send` mockado,
    `acquire` e `pauseSchedule` usam `Key` que começa com `publications/bichittos/`.
  - `"Bichittos legacy state object goes to needs-review with zero calls"` (Review Focus 1):
    `runScheduledPublisher(BICHITTOS, 2026-11-27T12:30Z, fakeStore)`, com `acquire` lançando o erro
    de estado legado. Espera `status: "needs-review"`, `calls: 0` e `pauseSchedule` chamado.
  - `"Bobbin 012 is the only Bichittos work item on 2026-11-27"`: com a fila real, às 12:30Z, espera
    `012`.
  - `"Christmas 021/022 are 6 hours apart after the queue change"`: com a fila real, em 25/12 às
    18:30Z, `selectWorkItem` não dá conflito.
- [ ] **Step 2:** Rodar o teste. Esperado: FAIL com `BICHITTOS` não exportado.
- [ ] **Step 3:** Implementar `BICHITTOS`, a mudança da fila, as rotas, o cron e o
  `.env.bichittos.example`. Apagar o código antigo e as entradas de teste antigas.
- [ ] **Step 4:** `route.test.ts` da rota agendada dos Bichittos, espelhando o do Studio:
  - 503 sem `BICHITTOS_META_CRON_ENABLED=true`, sem tocar no `run`;
  - 401 com `BICHITTOS_META_MANUAL_SECRET` no lugar do `CRON_SECRET`;
  - alerta com `brand: "Bichittos"` em `needs-review`.
- [ ] **Step 5:** Rodar `npx vitest run && npx tsc --noEmit && npm run build`.
  - Esperado: PASS, zero erros, e build ok.
  - Depois: `grep -r "bichittos-social/meta\|bichittos-social/run" src` não encontra nada.
- [ ] **Step 6:** Commit: `feat: publish Bichittos through the shared safe publisher`.

### Task 4: Watchdog cobra só as plataformas liberadas

**Files:**
- Modify: `src/lib/social-publishing-watchdog.ts`
- Test: `src/lib/social-publishing-watchdog.test.ts`

**Interfaces:**
- Consumes: `storeFor(GUITTA_STUDIO)` e `storeFor(BICHITTOS)` (Task 1/3).
- As campanhas do Studio e dos Bichittos passam a ter
  `readControl: async () => { const c = await store.readScheduleControl(); return { publishingEnabled: c.enabled, allowedPlatforms: c.allowedPlatforms }; }`.
- Os platforms esperados são `control.allowedPlatforms` quando existirem; senão, o
  `expectedPlatforms` atual. A Kammara não muda.

- [ ] **Step 1: Testes que falham:**
  - `"Bichittos with only instagram allowed does not alert on facebook pending"` (Review Focus 5);
  - `"Bichittos with both allowed alerts when facebook is needs_review"`.
- [ ] **Step 2:** Rodar `npx vitest run src/lib/social-publishing-watchdog.test.ts`. Esperado: FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar `npx vitest run`. Esperado: PASS.
- [ ] **Step 5:** Commit: `fix: watchdog checks only authorized platforms for safe publishers`.

### Task 5: Ativação em produção (operacional, um passo por vez, com autorização da proprietária)

**Files:**
- Create: `docs/meta-bichittos-safe-reactivation-2026-11-27.md`, nos moldes do documento do
  Studio. Registrar cada passo com data, hora e o que foi conferido.

- [ ] **Step 1 (AWS, autorização da proprietária):**
  - Ler a role em `BICHITTOS_AWS_ROLE_ARN` (o ARN é fornecido pela proprietária, que o lê na
    Vercel).
  - Garantir uma política que permita só:
    - `s3:GetObject` e `s3:PutObject` em
      `arn:aws:s3:::kammara-automation-state-451633548946/publications/bichittos/*`;
    - `s3:ListBucket` com a condição `s3:prefix` = `publications/bichittos/`.
  - Se a role tiver mais que isso, restringir e mostrar o diff antes de aplicar.
- [ ] **Step 2:** Push na `main` com `BICHITTOS_META_CRON_ENABLED` ausente. Conferir nos logs da
  Vercel que `/api/cron/bichittos-scheduled-publish` responde 503 e que não houve chamada `meta_call`.
- [ ] **Step 3 (Vercel, proprietária):** definir `BICHITTOS_META_CRON_ENABLED=true` (Production) e
  fazer o redeploy.
  - Sem o objeto `publications/bichittos/_schedule-control.json`, a rota responde
    `schedule-paused`, com zero chamadas. Conferir isso.
- [ ] **Step 4 (quinta, 26/11, autorização da proprietária):** criar `_schedule-control.json` com
  escrita condicional `IfNoneMatch: "*"`, contendo:
  - `{ schemaVersion: 1, enabled: true, allowedPlatforms: ["instagram", "facebook"], callsDate: null, callsToday: 0 }`;
  - `lastAuthorization: null` e os campos de pausa nulos.
- [ ] **Step 5 (sexta, 27/11):** acompanhar o `012.json` só lendo. Instagram e depois Facebook.
  - Ao final, pedir à proprietária a confirmação visual nas duas plataformas e registrar os IDs no
    documento.
  - Se der `needs_review`, não religar sem decisão da proprietária.
- [ ] **Step 6:** Commit do documento: `docs: record safe Bichittos activation`.
