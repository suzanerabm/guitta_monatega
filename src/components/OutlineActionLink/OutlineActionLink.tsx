import { Box } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

interface OutlineActionLinkProps {
  href: string;
  children: ReactNode;
  color?: string;
}

/** Shared outlined pill used for secondary navigation actions. */
export function OutlineActionLink({ href, children, color = 'ink' }: OutlineActionLinkProps) {
  return (
    <NextLink href={href} style={{ textDecoration: 'none' }}>
      <Box
        as="span"
        display="inline-flex"
        alignItems="center"
        border="1px solid"
        borderColor={color}
        borderRadius="full"
        color={color}
        px="xl"
        py="md"
        fontSize="sm"
        fontWeight="semibold"
        letterSpacing="wide"
        textTransform="uppercase"
        whiteSpace="nowrap"
        transitionProperty="opacity"
        transitionDuration="default"
        _hover={{ opacity: 0.72 }}
      >
        {children}
      </Box>
    </NextLink>
  );
}
