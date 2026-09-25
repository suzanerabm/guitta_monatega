import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ModalProvider, Modal, ModalKammara } from '@/components/Modal';
import { ChromeTintProvider } from '@/components/ChromeTint';
import { AutoBreadcrumb } from '@/components/Breadcrumb';
import { version } from '../../../package.json';
import { SITE_NAME, SITE_URL, normalizeLocale } from '@/lib/seo';

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
  const licensingPath = `/${locale}/licensing-partnerships`;
  const privacyPath = `/${locale}/privacy`;
  const normalizedLocale = normalizeLocale(locale);
  const language = normalizedLocale === 'pt' ? 'pt-BR' : 'en';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: ['pt-BR', 'en'],
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#guitta-monatega`,
        name: 'Guitta Monatega',
        url: `${SITE_URL}/${normalizedLocale}/about`,
        jobTitle:
          normalizedLocale === 'pt'
            ? 'Escritora, ilustradora e engenheira de universos'
            : 'Writer, illustrator and world systems engineer',
      },
    ],
  };

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div lang={language}>
      <ChromeTintProvider>
        <ModalProvider>
          <Header homePath={homePath} />
          <AutoBreadcrumb />
          <main>{children}</main>
          <Footer
            aboutPath={aboutPath}
            aboutLabel={t('footerAbout')}
            licensingPath={licensingPath}
            licensingLabel={t('footerLicensing')}
            privacyPath={privacyPath}
            privacyLabel={t('footerPrivacy')}
            copyright={t('footerCopyright')}
            version={version}
          />
          <Modal />
          <ModalKammara />
        </ModalProvider>
      </ChromeTintProvider>
      </div>
    </NextIntlClientProvider>
  );
}
