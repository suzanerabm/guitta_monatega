// Especificação OpenAPI 3.1 da API pública de conteúdo.
//
// Escrita à mão de propósito: gerar a partir de schemas exigiria uma
// dependência de runtime (zod + zod-to-openapi) só pra descrever 8 endpoints
// que mudam pouco. Em troca, existe um teste
// (`src/lib/api/openapi.test.ts`) que falha quando uma rota é criada ou
// removida sem o spec acompanhar — é isso que impede a documentação de
// envelhecer em silêncio.
//
// Serve pra três coisas: ler a doc na página `/api-docs`, importar no Postman
// ou Swagger Editor, e gerar cliente Kotlin pro app com o openapi-generator.

import { SITE_URL } from '@/lib/site';

/** Idiomas aceitos em `?locale=`. */
const LOCALE_PARAM = {
  name: 'locale',
  in: 'query',
  required: false,
  description:
    'Idioma do conteúdo. Ausente ou inválido cai no padrão (`pt`) em vez de dar erro.',
  schema: { type: 'string', enum: ['pt', 'en'], default: 'pt' },
} as const;

/** Resposta 304 — o cliente mandou `If-None-Match` e nada mudou. */
const NOT_MODIFIED = {
  description:
    'Conteúdo não mudou desde o `ETag` enviado em `If-None-Match`. Sem corpo.',
} as const;

const NOT_FOUND = {
  description: 'Recurso inexistente ou não publicado.',
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
      example: {
        error: {
          code: 'not_found',
          message: "Mundo 'memphis' não existe ou não está publicado.",
        },
      },
    },
  },
} as const;

const ETAG_HEADER = {
  ETag: {
    description:
      'Identificador da versão do corpo. Reenvie em `If-None-Match` para receber 304.',
    schema: { type: 'string' },
  },
  'Cache-Control': {
    description: 'Política de cache para CDN e cliente.',
    schema: { type: 'string' },
  },
} as const;

