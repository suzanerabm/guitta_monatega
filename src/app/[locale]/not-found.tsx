import { getLocale } from 'next-intl/server';
import { NotFoundContent } from '@/app/not-found';

export default async function LocaleNotFound() {
  const locale = await getLocale();

  return <NotFoundContent locale={locale === 'en' ? 'en' : 'pt'} />;
}
