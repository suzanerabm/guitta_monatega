# Conteúdo de Kammara — fonte única para site e Android

Os arquivos em `src/data/characters/kammara/`, `src/data/kammara_books.json` e `src/i18n/messages/` são os originais. Corrigir português nesses arquivos, não no catálogo gerado do Android.

Conexões editoriais e subtítulos específicos do app ficam em `src/data/kammara-app/relations.json` e `section_headers.json`. A sinopse do livro ORF-V Volume 1 foi incorporada em `kammara_books.json`, no campo `description`. `book_details.json` está vazio, mantido para compatibilidade.

## IDs permanentes

Os registros têm `appId`. Preservar esse campo ao renomear títulos, corrigir acentos, reordenar listas ou mover imagens. Ao duplicar um registro para criar outro, remover o `appId` da cópia. IDs duplicados impedem a geração. `scripts/stabilize-app-ids.mjs` adiciona IDs apenas onde faltam; não altera texto nem visibilidade. Versionar esses campos junto com o conteúdo.

## Geração

`npm run generate-app-content` fixa os IDs de registros novos e gera `src/generated/kammara-app.json`, privado e ignorado pelo Git. `npm run dev` e `npm run build` executam esse passo automaticamente. O app Android chama este mesmo script ao compilar quando `KAMMARA_SITE_DIR` ou `kammara.site.dir` está configurado para este checkout.

O app leva uma cópia offline e já tem o mecanismo de consulta remota preparado. As rotas de API e a regra de limite de requisições ainda não foram publicadas/configuradas na hospedagem. Gerar localmente não atualiza um APK já instalado nem publica o site.

## Conferência de 10/09/2026

353 verbetes mantiveram os mesmos IDs e conteúdo efetivo. As conexões, termos e contagens também foram preservados. A revisão de português pode agora acontecer uma vez nos originais. A transformação de schema é automática.

Testes: `npm run test:app-content` verifica publicação, paginação, identidade estável após renomear e prioridade dos campos autorais dos livros.


A API responde **404 por padrão**, em produção e previews. Somente depois de configurar o rate limit na hospedagem, definir a variável de servidor `KAMMARA_APP_API_ENABLED=true` no ambiente desejado. Sem essa variável, apenas a geração local/offline funciona. Não usar prefixo `NEXT_PUBLIC_`.
