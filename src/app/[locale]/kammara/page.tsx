import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getCharacters,
  getBooks,
  getBookPages,
  getKammaraBg,
} from '@/lib/images';
import { getWorldSubsystemImages, getWorldScenes, getWorldDrops } from '@/data/characters/kammara/_worldData';
import type { Locale } from '@/lib/characters';
import { KammaraClient } from './KammaraClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kammara' });
  return {
    title: t('pageTitle'),
    icons: { icon: '/icons/kammara.svg' },
  };
}

const WORLD_IDS = ['lunnp1', 'eni4', 'triplec', 'orfv', 'z1', 'gotto', 'digg', 'memphis'] as const;
const TRIPLEC_REGIONS = ['malloc', 'mesh', 'sharp'] as const;

export default async function KammaraPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const worlds = WORLD_IDS.map((id) => {
    const base = {
      id,
      chars: getCharacters(`kammara/${id}`),
      scenes: getWorldScenes(id, loc),
      drops: getWorldDrops(id, loc),
      bgImage: getKammaraBg(`kammara/${id}`),
      subsystemImages: getWorldSubsystemImages(id),
    };
    // Only triplec has sub-regions. Read their content in parallel so the
    // client has everything it needs without extra fetch logic.
    if (id === 'triplec') {
      const regions = Object.fromEntries(
        TRIPLEC_REGIONS.map((regionId) => [
          regionId,
          {
            id: regionId,
            chars: getCharacters(`kammara/triplec/${regionId}`),
            scenes: getWorldScenes(`triplec-${regionId}`, loc),
            drops: getWorldDrops(`triplec-${regionId}`, loc),
            bgImage: getKammaraBg(`kammara/triplec/${regionId}`),
            subsystemImages: getWorldSubsystemImages(`triplec-${regionId}`),
          },
        ])
      );
      return { ...base, regions };
    }
    return base;
  });

  const kammaraBooks = getBooks('kammara').map((b) => ({
    ...b,
    pages: getBookPages('kammara', b.id),
  }));

  const kammaraBg = getKammaraBg('kammara');
  const kammaraChars = getCharacters('kammara');

  return (
    <KammaraClient
      worlds={worlds}
      kammaraBooks={kammaraBooks}
      kammaraBg={kammaraBg}
      kammaraChars={kammaraChars}
    />
  );
}
