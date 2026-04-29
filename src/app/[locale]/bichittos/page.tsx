import { setRequestLocale } from 'next-intl/server';
import { getCharacters, getBooks, getBookPages } from '@/lib/images';
import { isBichittoPublished } from '@/lib/visibility';
import { BichittosClient } from './BichittosClient';

export default async function BichittosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const allCreatures = ['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'] as const;
  const creatures = allCreatures.filter(isBichittoPublished);

  const data = creatures.map((id) => ({
    id,
    chars: getCharacters(id),
    books: getBooks(id).map((b) => ({
      ...b,
      pages: getBookPages(id, b.id),
    })),
  }));

  return <BichittosClient data={data} />;
}
