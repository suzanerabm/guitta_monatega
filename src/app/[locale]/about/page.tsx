import type { Metadata } from 'next';
import { Box, Heading, Text, Flex, Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('pageTitle') };
}

type Section = {
  num: string;
  tag: string;
  body: string;
};

// Gradient from Zeco orange (#F58020) to Kammara deep blue (#2D1B69)
// Linear interpolation across 7 sections
const sectionColors = [
  '#F58020', // 01 — orange pure
  '#CE7224', // 02
  '#A76328', // 03
  '#80552D', // 04
  '#594631', // 05
  '#433335', // 06
  '#2D1B69', // 07 — blue pure
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const sections = t.raw('sections') as Section[];

  const prefix = `/${locale}`;
  const artLabel = locale === 'en' ? 'Art' : 'Arte';

  return (
    <Box bg="white" color="ink">
      {/* HERO */}
      <Box
        as="section"
        minH={{ base: 'auto', md: '70vh' }}
        display="flex"
        alignItems="center"
        px={{ base: '1.5rem', md: '4rem' }}
        pt={{ base: '7rem', md: '9rem' }}
        pb={{ base: '3rem', md: '5rem' }}
        maxW="820px"
        mx="auto"
      >
        <Box opacity={0} animation="fadeIn 0.9s ease 0.15s forwards">
          <Text
            fontSize="11px"
            letterSpacing="wider"
            textTransform="uppercase"
            color="inkMuted"
            fontWeight="medium"
            mb="0.5rem"
          >
            {t('heroLabel')}
          </Text>
          <Heading
            as="h1"
            fontSize={{ base: '3rem', md: 'clamp(3.5rem, 8vw, 6rem)' }}
            fontWeight="bold"
            lineHeight="0.95"
            color="ink"
            mb="0.8rem"
          >
            {t('heroTitle')}
          </Heading>
          <Text
            fontSize="0.95rem"
            color="inkSoft"
            fontWeight="light"
            lineHeight={1.55}
            maxW="460px"
          >
            {t('heroSub')}
          </Text>
        </Box>
      </Box>

      {/* MAIN */}
      <Box as="main" maxW="820px" mx="auto" px={{ base: '1.5rem', md: '4rem' }} pb={{ base: '3rem', md: '5rem' }}>
        {/* PAGE HEADER */}
        <Box
          textAlign="center"
          py="2rem"
          borderBottom="0.5px solid"
          borderColor="borderSoft"
        >
          <Heading
            as="h2"
            fontSize="1.72rem"
            fontWeight="regular"
            color="ink"
            letterSpacing="tight"
          >
            {t('title')}
          </Heading>
          <Text
            fontSize="14px"
            color="inkMuted"
            letterSpacing="normal"
            mt="0.4rem"
          >
            {t('date')}
          </Text>
        </Box>

        {/* SECTIONS */}
        {sections.map((section, idx) => {
          const accent = sectionColors[idx] ?? sectionColors[sectionColors.length - 1];
          return (
            <Box
              key={section.num}
              display="grid"
              gridTemplateColumns={{ base: '1fr', md: '140px 1fr' }}
              gap={{ base: '0.6rem', md: '2.5rem' }}
              py={{ base: '2rem', md: '2.5rem' }}
              borderBottom="0.5px solid"
              borderColor="borderSoft"
              opacity={0}
              animation={`fadeIn 0.7s ease ${0.2 + idx * 0.05}s forwards`}
            >
              <Flex
                direction={{ base: 'row', md: 'column' }}
                gap={{ base: '0.8rem', md: '0' }}
                alignItems={{ base: 'center', md: 'flex-start' }}
                pt="2px"
              >
                <Text
                  fontSize="13px"
                  letterSpacing="normal"
                  color={accent}
                  fontWeight="medium"
                  mb={{ base: 0, md: '2px' }}
                >
                  {section.num}
                </Text>
                <Text
                  fontSize="12px"
                  letterSpacing="normal"
                  color={accent}
                  textTransform="uppercase"
                  lineHeight={1.4}
                >
                  {section.tag}
                </Text>
              </Flex>
              <Text
                fontSize="1.08rem"
                lineHeight={1.65}
                color="inkSoft"
                fontWeight="light"
              >
                {section.body}
              </Text>
            </Box>
          );
        })}

        {/* DECLARATION */}
        <Box
          mt="3rem"
          py="3rem"
          px={{ base: '1.5rem', md: '2.5rem' }}
          bgImage="linear-gradient(to right, #F58020, #2D1B69)"
          borderRadius="6px"
          textAlign="center"
          opacity={0}
          animation="fadeIn 0.8s ease 0.8s forwards"
        >
          <Text
            fontSize="1.12rem"
            fontWeight="light"
            lineHeight={1.65}
            color="white"
            fontStyle="italic"
          >
            {t('declaration')}
          </Text>
        </Box>

        {/* UNIVERSES */}
        <Box
          mt="3rem"
          pt="2rem"
          borderTop="1px solid"
          borderColor="borderSoft"
          opacity={0}
          animation="fadeIn 1s ease 0.9s forwards"
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
              <NextLink href={`${prefix}/art`}>{artLabel}</NextLink>
            </ChakraLink>
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
          </Flex>
        </Box>

        {/* CONTACT */}
        <Box
          mt="3rem"
          pt="2rem"
          borderTop="1px solid"
          borderColor="borderSoft"
          opacity={0}
          animation="fadeIn 1s ease 1s forwards"
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
    </Box>
  );
}
