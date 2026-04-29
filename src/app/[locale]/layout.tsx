import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ModalProvider, Modal, ModalKammara } from '@/components/Modal';
import { ChromeTintProvider } from '@/components/ChromeTint';
import { AutoBreadcrumb } from '@/components/Breadcrumb';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Critical: enable static rendering for the active locale
  setRequestLocale(locale);

  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: 'common' });
  const homePath = `/${locale}`;
  const aboutPath = `/${locale}/about`;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ChromeTintProvider>
        <ModalProvider>
          <Header homePath={homePath} />
          <AutoBreadcrumb />
          <main>{children}</main>
          <Footer aboutPath={aboutPath} aboutLabel={t('footerAbout')} />
          <Modal />
          <ModalKammara />
        </ModalProvider>
      </ChromeTintProvider>
    </NextIntlClientProvider>
  );
}
