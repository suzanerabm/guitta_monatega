# Ativação segura dos Bichittos e da Kammara — 24 de novembro de 2026

Status: **Studio, Bichittos e Kammara publicam imagem e carrossel pelo publicador seguro compartilhado; Reels manuais**

Design: `docs/superpowers/specs/2026-11-24-bichittos-publicacao-segura-design.md`
Plano: `docs/superpowers/plans/2026-11-24-bichittos-publicacao-segura.md`

## O que mudou no código

- **Publicador compartilhado.** O publicador seguro do Studio foi movido para `src/lib/safe-social/` e passou a receber
  uma configuração por marca (`SafeBrand`), com estes itens próprios de cada marca:
  - prefixo de variáveis de ambiente;
  - prefixo no S3;
  - fila;
  - teto diário de 32 chamadas;
  - textos;
  - regra de mesmo dia.

  O comportamento do Studio não mudou.
- **Publicadores antigos apagados.** Os publicadores antigos dos Bichittos e da Kammara, e o código compartilhado só por
  eles (`social-meta/execute.ts`, `publishers.ts`), foram apagados.
- **Rotas de cada marca.**
  - Manual supervisionada: `bichittos-publish` e `kammara-publish`, que exigem `<PREFIXO>_META_ROUTE_ENABLED=true` e
    `<PREFIXO>_META_MANUAL_SECRET`.
  - Agendada: `bichittos-scheduled-publish` e `kammara-scheduled-publish`, que exigem `<PREFIXO>_META_CRON_ENABLED=true`,
    o `CRON_SECRET` e o `_schedule-control.json` ligado. O cron é `*/15 12-21 * * *`.
- **Mesmo dia.**
  - Bichittos e Kammara aceitam duas ocorrências na mesma data com pelo menos 4 horas de diferença, uma de cada vez e a
    mais antiga primeiro.
  - Pares mais próximos que isso são conflito: zero chamadas e o controle pausa.
  - O Studio continua com uma ocorrência por dia.
  - O "Feliz Natal!" dos Bichittos (`022`) passou para 15:00 em 25/12.
- **Watchdog.**
  - Segue o `_schedule-control.json` de cada marca e cobra só as plataformas liberadas.
  - Ignora Reels: os drops da Kammara e os gifs dos Bichittos são vídeos de 2 a 6 segundos que a proprietária publica à
    mão.
- **Rota manual, mudanças de comportamento.**
  - Ignora a regra de mesmo dia: em 25/12, depois das 15:00, ela devolve conflito para os Bichittos.
  - O antigo retorno 409 em `needs-review` foi substituído pelo 500 com alerta, igual ao Studio.

## Permissões na AWS

As roles `VercelBichittosPublisher` e `VercelKammaraPublisher` já estavam limitadas ao próprio prefixo:
- `s3:GetObject` e `s3:PutObject` em `publications/<marca>/*`;
- `s3:ListBucket` só com `s3:prefix` desse prefixo.

O formato é o mesmo da role do Studio. Nenhuma mudança foi necessária.

## Filas

- **Bichittos:**
  - os posts perdidos desde 15/10 ficaram fora da automação;
  - o Pitu (`020`, 22/12) saiu da fila;
  - "Vem pular amarelinha" (`090`) foi para 24/11, e o Taylo, já publicado à mão, foi para 13/11;
  - "Pular corda" ocupou 22/12.
- **Kammara**, conta nova `kammara.universe`:
  - o Maelik (`010`) foi movido para 24/11 como teste;
  - o aerial-view (`020`) e todos os posts seguintes foram empurrados 13 dias (o `020` cai em 25/11).
- As filas do Obsidian (`mkt/FILA-DE-PUBLICACAO*.json`) foram mantidas iguais às do site.

## Ativação dos Bichittos

1. Deploy `a6834a2` promovido com `BICHITTOS_META_CRON_ENABLED=true`.
2. `publications/bichittos/_schedule-control.json` criado com `IfNoneMatch: "*"`, ligado para `instagram, facebook`.
3. A `090` foi publicada pelo cron no Instagram (`18107374841637548`).
4. No Facebook, a execução das 18:15 parou antes de qualquer requisição: `BICHITTOS_FACEBOOK_PAGE_ACCESS_TOKEN` nunca tinha
   sido cadastrado, porque o publicador antigo pedia o token da Página à Meta. O estado foi para `needs_review` e o controle
   se pausou.
5. A proprietária gerou o token da Página pelo usuário do sistema **Guitta Publisher**, no app **Bichittos Publisher**, com
   `Expires: Never`, e promoveu o deploy.
6. O Facebook da `090` voltou para `pending` e o controle foi religado, os dois com escrita condicional.
7. Às 18:30 o Facebook foi publicado (`479583432209461_1182269334313850`).
8. A confirmação veio às 18:45, com 7 chamadas no total. O controle segue ligado para `instagram, facebook`, e a próxima
   ocorrência é a `012`, Bobbin, em 27/11.

## Ativação da Kammara

1. A proprietária gerou os tokens pelo **Guitta Publisher**, no app **Kammara Publisher**, todos com `Expires: Never`:
   - o token da Página;
   - o token do usuário do sistema, depois de dar Full access do `kammara.universe` ao Guitta Publisher.
2. Deploy `2e180eb` promovido com `KAMMARA_META_ROUTE_ENABLED=true`, `KAMMARA_META_MANUAL_SECRET` e
   `KAMMARA_META_CRON_ENABLED=true`.
3. A rota manual recusou chamadas sem senha. Com a senha, o dry-run devolveu `brand-paused`, com zero chamadas.
4. O Maelik (`010`) foi publicado pela rota manual, depois das 17:30 e fora da janela do cron. Cada chamada teve uma
   autorização descartável própria, consumida antes da requisição. As esperas e travas foram respeitadas, e houve 6
   chamadas no total.
   - Instagram: `17920454460265660`
   - Facebook: `1382335524964102_122126029167499617`
5. `publications/kammara/_schedule-control.json` criado com `IfNoneMatch: "*"`, ligado para `instagram, facebook`. A
   próxima ocorrência é a `020`, em 25/11.
6. Pendente com a proprietária:
   - `KAMMARA_META_ROUTE_ENABLED=false`;
   - trocar `KAMMARA_META_MANUAL_SECRET`, que apareceu na conversa de ativação.

## Deploy

A Vercel publica a partir do remoto `mosaicq` (`mosaicQ/mosaicq-kammara-website`). Um push na `main` desse remoto gera só
um Preview, e a produção exige **Promote to Production**. Pushes feitos só no `origin` nunca chegam ao site.

## Pendências conhecidas (não bloqueiam)

- Reels automáticos: projeto separado. Os links de vídeo da Kammara na fila ainda apontam para o site (404); os arquivos
  existem no bucket de mídia.
- Melhorias apontadas na revisão:
  - teste explícito de "primeira ocorrência em revisão bloqueia a segunda";
  - remover leituras duplicadas do S3;
  - renomear helpers com "Studio" no nome.
