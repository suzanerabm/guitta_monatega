import { setRequestLocale } from 'next-intl/server';
import { getArtImages } from '@/lib/images';
import { ArtClient } from './ArtClient';

const SECTION_IDS = [
  'black',
  'grafite',
  'doodle',
  'digital',
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

  const sections = SECTION_IDS.map((id) => {
    const imgs = getArtImages(id);
    return { id, thumbs: imgs.thumbs, full: imgs.full };
  });

  return <ArtClient sections={sections} />;
}
