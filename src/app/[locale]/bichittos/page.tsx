import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCharacters, getBookPages } from '@/lib/images';
import { isBichittoPublished, getBichittoBooks } from '@/lib/visibility';
import { BichittosClient } from './BichittosClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'bichittos' });
  return {
    title: t('pageTitle'),
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
  const loc = locale === 'en' ? 'en' : 'pt';

  const allCreatures = ['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'] as const;
  const creatures = allCreatures.filter(isBichittoPublished);

  const data = creatures.map((id) => ({
    id,
    chars: getCharacters(id),
    // Livros vêm de characters/bichittos/bichittos_books.json AQUI, no
    // servidor — livro oculto (visible:false ou onlyLocale de outro idioma)
    // nem entra no payload (não vaza).
    books: getBichittoBooks(id, loc).map((b) => ({
      ...b,
      pages: getBookPages(id, b.id),
    })),
  }));

  return <BichittosClient data={data} />;
}
