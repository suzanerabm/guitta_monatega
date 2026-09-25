import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getBichittos, getBichittosBooksText } from '@/lib/content/bichittos';
import type { Locale } from '@/lib/content/types';
import { BichittosClient } from './BichittosClient';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bichittos' });
  return {
    ...buildPageMetadata({
      locale,
      route: 'bichittos',
      title: t('pageTitle'),
      description: t('heroDesc'),
    }),
    icons: { icon: '/icons/bichittos.png' },
  };
}

export default async function BichittosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = getBichittos(locale as Locale);
  const booksText = getBichittosBooksText(locale as Locale);

  return <BichittosClient data={data} booksText={booksText} />;
}
