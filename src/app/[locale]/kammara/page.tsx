import { setRequestLocale } from 'next-intl/server';
import {
  getCharacters,
  getScenes,
  getBooks,
  getBookPages,
  getKammaraBg,
  getSubsystemImages,
} from '@/lib/images';
import { KammaraClient } from './KammaraClient';

const WORLD_IDS = ['lunnp1', 'eni4', 'triplec', 'orfv', 'z1', 'gotto'] as const;

export default async function KammaraPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const worlds = WORLD_IDS.map((id) => ({
    id,
    chars: getCharacters(`kammara/${id}`),
    scenes: getScenes(`kammara/${id}`),
    bgImage: getKammaraBg(`kammara/${id}`),
    subsystemImages: getSubsystemImages(`kammara/${id}`),
  }));

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
