import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getArtImages, getBookPages } from '@/lib/images';
import { getArtBooks } from '@/lib/visibility';
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

const SECTION_IDS = [ 
  'doodle',
  'grafite',
  'black',
  // 'digital',
  'collections',
  'fimo',
  'needle',
  'clay',
  'croche',
] as const;

export default async function ArtPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale === 'en' ? 'en' : 'pt';

  const sections = SECTION_IDS.map((id) => {
    const imgs = getArtImages(id);
    return { id, thumbs: imgs.thumbs, full: imgs.full };
  });

  const artBooks = getArtBooks('art', loc).map((b) => ({
    ...b,
    pages: getBookPages('art', b.id),
  }));

  return <ArtClient sections={sections} books={artBooks} />;
}
