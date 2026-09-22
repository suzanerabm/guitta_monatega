import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getArtSections, getArtBooks } from '@/lib/content/art';
import type { Locale } from '@/lib/content/types';
import { ArtClient } from './ArtClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'art' });
  return { title: t('pageTitle') };
}


export default async function ArtPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sections = getArtSections();
  const books = getArtBooks(locale as Locale);

  return <ArtClient sections={sections} books={books} />;
}
