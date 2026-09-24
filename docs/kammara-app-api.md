# Integração de conteúdo do site — pronta para revisão

Escolha de Suzane em 10/09/2026: atualização automática com acesso **sem login**, dificultando a coleta em massa. A integração foi aplicada ao projeto local do site com autorização de Suzane. **Ainda não foi publicada em produção.**

## Comportamento

- Os JSONs autorais do site continuam sendo a fonte do conteúdo. Cada `npm run build` gera um snapshot **privado**, em `src/generated/kammara-app.json`.
- O arquivo completo nunca fica em `public/`; o gerador recusa esse destino. Metadados internos `source` não são exportados.
- `GET /api/kammara/v1/manifest` fornece a versão, os metadados e os hashes das páginas, sem a lista de verbetes.
- `GET /api/kammara/v1/pages?index=0&revision=...` retorna no máximo 20 verbetes. Não existe parâmetro para solicitar todos. Uma revisão antiga recebe 409 para evitar misturar publicações.
- O app abre primeiro os dados locais e consulta a API em segundo plano ao voltar ao primeiro plano, no máximo uma vez por minuto. ETag evita transferências quando nada mudou. Páginas com hash igual são reaproveitadas.
- Só depois de baixar e validar todas as partes alteradas, o app troca o catálogo inteiro e grava o cache atomicamente. Falhas, limite de requisições, JSON incompleto ou versão incompatível preservam a cópia anterior.
- Personagens, subsistemas, cenas, Drops e livros ocultos não são publicados. Conexões com itens removidos são excluídas. IDs seguem o importador existente; o campo opcional `appId` permite preservar explicitamente um ID ao renomear a chave autoral usada para gerá-lo.
- Textos, livros, links, relações, subtítulos e termos entram no snapshot. Alterações de interface/código ainda exigem nova versão do app.
- Uma alteração no site só chega ao app **depois de publicar o site**, quando o dispositivo estiver online. Mudanças só no arquivo local do site ainda não são uma publicação.

## Proteção e limites reais

A paginação dificulta o download em uma única requisição; **não impede reconstruir o catálogo por várias requisições**. A cópia offline no aparelho também pode ser extraída. Não há chave secreta embutida no APK nem promessa de impedir cópias.

Antes de disponibilizar as rotas, configurar no firewall do provedor uma regra distribuída de limite de requisições. Se o site estiver na Vercel:

- Nome: `Kammara app content`.
- Condição: Request Path começa com `/api/kammara/v1/`.
- Ação: Rate Limit, inicialmente **60 requisições por IP em 60 segundos**, ajustando com tráfego real (redes compartilhadas podem ter vários leitores no mesmo IP).
- Ao exceder: HTTP 429, não desafio HTML/CAPTCHA, pois é um cliente nativo.
- Aplicar em todos os domínios públicos que servem o projeto, incluindo aliases de deployment quando acessíveis.
- Verificar em preview a paginação, revalidação e HTTP 429 antes de publicar em produção.

Essa regra **ainda não está configurada**: não há CLI Vercel nem projeto vinculado neste ambiente. Não substituí-la por um contador em memória por instância, que não garante um limite global em hospedagem serverless.

Referência oficial: https://vercel.com/kb/guide/add-rate-limiting-vercel

## Instalação aplicada ao site / reprodução em outra cópia

Inspecionar primeiro, sem alterar arquivos:

```sh
python3 website-integration/install.py '/caminho/do/site'
```

Aplicar à árvore de trabalho (não faz commit, push nem deploy):

```sh
python3 website-integration/install.py '/caminho/do/site' --apply
cd '/caminho/do/site'
npm run generate-app-content
npx tsc --noEmit
npm run build
```

Na hospedagem, usar `npm run build` como Build Command para executar também o hook de geração. O comando direto `next build` não executa o hook `prebuild`.

O instalador adiciona as rotas, o conversor, o módulo exclusivo do servidor e os hooks `prebuild`/`predev`, preservando hooks existentes. O snapshot gerado fica ignorado pelo Git. Dados editoriais já migrados para o site não são sobrescritos por novas execuções.

As conexões autorais e subtítulos antes exclusivos do APK são migrados uma vez para `src/data/kammara-app/`. Depois, editar esses arquivos **no site**. A descrição de livro desse diretório é fallback: `description` e `buyUrl` no `kammara_books.json` do site têm precedência, incluindo valores explicitamente vazios.

## Validação realizada

- Dois testes Node: exclusão de conteúdo oculto, remoção de conexões inválidas, precedência dos textos do site, limite de páginas, ETag e rejeição de revisão antiga.
- Comparação com o importador Python atual: 353 registros com os mesmos IDs, textos, mídia e relações importadas.
- TypeScript e build de produção passaram no projeto do site após aplicar a integração autorizada. As rotas foram testadas por HTTP localmente: manifesto, página com 20 itens, ETag/304, revisão antiga/409, pedido ilimitado/400 e arquivo completo/404.
- 14 testes Android passaram (catálogo e sincronização), incluindo cache offline, erro de rede, HTTP 429, JSON inválido/incompleto, versão incompatível, conteúdo oculto, páginas reaproveitadas e revisão alterada durante a transferência. Lint aprovado.
- Publicação real e teste integrado contra a hospedagem continuam pendentes, incluindo a regra de firewall.

Os testes também foram copiados para `scripts/tests/kammara-app-api.test.mjs` no site e podem ser executados com `npm run test:app-content`. Nenhum commit, push ou deploy foi feito.


## Fonte única consolidada — 10/09/2026

A reconciliação confirmou os mesmos 353 verbetes e IDs. A sinopse do livro foi movida para `src/data/kammara_books.json`; o overlay de livros está vazio. Registros autorais receberam `appId` permanente. O gerador chama `stabilize-app-ids.mjs` antes de exportar para preservar identidade após correções de títulos.

O build Android usa `scripts/sync_content.py` para chamar o gerador deste checkout do site. Os assets são gerados e protegidos por `content-lock.json`. Não editar as cópias em Android nem as amostras do pacote de instalação. A configuração local do checkout fica fora do Git.


A API responde **404 por padrão**, em produção e previews. Somente depois de configurar o rate limit na hospedagem, definir a variável de servidor `KAMMARA_APP_API_ENABLED=true` no ambiente desejado. Sem essa variável, apenas a geração local/offline funciona. Não usar prefixo `NEXT_PUBLIC_`.
