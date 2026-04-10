import { Box, Heading, Text, Flex, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const paragraphs = t.raw('paragraphs') as string[];

  const prefix = `/${locale}`;
  const artLabel = locale === 'en' ? 'Art' : 'Arte';

  return (
    <Box
      maxW="680px"
      mx="auto"
      pt={{ base: '7rem', md: '8rem' }}
      px={{ base: '1.5rem', md: '3rem' }}
      pb={{ base: '3rem', md: '4rem' }}
    >
      <Heading
        as="h1"
        fontSize="h2"
        fontWeight="bold"
        letterSpacing="tight"
        color="ink"
        mb="2rem"
        opacity={0}
        animation="fadeIn 1s ease 0.2s forwards"
      >
        {t('title')}
      </Heading>

      <Box
        fontSize="1.05rem"
        lineHeight={1.8}
        color="inkSoft"
        fontWeight="light"
        opacity={0}
        animation="fadeIn 1s ease 0.4s forwards"
      >
        {paragraphs.map((p, i) => (
          <Text key={i} mt={i === 0 ? 0 : '1rem'}>
            {p}
          </Text>
        ))}
      </Box>

      <Box
        mt="3rem"
        pt="2rem"
        borderTop="1px solid"
        borderColor="borderSoft"
        opacity={0}
        animation="fadeIn 1s ease 0.6s forwards"
      >
        <Text
          fontSize="h4"
          letterSpacing="wider"
          textTransform="uppercase"
          color="inkMuted"
          mb="1rem"
        >
          {t('universesLabel')}
        </Text>
        <Flex direction="column" gap="0.5rem">
          <ChakraLink
            asChild
            fontSize="1rem"
            color="ink"
            fontWeight="regular"
            transition="color 0.2s"
            _hover={{ color: 'inkMuted', textDecoration: 'none' }}
          >
            <NextLink href={`${prefix}/bichittos`}>Bichittos</NextLink>
          </ChakraLink>
          <ChakraLink
            asChild
            fontSize="1rem"
            color="ink"
            fontWeight="regular"
            transition="color 0.2s"
            _hover={{ color: 'inkMuted', textDecoration: 'none' }}
          >
            <NextLink href={`${prefix}/kammara`}>Kammara</NextLink>
          </ChakraLink>
          <ChakraLink
            asChild
            fontSize="1rem"
            color="ink"
            fontWeight="regular"
            transition="color 0.2s"
            _hover={{ color: 'inkMuted', textDecoration: 'none' }}
          >
            <NextLink href={`${prefix}/art`}>{artLabel}</NextLink>
          </ChakraLink>
        </Flex>
      </Box>

      <Box
        mt="3rem"
        pt="2rem"
        borderTop="1px solid"
        borderColor="borderSoft"
        opacity={0}
        animation="fadeIn 1s ease 0.6s forwards"
      >
        <Text
          fontSize="h4"
          letterSpacing="wider"
          textTransform="uppercase"
          color="inkMuted"
          mb="1rem"
        >
          {t('contactLabel')}
        </Text>
        <Flex direction="column" gap="0.5rem">
          <ChakraLink
            href="mailto:placeholder@email.com"
            fontSize="1rem"
            color="ink"
            fontWeight="regular"
            transition="color 0.2s"
            _hover={{ color: 'inkMuted', textDecoration: 'none' }}
          >
            placeholder@email.com
          </ChakraLink>
        </Flex>
      </Box>
    </Box>
  );
}
