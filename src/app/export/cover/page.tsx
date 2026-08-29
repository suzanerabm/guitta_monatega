import { Box } from '@chakra-ui/react';
import { KammaraSagaPosterCover } from '@/components/KammaraSagaPosterCover';

// Rota sempre dinâmica e sem cache — as artes da capa mudam com o mesmo nome
// de arquivo, então o navegador não pode reusar versões antigas na prévia.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Rota de export (não faz parte do site). Renderiza a capa da saga num
 * container de tamanho fixo 1000×1600 para o script de screenshot capturar
 * em 1600×2560 (deviceScaleFactor 1.6). Sem chrome: está fora de [locale]
 * (o middleware do next-intl ignora /export, então não há Header/Footer).
 */
export default function CoverExportPage() {
  return (
    <Box
      css={{
        width: '1000px',
        height: '1600px',
        margin: 0,
        background: '#0a0a12',
        overflow: 'hidden',
      }}
    >
      {/* Esconde o badge de dev-tools do Next (portal fixo) pra não vazar no
          screenshot da capa. Só existe em dev; inofensivo em produção. */}
      <style>{`
        nextjs-portal, [data-nextjs-toast], #__next-build-watcher,
        [data-next-badge-root], [data-next-badge] { display: none !important; }
      `}</style>
      <Box css={{ width: '1000px', height: '1600px' }} data-export-target="cover">
        <KammaraSagaPosterCover background="/imgs/kammara/_capa/fundo.jpg" />
      </Box>
    </Box>
  );
}