function okJson(description: string, schemaRef: string) {
  return {
    description,
    headers: ETAG_HEADER,
    content: { 'application/json': { schema: { $ref: schemaRef } } },
  };
}

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Guitta Monatega — API de conteúdo',
    version: '1.0.0',
    description: [
      'API pública de leitura com o conteúdo do site: mundos de Kammara, criaturas',
      'Bichittos, seções de arte, progresso, eventos e mosaico.',
      '',
      '**Somente leitura.** Não há escrita, autenticação nem rate limit — o mesmo',
      'conteúdo já é público no HTML do site.',
      '',
      '**Visibilidade.** Conteúdo não publicado nunca aparece: mundo com progresso',
      'abaixo de 100%, criatura não lançada e itens marcados `visible: false` são',
      'filtrados no servidor, antes de montar a resposta. Um id não publicado',
      'responde 404, não uma resposta vazia.',
      '',
      '**URLs de mídia são sempre absolutas**, mesmo enquanto as imagens são',
      'servidas pelo próprio site. Quando a mídia migrar para S3/CDN, só a base',
      'muda — o formato da resposta continua igual e o cliente não precisa mudar.',
      '',
      '**Cache.** Toda resposta 200 traz `ETag`. Reenvie em `If-None-Match` para',
      'receber `304` sem corpo.',
    ].join('\n'),
    contact: { name: 'Guitta Monatega', url: SITE_URL },
  },
  servers: [
    { url: `${SITE_URL}/api/v1`, description: 'Produção' },
    { url: 'http://localhost:3000/api/v1', description: 'Desenvolvimento' },
  ],
  tags: [
    { name: 'Kammara', description: 'Mundos, progresso, eventos e mosaico.' },
    { name: 'Bichittos', description: 'Criaturas e seus livros.' },
    { name: 'Arte', description: 'Galerias de arte por técnica.' },
    {
      name: 'App',
      description:
        'O que o app Android precisa e as outras rotas não carregam.',
    },
  ],
  paths: {
    '/worlds': {
      get: {
        tags: ['Kammara'],
        summary: 'Lista os mundos publicados',
        description:
          'Mundos na ordem canônica, com lore, subsistemas, personagens, cenas e drops já resolvidos para o idioma.',
        operationId: 'listWorlds',
        parameters: [LOCALE_PARAM],
        responses: {
          200: okJson('Lista de mundos.', '#/components/schemas/WorldListResponse'),
          304: NOT_MODIFIED,
        },
      },
    },
    '/worlds/{id}': {
      get: {
        tags: ['Kammara'],
        summary: 'Um mundo',
        operationId: 'getWorld',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Id do mundo (ex: `lunnp1`, `eni4`, `triplec`).',
            schema: { type: 'string' },
            example: 'lunnp1',
          },
          LOCALE_PARAM,
        ],
        responses: {
          200: okJson('O mundo pedido.', '#/components/schemas/WorldResponse'),
          304: NOT_MODIFIED,
          404: NOT_FOUND,
        },
      },
    },
    '/bichittos': {
      get: {
        tags: ['Bichittos'],
        summary: 'Lista as criaturas publicadas',
        operationId: 'listBichittos',
        parameters: [LOCALE_PARAM],
        responses: {
          200: okJson('Lista de criaturas.', '#/components/schemas/BichittoListResponse'),
          304: NOT_MODIFIED,
        },
      },
    },
    '/bichittos/{id}': {
      get: {
        tags: ['Bichittos'],
        summary: 'Uma criatura',
        operationId: 'getBichitto',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Id da criatura (ex: `napcat`, `zeco`, `taylo`).',
            schema: { type: 'string' },
            example: 'napcat',
          },
          LOCALE_PARAM,
        ],
        responses: {
          200: okJson('A criatura pedida.', '#/components/schemas/BichittoResponse'),
          304: NOT_MODIFIED,
          404: NOT_FOUND,
        },
      },
    },
    '/art': {
      get: {
        tags: ['Arte'],
        summary: 'Seções de arte',
        description:
          'Não aceita `locale`: o payload é só caminho de imagem. Título e técnica de cada seção vivem nas mensagens de i18n, não nos dados.',
        operationId: 'listArtSections',
        responses: {
          200: okJson('Seções de arte.', '#/components/schemas/ArtResponse'),
          304: NOT_MODIFIED,
        },
      },
    },
    '/app-overlay': {
      get: {
        tags: ['App'],
        summary: 'Dados exclusivos do app',
        description:
          'Conexões entre verbetes, a página do universo, os livros de Kammara, privacidade, subtítulos de seção e os contadores de "em breve". Não aceita `locale`: vem nos dois idiomas, porque o app guarda os dois no mesmo catálogo e troca de idioma sem rede.',
        operationId: 'getAppOverlay',
        responses: {
          200: okJson(
            'Dados de apoio do app, nos dois idiomas.',
            '#/components/schemas/AppOverlay',
          ),
          304: NOT_MODIFIED,
        },
      },
    },
    '/progress': {
      get: {
        tags: ['Kammara'],
        summary: 'Progresso dos mundos em construção',
        description:
          'Heatmap "Próximos Planetas". `progress` é `null` quando todo mundo já chegou a 100% — é o mesmo sinal que o site usa para não renderizar a seção.',
        operationId: 'getProgress',
        parameters: [LOCALE_PARAM],
        responses: {
          200: okJson('Progresso, ou `null`.', '#/components/schemas/ProgressResponse'),
          304: NOT_MODIFIED,
        },
      },
    },
    '/events': {
      get: {
        tags: ['Kammara'],
        summary: 'Eventos interplanetários',
        description: [
          '`events` é `null` quando a seção está desligada ou não sobra evento de',
          'planeta publicado.',
          '',
          '**Atenção:** este é o único endpoint cujo conteúdo sai bilíngue',
          '(`{ pt, en }`) em vez de resolvido para um idioma. É uma exceção conhecida',
          '— o card de evento tem 8 campos bilíngues e a seção está desligada hoje,',
          'então achatar exigiria reescrevê-lo sem nada visível para validar.',
          '`planetNames` já vem resolvido.',
        ].join('\n'),
        operationId: 'getEvents',
        parameters: [LOCALE_PARAM],
        responses: {
          200: okJson('Eventos, ou `null`.', '#/components/schemas/EventsResponse'),
          304: NOT_MODIFIED,
        },
      },
    },
    '/mosaic': {
      get: {
        tags: ['Kammara'],
        summary: 'Clipes do mosaico',
        description: 'Vídeos curtos de planetas publicados, com marca do planeta.',
        operationId: 'getMosaic',
        parameters: [LOCALE_PARAM],
        responses: {
          200: okJson('Clipes.', '#/components/schemas/MosaicResponse'),
          304: NOT_MODIFIED,
        },
      },
    },
    '/openapi.json': {
      get: {
        summary: 'Esta especificação',
        description:
          'Disponível apenas quando a documentação está habilitada (`API_DOCS=true`); caso contrário responde 404.',
        operationId: 'getOpenApiDocument',
        responses: {
          200: {
            description: 'O documento OpenAPI.',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          404: NOT_FOUND,
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: { type: 'string', example: 'not_found' },
              message: { type: 'string' },
            },
          },
        },
      },

      Locale: { type: 'string', enum: ['pt', 'en'] },

      MediaUrl: {
        type: 'string',
        format: 'uri',
        description:
          'URL absoluta da mídia. A base muda quando o projeto migrar para S3/CDN; o formato, não.',
        example: `${SITE_URL}/imgs/kammara/lunnp1/erurin_alta.png`,
      },

      MediaCharacter: {
        type: 'object',
        description: 'Imagem de personagem vinda do manifesto, com rótulo legível.',
        required: ['name', 'image'],
        properties: {
          name: { type: 'string' },
          image: { $ref: '#/components/schemas/MediaUrl' },
        },
      },

      CharacterCard: {
        type: 'object',
        description: 'Ficha completa de um personagem, resolvida para o idioma.',
        required: ['name', 'species', 'bio', 'image'],
        properties: {
          name: { type: 'string' },
          species: { type: 'string' },
          bio: { type: 'string' },
          image: { $ref: '#/components/schemas/MediaUrl' },
          backImage: { $ref: '#/components/schemas/MediaUrl' },
          backTitle: { type: 'string' },
          dorsalMeaning: { type: 'string' },
          backMeaning: { type: 'string' },
          attributes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['glyph', 'label', 'value'],
              properties: {
                glyph: { type: 'string', description: 'Glifo kalún. Não traduzido.' },
                label: { type: 'string' },
                value: { type: 'string' },
              },
            },
          },
          fairyDust: {
            type: ['object', 'null'],
            description: 'Config do brilho sobre o retrato. Detalhe visual; ignorável.',
          },
          fairyDustBack: { type: ['object', 'null'] },
        },
      },

      Subsystem: {
        type: 'object',
        required: ['title', 'text', 'img'],
        properties: {
          title: { type: 'string' },
          text: { type: 'array', items: { type: 'string' } },
          img: {
            type: 'string',
            description: 'URL absoluta, ou string vazia quando o subsistema não tem imagem.',
          },
        },
      },

      Scene: {
        type: 'object',
        required: ['name', 'image'],
        properties: {
          name: { type: 'string' },
          image: { $ref: '#/components/schemas/MediaUrl' },
          video: { $ref: '#/components/schemas/MediaUrl' },
        },
      },

      Drop: {
        type: 'object',
        description:
          'Clipe curto. `video` é o `.mp4`; o `.webm` irmão é derivado trocando a extensão.',
        required: ['video', 'poster', 'label'],
        properties: {
          video: { $ref: '#/components/schemas/MediaUrl' },
          poster: { $ref: '#/components/schemas/MediaUrl' },
          label: { type: 'string' },
        },
      },

      Book: {
        type: 'object',
        required: ['id', 'cover', 'pages'],
        properties: {
          id: { type: 'string' },
          cover: { oneOf: [{ $ref: '#/components/schemas/MediaUrl' }, { type: 'null' }] },
          pages: { type: 'array', items: { $ref: '#/components/schemas/MediaUrl' } },
          buy: {
            type: ['object', 'null'],
            description: 'Link de compra, quando houver.',
            properties: {
              url: { type: 'string', format: 'uri' },
              label: { type: 'string' },
            },
          },
        },
      },

      Region: {
        type: 'object',
        description: 'Sub-região de um mundo. Hoje só o TripleC tem.',
        required: ['id', 'name', 'summary', 'panelStory', 'subsystems', 'characters', 'chars', 'scenes', 'drops', 'bgImage'],
        properties: {
          id: { type: 'string', example: 'malloc' },
          name: { type: 'string' },
          summary: { type: 'array', items: { type: 'string' } },
          panelStory: { type: 'array', items: { type: 'string' } },
          subsystems: { type: 'array', items: { $ref: '#/components/schemas/Subsystem' } },
          characters: { type: 'array', items: { $ref: '#/components/schemas/CharacterCard' } },
          chars: { type: 'array', items: { $ref: '#/components/schemas/MediaCharacter' } },
          scenes: { type: 'array', items: { $ref: '#/components/schemas/Scene' } },
          drops: { type: 'array', items: { $ref: '#/components/schemas/Drop' } },
          bgImage: { oneOf: [{ $ref: '#/components/schemas/MediaUrl' }, { type: 'null' }] },
        },
      },

      World: {
        type: 'object',
        required: ['id', 'name', 'summary', 'tags', 'subsystems', 'characters', 'chars', 'scenes', 'drops', 'bgImage'],
        properties: {
          id: { type: 'string', example: 'lunnp1' },
          name: { type: 'string', example: "LUNN'P1" },
          summary: { type: 'array', items: { type: 'string' } },
          tags: {
            type: 'array',
            description: 'Pares rótulo/valor mostrados no card do planeta.',
            items: {
              type: 'object',
              required: ['label', 'value'],
              properties: { label: { type: 'string' }, value: { type: 'string' } },
            },
          },
          subsystems: { type: 'array', items: { $ref: '#/components/schemas/Subsystem' } },
          characters: { type: 'array', items: { $ref: '#/components/schemas/CharacterCard' } },
          chars: {
            type: 'array',
            description: 'Imagens avulsas do manifesto (strip decorativo).',
            items: { $ref: '#/components/schemas/MediaCharacter' },
          },
          scenes: { type: 'array', items: { $ref: '#/components/schemas/Scene' } },
          drops: { type: 'array', items: { $ref: '#/components/schemas/Drop' } },
          bgImage: { oneOf: [{ $ref: '#/components/schemas/MediaUrl' }, { type: 'null' }] },
          regions: {
            type: 'object',
            description: 'Sub-regiões, quando existirem. Chave = id da região.',
            additionalProperties: { $ref: '#/components/schemas/Region' },
          },
        },
      },

      Bichitto: {
        type: 'object',
        required: ['id', 'name', 'text', 'panelStory', 'chars', 'positions', 'videos', 'books'],
        properties: {
          id: { type: 'string', example: 'napcat' },
          name: { type: 'string' },
          text: { type: 'array', items: { type: 'string' } },
          panelStory: { type: 'array', items: { type: 'string' } },
          chars: { type: 'array', items: { $ref: '#/components/schemas/MediaCharacter' } },
          positions: {
            type: 'array',
            description:
              'Posicionamento dos personagens na cena do card. Detalhe de layout do site; um cliente próprio pode ignorar.',
            items: { type: 'object' },
          },
          videos: {
            type: 'array',
            items: {
              type: 'object',
              required: ['src', 'poster', 'label'],
              properties: {
                src: { $ref: '#/components/schemas/MediaUrl' },
                poster: { $ref: '#/components/schemas/MediaUrl' },
                label: { type: 'string' },
              },
            },
          },
          mascot: { type: ['object', 'null'] },
          books: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
        },
      },

      ArtSection: {
        type: 'object',
        required: ['id', 'thumbs', 'full'],
        properties: {
          id: { type: 'string', example: 'doodle' },
          thumbs: { type: 'array', items: { $ref: '#/components/schemas/MediaUrl' } },
          full: { type: 'array', items: { $ref: '#/components/schemas/MediaUrl' } },
        },
      },

      MosaicClip: {
        type: 'object',
        required: ['video', 'poster', 'label', 'worldId', 'worldName'],
        properties: {
          video: { $ref: '#/components/schemas/MediaUrl' },
          poster: { $ref: '#/components/schemas/MediaUrl' },
          label: { type: 'string' },
          worldId: { type: 'string' },
          worldName: { type: 'string' },
        },
      },

      Progress: {
        type: 'object',
        required: ['categories', 'planets'],
        properties: {
          categories: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'label'],
              properties: { id: { type: 'string' }, label: { type: 'string' } },
            },
          },
          planets: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'name', 'progress'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                progress: {
                  type: 'object',
                  description: 'Percentual por categoria.',
                  additionalProperties: { type: 'integer', minimum: 0, maximum: 100 },
                },
              },
            },
          },
        },
      },

      // ── Envelopes de resposta ──────────────────────────────────────────
      WorldListResponse: {
        type: 'object',
        required: ['locale', 'worlds'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          worlds: { type: 'array', items: { $ref: '#/components/schemas/World' } },
        },
      },
      WorldResponse: {
        type: 'object',
        required: ['locale', 'world'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          world: { $ref: '#/components/schemas/World' },
        },
      },
      BichittoListResponse: {
        type: 'object',
        required: ['locale', 'bichittos'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          bichittos: { type: 'array', items: { $ref: '#/components/schemas/Bichitto' } },
        },
      },
      BichittoResponse: {
        type: 'object',
        required: ['locale', 'bichitto'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          bichitto: { $ref: '#/components/schemas/Bichitto' },
        },
      },
      Localized: {
        type: 'object',
        description: 'Um texto nos dois idiomas.',
        required: ['pt', 'en'],
        properties: { pt: { type: 'string' }, en: { type: 'string' } },
      },
      LocalizedBody: {
        type: 'object',
        description: 'Parágrafos nos dois idiomas.',
        required: ['pt', 'en'],
        properties: {
          pt: { type: 'array', items: { type: 'string' } },
          en: { type: 'array', items: { type: 'string' } },
        },
      },
      OverlayBook: {
        type: 'object',
        required: ['id', 'title', 'description', 'body', 'cover', 'buyUrl', 'onlyLocale'],
        properties: {
          id: { type: 'string' },
          title: { $ref: '#/components/schemas/Localized' },
          description: { $ref: '#/components/schemas/Localized' },
          body: { $ref: '#/components/schemas/LocalizedBody' },
          cover: { $ref: '#/components/schemas/MediaUrl' },
          buyUrl: {
            type: 'string',
            description: 'Vazio quando a edição ainda não está à venda.',
          },
          onlyLocale: {
            type: 'string',
            description:
              '`pt` ou `en` quando a edição só existe num idioma; vazio quando existe nos dois.',
          },
        },
      },
      OverlayLegalDocument: {
        type: 'object',
        required: ['title', 'lastUpdate', 'intro', 'sections', 'contact', 'url'],
        properties: {
          title: { type: 'string' },
          lastUpdate: { type: 'string' },
          intro: { type: 'string' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              required: ['tag', 'body'],
              properties: { tag: { type: 'string' }, body: { type: 'string' } },
            },
          },
          contact: { type: 'string' },
          url: { type: 'string', description: 'A mesma política no site.' },
        },
      },
      AppOverlay: {
        type: 'object',
        required: [
          'schemaVersion',
          'universe',
          'messages',
          'relations',
          'books',
          'legal',
          'sectionHeaders',
          'comingSoon',
        ],
        properties: {
          schemaVersion: { type: 'integer', enum: [1] },
          universe: {
            type: 'object',
            description: 'A abertura da seção Kammara, que no app é uma página.',
            required: ['title', 'summary', 'body'],
            properties: {
              title: { $ref: '#/components/schemas/Localized' },
              summary: { $ref: '#/components/schemas/Localized' },
              body: { $ref: '#/components/schemas/LocalizedBody' },
            },
          },
          messages: {
            type: 'object',
            description: 'Bloco `kammara` das mensagens de i18n, por idioma.',
          },
          relations: {
            type: 'object',
            description:
              'Grafo de conexões: id do verbete para os ids ligados a ele. Editorial — não é derivado do texto.',
            additionalProperties: { type: 'array', items: { type: 'string' } },
          },
          books: { type: 'array', items: { $ref: '#/components/schemas/OverlayBook' } },
          legal: {
            type: 'object',
            required: ['pt', 'en'],
            properties: {
              pt: { $ref: '#/components/schemas/OverlayLegalDocument' },
              en: { $ref: '#/components/schemas/OverlayLegalDocument' },
            },
          },
          sectionHeaders: {
            type: 'object',
            description: 'Subtítulo de cada seção do app, com os títulos que o resolvem.',
          },
          comingSoon: {
            type: 'object',
            required: ['books', 'characters', 'planets'],
            properties: {
              books: {
                type: 'object',
                required: ['pt', 'en'],
                properties: { pt: { type: 'integer' }, en: { type: 'integer' } },
              },
              characters: {
                type: 'integer',
                description:
                  'Todos os registros autorais, inclusive os ainda não publicados.',
              },
              planets: { type: 'integer' },
            },
          },
        },
      },
      ArtResponse: {
        type: 'object',
        required: ['sections'],
        properties: {
          sections: { type: 'array', items: { $ref: '#/components/schemas/ArtSection' } },
        },
      },
      ProgressResponse: {
        type: 'object',
        required: ['locale', 'progress'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          progress: {
            oneOf: [{ $ref: '#/components/schemas/Progress' }, { type: 'null' }],
          },
        },
      },
      EventsResponse: {
        type: 'object',
        required: ['locale', 'events'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          events: {
            type: ['object', 'null'],
            description:
              'Conteúdo bilíngue — ver a nota na descrição do endpoint.',
            properties: {
              categories: { type: 'array', items: { type: 'object' } },
              items: { type: 'array', items: { type: 'object' } },
              planetNames: {
                type: 'object',
                additionalProperties: { type: 'string' },
              },
            },
          },
        },
      },
      MosaicResponse: {
        type: 'object',
        required: ['locale', 'clips'],
        properties: {
          locale: { $ref: '#/components/schemas/Locale' },
          clips: { type: 'array', items: { $ref: '#/components/schemas/MosaicClip' } },
        },
      },
    },
  },
} as const;

export type OpenApiDocument = typeof openApiDocument;
