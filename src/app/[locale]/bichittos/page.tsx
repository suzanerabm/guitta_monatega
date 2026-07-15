import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCharacters, getBooks, getBookPages } from '@/lib/images';
import {
  isBichittoPublished,
  isBichittoBookVisible,
  getBichittoBookBuy,
} from '@/lib/visibility';
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

  const allCreatures = ['napcat', 'zeco', 'taylo', 'cheiodebolinha', 'miscelania'] as const;
  const creatures = allCreatures.filter(isBichittoPublished);

  const data = creatures.map((id) => ({
    id,
    chars: getCharacters(id),
    // Filtra livros em characters/bichittos/bichittos_books.json AQUI, no
    // servidor — livro oculto (visible:false ou onlyLocale de outro idioma)
    // nem entra no payload (não vaza). `buy` carrega o link de compra opcional.
    books: getBooks(id)
      .filter((b) => isBichittoBookVisible(id, b.id, locale))
      .map((b) => ({
        ...b,
        pages: getBookPages(id, b.id),
        buy: getBichittoBookBuy(id, b.id),
      })),
  }));

  return <BichittosClient data={data} />;
}
