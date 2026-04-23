import { Box } from '@chakra-ui/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HomeBanner } from '@/components/HomeBanner';
import { HeroSection } from '@/components/HeroSection';
// import { DSCard } from '@/components/DSCard';
// import { BichittosBannerWithNinha } from './BichittosBannerWithNinha';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const prefix = `/${locale}`;

  return (
    <>
      <HeroSection
        variant="home"
        title="guitta monatega"
        label={t('heroSub')}
        minHeight="10vh"
      />

      {/* === Versão com hover/expand (DSCard + Zeco/Ninha/Napcat/Rui) ===
      <DSCard
        width="100vw"
        marginLeft="calc(-50vw + 50%)"
        expand={{
          amount: 0.1,
          left: {
            content: (
              <BichittosBannerWithNinha
                href={`${prefix}/bichittos`}
                label={t('bichittos.label')}
                title={t('bichittos.title')}
                description={t('bichittos.desc')}
              />
            ),
          },
          right: {
            content: (
              <HomeBanner
                href={`${prefix}/kammara`}
                label={t('kammara.label')}
                title={t('kammara.title')}
                description={t('kammara.desc')}
                variant="kammara"
                height={{ base: '60vh', md: '85vh' }}
                minHeight={{ base: '340px', md: '595px' }}
              />
            ),
          },
        }}
      />
      === Fim versão hover === */}

      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gridTemplateRows={{ base: 'auto', md: 'auto 1fr' }}
        width="100vw"
        marginLeft="calc(-50vw + 50%)"
      >
        <Box gridColumn={{ base: '1', md: '1 / -1' }}>
          <HomeBanner
            href={`${prefix}/art`}
            label={t('art.label')}
            title={t('art.title')}
            description={t('art.desc')}
            variant="arte"
            fullWidth
            height={{ base: '25vh', md: '28vh' }}
            minHeight={{ base: '140px', md: '200px' }}
            order={1}
            orderSide="right"
          />
        </Box>
        <HomeBanner
          href={`${prefix}/bichittos`}
          label={t('bichittos.label')}
          title={t('bichittos.title')}
          description={t('bichittos.desc')}
          variant="bichittos"
          height={{ base: '35vh', md: '42vh' }}
          minHeight={{ base: '180px', md: '280px' }}
          order={2}
          orderSide="right"
        />
        <HomeBanner
          href={`${prefix}/kammara`}
          label={t('kammara.label')}
          title={t('kammara.title')}
          description={t('kammara.desc')}
          variant="kammara"
          height={{ base: '35vh', md: '42vh' }}
          minHeight={{ base: '180px', md: '280px' }}
          order={3}
          orderSide="left"
        />
      </Box>
    </>
  );
}
