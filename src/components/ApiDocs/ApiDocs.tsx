'use client';
import { Box, Flex, Heading, Text, chakra } from '@chakra-ui/react';

/**
 * ApiDocs — renderiza um documento OpenAPI 3.1 como página legível.
 *
 * Feito à mão em vez de embutir o Swagger UI por dois motivos: o CSP do
 * projeto (`script-src 'self'`) bloqueia qualquer bundle vindo de CDN, e a
 * alternativa self-hosted é uma dependência de ~1MB com CSS próprio que não
 * segue o tema. Para "try it out" existe o spec cru, que Swagger Editor,
 * Postman e openapi-generator importam direto.
 *
 * Componente de apresentação puro: recebe o documento e não sabe de onde veio.
 *
 * `'use client'` porque os componentes do Chakra são client components — o
 * padrão do resto do projeto. A página que o usa continua sendo server
 * component, e é lá que mora o gate do `API_DOCS`.
 */

type Json = Record<string, unknown>;

export interface ApiDocsProps {
  /** Documento OpenAPI 3.1. */
  doc: Json;
  /** Caminho onde o spec cru é servido, para o link de download. */
  specUrl: string;
}

/**
 * Renderiza a descrição do spec com o mínimo de markdown que ela usa:
 * `**negrito**` e `` `código` ``. Vira nó React de propósito — montar HTML
 * por string aqui exigiria escapar na mão, e não há ganho nenhum nisso.
 */
function Prose({ children }: { children?: unknown }) {
  if (typeof children !== 'string' || !children.trim()) return null;

  const parts = children.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

  return (
    <Text color="fgSoft" fontSize="base" lineHeight="1.65" whiteSpace="pre-wrap">
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text as="strong" key={i} color="fg">
              {part.slice(2, -2)}
            </Text>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <Text
              as="code"
              key={i}
              fontFamily="monospace"
              fontSize="0.9em"
              px="0.35em"
              py="0.1em"
              borderRadius="4px"
              bg="surface"
            >
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </Text>
  );
}

function MethodBadge({ method }: { method: string }) {
  // Um tom só: a API é toda GET. Se um dia entrar escrita, aí sim vale um
  // token por verbo no tema.
  return (
    <Box
      as="span"
      textStyle="label"
      fontSize="xs"
      px="0.5rem"
      py="0.15rem"
      borderRadius="4px"
      color="white"
      bg="ink"
      textTransform="uppercase"
      flexShrink={0}
    >
      {method}
    </Box>
  );
}

function ParamRow({ param }: { param: Json }) {
  const schema = (param.schema ?? {}) as Json;
  const enumValues = schema.enum as string[] | undefined;
  return (
    <Box borderTopWidth="1px" borderColor="borderColor" py="0.6rem">
      <Flex gap="0.5rem" align="baseline" wrap="wrap">
        <Text as="code" fontFamily="monospace" fontSize="base" color="fg">
          {String(param.name)}
        </Text>
        <Text fontSize="xs" color="fgMuted">
          {String(param.in)}
          {param.required ? ' · obrigatório' : ' · opcional'}
          {schema.type ? ` · ${String(schema.type)}` : ''}
        </Text>
        {enumValues && (
          <Text fontSize="xs" color="fgMuted" fontFamily="monospace">
            {enumValues.join(' | ')}
          </Text>
        )}
      </Flex>
      <Prose>{param.description}</Prose>
    </Box>
  );
}

