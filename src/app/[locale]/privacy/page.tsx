import type { Metadata } from 'next';
import { Box, Heading, Text, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: t('pageTitle') };
}

interface Section {
  tag: string;
  body: string;
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const sections = t.raw('sections') as Section[];
  const contact = t('contact');

  return (
    <Box
      as="main"
      px={{ base: 'lg', md: '3xl' }}
      py={{ base: '4xl', md: '5xl' }}
      maxW="720px"
      mx="auto"
    >
      <Flex direction="column" gap="lg">
        <Heading
          as="h1"
          fontSize={{ base: '2.4rem', md: '3rem' }}
          fontWeight="semibold"
          letterSpacing="tight"
          lineHeight={1.05}
          color="ink"
        >
          {t('title')}
        </Heading>
        <Text fontSize="sm" opacity={0.65} color="ink">
          {t('lastUpdate')}
        </Text>
        <Text fontSize={{ base: 'base', md: 'md' }} lineHeight={1.7} color="ink">
          {t('intro')}
        </Text>

        <Flex direction="column" gap="xl" mt="lg">
          {sections.map((s) => (
            <Box key={s.tag}>
              <Heading
                as="h2"
                fontSize={{ base: '1.1rem', md: '1.25rem' }}
                fontWeight="semibold"
                letterSpacing="wide"
                textTransform="uppercase"
                mb="sm"
                color="ink"
              >
                {s.tag}
              </Heading>
              <Text fontSize={{ base: 'base', md: 'md' }} lineHeight={1.7} color="ink">
                {s.body}
              </Text>
            </Box>
          ))}
        </Flex>

        <Box mt="lg">
          <ChakraLink
            href={`mailto:${contact}`}
            fontSize={{ base: 'base', md: 'md' }}
            color="ink"
            textDecoration="underline"
            textUnderlineOffset="3px"
          >
            {contact}
          </ChakraLink>
        </Box>
      </Flex>
    </Box>
  );
}
