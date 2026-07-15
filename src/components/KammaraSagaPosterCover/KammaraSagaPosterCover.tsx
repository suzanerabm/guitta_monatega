'use client';
import { Box } from '@chakra-ui/react';
import { KammaraSagaPoster, type KammaraSagaPosterProps } from '@/components/KammaraSagaPoster';

export type KammaraSagaPosterCoverProps = KammaraSagaPosterProps;

/**
 * KammaraSagaPosterCover — variante 1:1,6 (capa de EPUB) do KammaraSagaPoster.
 *
 * Reusa o poster inteiro; só troca a moldura de 2:3 para 1000/1600 (mais alta).
 * Os heróis mantêm tamanho — o espaço vertical extra vira respiro no topo.
 * O poster interno preenche 100% do container do cover.
 */
export function KammaraSagaPosterCover({
  'data-testid': testId,
  frozen = true,
  ...posterProps
}: KammaraSagaPosterCoverProps) {
  return (
    <Box
      data-testid={testId ?? 'kammara-saga-poster-cover'}
      position="relative"
      width="100%"
      style={{ aspectRatio: '1000 / 1600' }}
    >
      <Box position="absolute" inset={0} css={{ '& > *': { maxWidth: 'none', height: '100%' } }}>
        <KammaraSagaPoster frozen={frozen} {...posterProps} />
      </Box>
    </Box>
  );
}