function Operation({
  path,
  method,
  op,
}: {
  path: string;
  method: string;
  op: Json;
}) {
  const params = (op.parameters ?? []) as Json[];
  const responses = (op.responses ?? {}) as Record<string, Json>;

  return (
    <Box
      borderWidth="1px"
      borderColor="borderColor"
      borderRadius="10px"
      overflow="hidden"
      mb="1.2rem"
    >
      <Flex
        align="center"
        gap="0.75rem"
        p={{ base: '0.8rem', md: '1rem' }}
        bg="surface"
        wrap="wrap"
      >
        <MethodBadge method={method} />
        <Text as="code" fontFamily="monospace" fontSize="md" color="fg" fontWeight="semibold">
          {path}
        </Text>
        <Text fontSize="base" color="fgSoft">
          {String(op.summary ?? '')}
        </Text>
      </Flex>

      <Box p={{ base: '0.8rem', md: '1rem' }}>
        <Prose>{op.description}</Prose>

        {params.length > 0 && (
          <Box mt="1rem">
            <Text textStyle="label" fontSize="xs" color="fgMuted" mb="0.2rem">
              Parâmetros
            </Text>
            {params.map((p) => (
              <ParamRow key={String(p.name)} param={p} />
            ))}
          </Box>
        )}

        <Box mt="1rem">
          <Text textStyle="label" fontSize="xs" color="fgMuted" mb="0.2rem">
            Respostas
          </Text>
          {Object.entries(responses).map(([code, res]) => (
            <Box key={code} borderTopWidth="1px" borderColor="borderColor" py="0.6rem">
              <Flex gap="0.6rem" align="baseline" wrap="wrap">
                <Text
                  as="code"
                  fontFamily="monospace"
                  fontSize="base"
                  color={code.startsWith('2') ? 'fg' : 'fgSoft'}
                  fontWeight="semibold"
                >
                  {code}
                </Text>
                {/* Passa pelo Prose: as descrições usam `código` entre crases. */}
                <Prose>{res.description}</Prose>
              </Flex>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function SchemaSummary({ name, schema }: { name: string; schema: Json }) {
  const props = (schema.properties ?? {}) as Record<string, Json>;
  const required = new Set((schema.required ?? []) as string[]);

  const describe = (s: Json): string => {
    if (s.$ref) return String(s.$ref).split('/').pop() ?? '?';
    if (s.type === 'array') {
      return `${describe((s.items ?? {}) as Json)}[]`;
    }
    if (s.oneOf) {
      return (s.oneOf as Json[]).map(describe).join(' | ');
    }
    // No OpenAPI 3.1 o tipo pode ser uma lista (`['object', 'null']`).
    if (Array.isArray(s.type)) return (s.type as string[]).join(' | ');
    return String(s.type ?? 'object');
  };

  return (
    <Box borderWidth="1px" borderColor="borderColor" borderRadius="10px" p="1rem" mb="0.8rem">
      <Text as="code" fontFamily="monospace" fontSize="md" color="fg" fontWeight="semibold">
        {name}
      </Text>
      <Prose>{schema.description}</Prose>
      <Box mt="0.6rem">
        {Object.entries(props).map(([key, value]) => (
          <Flex key={key} gap="0.6rem" align="baseline" wrap="wrap" py="0.2rem">
            <Text as="code" fontFamily="monospace" fontSize="base" color="fg">
              {key}
              {required.has(key) ? '' : '?'}
            </Text>
            <Text fontSize="xs" color="fgMuted" fontFamily="monospace">
              {describe(value)}
            </Text>
          </Flex>
        ))}
      </Box>
    </Box>
  );
}

export function ApiDocs({ doc, specUrl }: ApiDocsProps) {
  const info = (doc.info ?? {}) as Json;
  const paths = (doc.paths ?? {}) as Record<string, Record<string, Json>>;
  const servers = (doc.servers ?? []) as Json[];
  const schemas = ((doc.components as Json)?.schemas ?? {}) as Record<string, Json>;

  return (
    <Box
      maxW="900px"
      mx="auto"
      px={{ base: '1rem', md: '2rem' }}
      py={{ base: '2rem', md: '3rem' }}
      color="fg"
    >
      <Heading as="h1" textStyle="heading" fontSize={{ base: 'xl', md: '2xl' }} m={0}>
        {String(info.title ?? 'API')}
      </Heading>
      <Text color="fgMuted" fontSize="sm" mt="0.3rem">
        OpenAPI {String(doc.openapi)} · versão {String(info.version)}
      </Text>

      <Box mt="1.2rem">
        <Prose>{info.description}</Prose>
      </Box>

      <Flex gap="0.8rem" mt="1.2rem" wrap="wrap">
        <chakra.a
          href={specUrl}
          textStyle="label"
          fontSize="sm"
          borderWidth="1px"
          borderColor="borderColor"
          borderRadius="6px"
          px="0.8rem"
          py="0.4rem"
          color="fg"
        >
          Baixar openapi.json
        </chakra.a>
      </Flex>

      {servers.length > 0 && (
        <Box mt="1.6rem">
          <Text textStyle="label" fontSize="xs" color="fgMuted">
            Servidores
          </Text>
          {servers.map((s) => (
            <Flex key={String(s.url)} gap="0.6rem" align="baseline" wrap="wrap" py="0.15rem">
              <Text as="code" fontFamily="monospace" fontSize="base">
                {String(s.url)}
              </Text>
              <Text fontSize="xs" color="fgMuted">
                {String(s.description ?? '')}
              </Text>
            </Flex>
          ))}
        </Box>
      )}

      <Heading as="h2" textStyle="heading" fontSize="lg" mt="2.5rem" mb="1rem">
        Endpoints
      </Heading>
      {Object.entries(paths).map(([path, methods]) =>
        Object.entries(methods).map(([method, op]) => (
          <Operation key={`${method} ${path}`} path={path} method={method} op={op} />
        )),
      )}

      <Heading as="h2" textStyle="heading" fontSize="lg" mt="2.5rem" mb="1rem">
        Modelos
      </Heading>
      {Object.entries(schemas).map(([name, schema]) => (
        <SchemaSummary key={name} name={name} schema={schema} />
      ))}
    </Box>
  );
}
