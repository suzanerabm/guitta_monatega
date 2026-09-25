import type { Metadata } from 'next';
import { Box, Flex, Heading, Link, Text } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/seo';

type Section = { num: string; tag: string; items: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'licensing' });
  return buildPageMetadata({
    locale,
    route: 'licensing-partnerships',
    title: t('pageTitle'),
    description:
      locale === 'en'
        ? 'Licensing, publishing, animation, interactive media, and creative partnership opportunities with Guitta Monatega Studio.'
        : 'Oportunidades de licenciamento, publicação, animação, mídia interativa e parcerias criativas com o Guitta Monatega Studio.',
  });
}

export default async function LicensingPartnershipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('licensing');
  const sections = t.raw('sections') as Section[];
  const contactEmail = t('contactEmail');

  return (
    <Box bg="white" color="ink">
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
        <Box>
          <Text fontSize="h4" letterSpacing="wider" textTransform="uppercase" color="inkMuted" fontWeight="medium" fontFamily="heading" mb="sm">
            {t('heroLabel')}
          </Text>
          <Heading as="h1" fontSize={{ base: '3rem', md: 'h1' }} textStyle="heading" lineHeight="0.95" color="ink" mb="md">
            {t('heroTitle')}
          </Heading>
          <Text fontSize="md" color="inkSoft" fontWeight="light" fontFamily="heading" lineHeight={1.55} maxW="460px">
            {t('heroSub')}
          </Text>
        </Box>
      </Box>

      <Box as="section" maxW="820px" mx="auto" px={{ base: '1.5rem', md: '4rem' }} pb={{ base: '3rem', md: '5rem' }}>
        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '140px 1fr' }} gap={{ base: 'sm', md: '2.5rem' }} py={{ base: '2rem', md: '2.5rem' }} borderTop="0.5px solid" borderColor="borderSoft">
          <Flex direction={{ base: 'row', md: 'column' }} gap={{ base: 'sm', md: '0' }} alignItems={{ base: 'center', md: 'flex-start' }}>
            <Text fontSize="sm" color="inkMuted" fontWeight="medium" fontFamily="heading">01</Text>
            <Heading as="h2" fontSize="h4" color="ink" textTransform="uppercase" textStyle="heading" fontWeight="regular">{t('title')}</Heading>
          </Flex>
          <Text fontSize="xl" lineHeight={1.65} color="inkSoft" fontWeight="light">{t('intro')}</Text>
        </Box>

        {sections.map((section) => (
          <Box
            key={section.num}
            display="grid"
            gridTemplateColumns={{ base: '1fr', md: '140px 1fr' }}
            gap={{ base: 'sm', md: '2.5rem' }}
            py={{ base: '2rem', md: '2.5rem' }}
            borderTop="0.5px solid"
            borderColor="borderSoft"
          >
            <Flex direction={{ base: 'row', md: 'column' }} gap={{ base: 'sm', md: '0' }} alignItems={{ base: 'center', md: 'flex-start' }}>
              <Text fontSize="sm" color="inkMuted" fontWeight="medium" fontFamily="heading">{section.num}</Text>
              <Heading as="h2" fontSize="h4" color="ink" textTransform="uppercase" textStyle="heading" fontWeight="regular">{section.tag}</Heading>
            </Flex>
            <Box as="ul" pl="lg" m={0} color="inkSoft">
              {section.items.map((item) => (
                <Box as="li" key={item} fontSize="xl" lineHeight={1.65} fontWeight="light" mb="sm">{item}</Box>
              ))}
            </Box>
          </Box>
        ))}

        <Box display="grid" gridTemplateColumns={{ base: '1fr', md: '140px 1fr' }} gap={{ base: 'sm', md: '2.5rem' }} py={{ base: '2rem', md: '2.5rem' }} borderTop="0.5px solid" borderColor="borderSoft">
          <Flex direction={{ base: 'row', md: 'column' }} gap={{ base: 'sm', md: '0' }} alignItems={{ base: 'center', md: 'flex-start' }}>
            <Text fontSize="sm" color="inkMuted" fontWeight="medium" fontFamily="heading">04</Text>
            <Heading as="h2" fontSize="h4" color="ink" textTransform="uppercase" textStyle="heading" fontWeight="regular">{t('contactLabel')}</Heading>
          </Flex>
          <Box>
            <Text fontSize="xl" lineHeight={1.65} color="inkSoft" fontWeight="light" mb="md">{t('contactBody')}</Text>
            <Link href={`mailto:${contactEmail}`} fontSize="md" color="ink" textDecoration="underline" textUnderlineOffset="3px">
              {contactEmail}
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
