import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getKammaraPage } from '@/lib/content/kammara';
import type { Locale } from '@/lib/content/types';
import { KammaraClient } from './KammaraClient';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kammara' });
  const sectionText = t.raw('section.text') as string[];
  return {
    ...buildPageMetadata({
      locale,
      route: 'kammara',
      title: t('pageTitle'),
      description: sectionText.join(' '),
    }),
    icons: { icon: '/icons/kammara.svg' },
  };
}

export default async function KammaraPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Toda a montagem — e todos os gates de visibilidade — moram em
  // `src/lib/content/kammara.ts`, que é a mesma função consumida pelos route
  // handlers de /api/v1. Conteúdo não publicado não sai daqui.
  const data = getKammaraPage(locale as Locale);

  return <KammaraClient {...data} />;
}
