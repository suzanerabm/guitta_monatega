import { Flex, Text } from '@chakra-ui/react';
import { Sparkles } from 'lucide-react';

interface SoonBadgeProps {
  label?: string;
  overlay?: boolean;
}

export function SoonBadge({ label = 'soon', overlay = false }: SoonBadgeProps) {
  if (overlay) {
    return (
      <Flex
        position="absolute"
        inset={0}
        align="center"
        justify="center"
        bg="bgOverlayHeavy"
        borderRadius="inherit"
        zIndex={2}
      >
        <Flex
          align="center"
          gap="xs"
          px="sm"
          py="xs"
          borderRadius="full"
          border="1px solid"
          borderColor="textOverlayDim"
          color="textOverlayDim"
          fontSize="sm"
          fontWeight="light"
          letterSpacing="wider"
          textTransform="uppercase"
        >
          <Sparkles size={12} />
          <Text fontFamily="heading">{label}</Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      as="span"
      display="inline-flex"
      align="center"
      gap="xs"
      px="sm"
      py="xs"
      borderRadius="full"
      border="1px solid"
      borderColor="fgMuted"
      color="fgMuted"
      fontSize="sm"
      fontWeight="light"
      letterSpacing="wider"
      textTransform="uppercase"
    >
      <Sparkles size={12} />
      <Text as="span" fontFamily="heading">{label}</Text>
    </Flex>
  );
}
