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
      {/* O poster tem aspectRatio 360/540 e maxW=420px próprios. Aqui ele
          precisa preencher a moldura 1:1,6 inteira: forçamos width/height 100%,
          soltamos o maxW e anulamos o aspectRatio para o Box do poster esticar
          até 1000×1600. Os heróis são <img width:auto> — NÃO distorcem; só a
          moldura fica mais alta, e o espaço extra vira respiro no topo. */}
      <Box
        position="absolute"
        inset={0}
        css={{
          '& > [data-testid="kammara-saga-poster"]': {
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            aspectRatio: 'auto',
          },
        }}
      >
        <KammaraSagaPoster frozen={frozen} {...posterProps} />
      </Box>
    </Box>
  );
}
