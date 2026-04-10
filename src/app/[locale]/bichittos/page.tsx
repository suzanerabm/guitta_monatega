import { setRequestLocale } from 'next-intl/server';
import { getCharacters, getBooks, getBookPages } from '@/lib/images';
import { BichittosClient } from './BichittosClient';

export default async function BichittosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const creatures = ['napcat', 'zeco', 'taylo', 'miscelania'] as const;

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
