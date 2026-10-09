'use client';
import { Box, Flex, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useChromeTint } from '@/components/ChromeTint';
import { GradientLine } from '@/components/GradientLine';

interface FooterProps {
  followLabel: string;
  socialProfiles: Array<{
    name: string;
    instagramUrl?: string;
    facebookUrl?: string;
  }>;
  aboutPath: string;
  aboutLabel: string;
  licensingPath: string;
  licensingLabel: string;
  privacyPath: string;
  privacyLabel: string;
  /** Aviso de direitos autorais (i18n). Mostrado discreto abaixo dos links. */
  copyright?: string;
  /** Versão do site (vem do package.json, resolvida no servidor). */
  version?: string;
}

function InstagramMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="1em" height="1em" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookMark() {
  return (
    <Box
      aria-hidden
      as="span"
      fontFamily="body"
      fontSize="md"
      fontWeight="semibold"
      lineHeight="shorter"
      textTransform="lowercase"
    >
      f
    </Box>
  );
}

export function Footer({
  followLabel,
  socialProfiles,
  aboutPath,
  aboutLabel,
  licensingPath,
  licensingLabel,
  privacyPath,
  privacyLabel,
  copyright,
  version,
}: FooterProps) {
  const { tintColor } = useChromeTint();

  const bg = tintColor ? tintColor : 'headerBg';
  const stripBg = tintColor ? tintColor : 'surface';
  const textColor = tintColor ? 'textOverlayStrong' : 'fg';

  const linkStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 300,
    letterSpacing: '0.1em',
    textTransform: 'lowercase',
    color: 'inherit',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  };

  return (
    <Box
      as="footer"
      bg={bg}
      color={textColor}
      transition="background 0.4s ease, color 0.4s ease"
    >
      <Box
        as="section"
        aria-label={followLabel}
        bg={stripBg}
        px="lg"
        py={{ base: 'xl', md: '2xl' }}
        borderTopWidth="thin"
        borderBottomWidth="thin"
        borderColor={tintColor ? 'textOverlayGhost' : 'borderColor'}
      >
        <Flex
          as="nav"
          aria-label={followLabel}
          direction="column"
          align="center"
          gap={{ base: 'lg', md: 'xl' }}
          width="100%"
          maxWidth="6xl"
          mx="auto"
        >
          <Box
            as="p"
            m={0}
            fontSize="xs"
            fontWeight="semibold"
            letterSpacing="widest"
            textTransform="uppercase"
            opacity={0.7}
          >
            {followLabel}
          </Box>

          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'flex-start' }}
            justify="center"
            gap={{ base: 'lg', md: 'xl' }}
            width="100%"
          >
            {socialProfiles.map((profile) => (
              <Flex
                key={profile.name}
                direction="column"
                align="center"
                gap="md"
                flex={{ md: 1 }}
              >
                <Box
                  as="p"
                  m={0}
                  fontSize="sm"
                  fontWeight="medium"
                  letterSpacing="wide"
                  textTransform="uppercase"
                >
                  {profile.name}
                </Box>
                <Flex gap="sm" align="center" justify="center" flexWrap="wrap">
                  {profile.instagramUrl ? (
                    <ChakraLink
                      href={profile.instagramUrl}
                      aria-label={`${profile.name} Instagram`}
                      target="_blank"
                      rel="noopener noreferrer"
                      display="inline-flex"
                      alignItems="center"
                      gap="sm"
                      px="md"
                      py="sm"
                      borderWidth="thin"
                      borderColor="currentColor"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="light"
                      letterSpacing="normal"
                      textDecoration="none"
                      color="inherit"
                      transition="opacity 0.2s ease, transform 0.2s ease"
                      _hover={{ opacity: 0.65, transform: 'translateY(-2px)' }}
                    >
                      <InstagramMark />
                      Instagram
                    </ChakraLink>
                  ) : (
                    <Flex
                      as="span"
                      align="center"
                      gap="sm"
                      px="md"
                      py="sm"
                      borderWidth="thin"
                      borderColor="currentColor"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="light"
                      opacity={0.25}
                    >
                      <InstagramMark />
                      Instagram
                    </Flex>
                  )}
                  {profile.facebookUrl ? (
                    <ChakraLink
                      href={profile.facebookUrl}
                      aria-label={`${profile.name} Facebook`}
                      target="_blank"
                      rel="noopener noreferrer"
                      display="inline-flex"
                      alignItems="center"
                      gap="sm"
                      px="md"
                      py="sm"
                      borderWidth="thin"
                      borderColor="currentColor"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="light"
                      letterSpacing="normal"
                      textDecoration="none"
                      color="inherit"
                      transition="opacity 0.2s ease, transform 0.2s ease"
                      _hover={{ opacity: 0.65, transform: 'translateY(-2px)' }}
                    >
                      <FacebookMark />
                      Facebook
                    </ChakraLink>
                  ) : (
                    <Flex
                      as="span"
                      align="center"
                      gap="sm"
                      px="md"
                      py="sm"
                      borderWidth="thin"
                      borderColor="currentColor"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="light"
                      opacity={0.25}
                    >
                      <FacebookMark />
                      Facebook
                    </Flex>
                  )}
                </Flex>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Box>

      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="lg"
        width="100%"
        px="lg"
        py={{ base: 'xl', md: '2xl' }}
      >
        <Flex gap="lg" align="center" justify="center" flexWrap="wrap" textAlign="center">
          <NextLink href={aboutPath} style={linkStyle}>
            {aboutLabel}
          </NextLink>
          <Box
            w="2px"
            h="2px"
            borderRadius="full"
            bg={tintColor ? 'textOverlayStrong' : 'borderColor'}
            opacity={0.6}
          />
          <NextLink href={privacyPath} style={linkStyle}>
            {privacyLabel}
          </NextLink>
          <Box
            w="2px"
            h="2px"
            borderRadius="full"
            bg={tintColor ? 'textOverlayStrong' : 'borderColor'}
            opacity={0.6}
          />
          <NextLink href={licensingPath} style={linkStyle}>
            {licensingLabel}
          </NextLink>
        </Flex>

        {/* Aviso de direitos autorais — discreto, abaixo dos links. Não impede
            cópia (impossível), mas dá respaldo legal de autoria. */}
        {copyright && (
          <Flex
            direction="column"
            align="center"
            gap="sm"
            width="100%"
          >
            <Box width={{ base: '80%', md: '50%' }} opacity={0.35}>
              <GradientLine color="currentColor" />
            </Box>
            <Box
              as="p"
              m={0}
              fontSize="0.7rem"
              fontWeight={300}
              letterSpacing="0.08em"
              opacity={0.55}
              textAlign="center"
            >
              {copyright}
            </Box>
          </Flex>
        )}

        {version && (
          <Box
            as="p"
            m={0}
            fontSize="xs"
            fontWeight="light"
            letterSpacing="normal"
            opacity={0.4}
            textAlign="center"
          >
            v{version}
          </Box>
        )}
      </Flex>
    </Box>
  );
}
