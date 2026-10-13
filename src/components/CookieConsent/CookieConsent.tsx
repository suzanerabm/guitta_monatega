'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { Box, Flex, Heading, Link as ChakraLink, Text, chakra } from '@chakra-ui/react';
import NextLink from 'next/link';
import Script from 'next/script';

type ConsentDecision = 'accepted' | 'rejected';

interface StoredConsent {
  decision: ConsentDecision;
  expiresAt: number;
}

export interface CookieConsentCopy {
  title: string;
  description: string;
  essentialLabel: string;
  essentialDescription: string;
  analyticsLabel: string;
  analyticsDescription: string;
  acceptLabel: string;
  rejectLabel: string;
  privacyLabel: string;
}

interface CookieConsentProps {
  copy: CookieConsentCopy;
  privacyPath: string;
}

interface AnalyticsWindow extends Window {
  gtag?: (...args: unknown[]) => void;
  clarity?: (...args: unknown[]) => void;
}

const CONSENT_STORAGE_KEY = 'guitta-analytics-consent-v1';
const CONSENT_CHANGE_EVENT = 'guitta:analytics-consent-change';
export const COOKIE_SETTINGS_EVENT = 'guitta:open-cookie-settings';
const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000;

function readStoredConsent(): ConsentDecision | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!value) return null;

    const stored = JSON.parse(value) as Partial<StoredConsent>;
    if (
      (stored.decision !== 'accepted' && stored.decision !== 'rejected')
      || typeof stored.expiresAt !== 'number'
      || stored.expiresAt <= Date.now()
    ) {
      return null;
    }

    return stored.decision;
  } catch {
    return null;
  }
}

function storeConsent(decision: ConsentDecision) {
  const value: StoredConsent = {
    decision,
    expiresAt: Date.now() + CONSENT_DURATION_MS,
  };

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

function clearAnalyticsCookies() {
  const analyticsCookiePrefixes = ['_ga', '_gid', '_gat', '_clck', '_clsk'];
  const hostname = window.location.hostname;

  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (!name || !analyticsCookiePrefixes.some((prefix) => name.startsWith(prefix))) {
      return;
    }

    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=${hostname}; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${hostname}; SameSite=Lax`;
  });
}

function revokeAnalyticsConsent() {
  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.gtag?.('consent', 'update', {
    ad_storage: 'denied',
    analytics_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  analyticsWindow.clarity?.('consentv2', {
    ad_Storage: 'denied',
    analytics_Storage: 'denied',
  });
  analyticsWindow.clarity?.('consent', false);
  clearAnalyticsCookies();
}

export function CookieConsent({ copy, privacyPath }: CookieConsentProps) {
  const decision = useSyncExternalStore<ConsentDecision | null | undefined>(
    subscribeToConsent,
    readStoredConsent,
    () => undefined,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isPanelOpen = decision === null || isSettingsOpen;

  useEffect(() => {
    const openSettings = () => setIsSettingsOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);

    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const choose = (nextDecision: ConsentDecision) => {
    const wasAccepted = decision === 'accepted';
    storeConsent(nextDecision);
    setIsSettingsOpen(false);

    if (nextDecision === 'rejected') {
      revokeAnalyticsConsent();
      if (wasAccepted) window.location.reload();
    }
  };

  if (decision === undefined) return null;

  return (
    <>
      {decision === 'accepted' && (
        <>
          <Analytics />
          <Script id="google-analytics-consent" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('consent', 'update', {
                ad_storage: 'denied',
                analytics_storage: 'granted',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('js', new Date());
              gtag('config', 'G-MRS9C3KNGV');
            `}
          </Script>
          <Script
            id="google-analytics-library"
            src="https://www.googletagmanager.com/gtag/js?id=G-MRS9C3KNGV"
            strategy="afterInteractive"
          />
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "yx44xydnqz");
              window.clarity('consentv2', {
                ad_Storage: 'denied',
                analytics_Storage: 'granted'
              });
            `}
          </Script>
        </>
      )}

      {isPanelOpen ? (
        <Box
          role="dialog"
          aria-label={copy.title}
          position="fixed"
          left={{ base: 'md', md: 'auto' }}
          right={{ base: 'md', md: 'lg' }}
          bottom={{ base: 'md', md: 'lg' }}
          zIndex="toast"
          width={{ base: 'auto', md: 'xl' }}
          maxWidth="xl"
          background="overlayLightStrong"
          color="ink"
          borderWidth="thin"
          borderColor="cookieDialogFrame"
          borderRadius="2xl"
          outlineWidth="thin"
          outlineStyle="solid"
          outlineColor="cookieDialogFrame"
          outlineOffset="homePlanetFrameOffset"
          boxShadow="lg"
          padding={{ base: 'lg', md: 'xl' }}
        >
          <Heading
            as="h2"
            margin={0}
            textStyle="heading"
            fontSize="xl"
            fontWeight="semibold"
            letterSpacing="tight"
          >
            {copy.title}
          </Heading>
          <Text marginTop="sm" marginBottom={0} fontSize="base" lineHeight="relaxed">
            {copy.description}
          </Text>

          <Flex direction="column" gap="md" marginTop="lg">
            <Box>
              <Text margin={0} fontSize="sm" fontWeight="semibold">
                {copy.essentialLabel}
              </Text>
              <Text marginTop="xs" marginBottom={0} fontSize="sm" color="inkSoft">
                {copy.essentialDescription}
              </Text>
            </Box>
            <Box>
              <Text margin={0} fontSize="sm" fontWeight="semibold">
                {copy.analyticsLabel}
              </Text>
              <Text marginTop="xs" marginBottom={0} fontSize="sm" color="inkSoft">
                {copy.analyticsDescription}
              </Text>
            </Box>
          </Flex>

          <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
            gap="sm"
            marginTop="lg"
          >
            <chakra.button
              type="button"
              onClick={() => choose('accepted')}
              flex={{ sm: 1 }}
              borderWidth="thin"
              borderColor="ink"
              borderRadius="full"
              background="ink"
              color="offWhite"
              paddingX="lg"
              paddingY="md"
              fontSize="sm"
              fontWeight="semibold"
              letterSpacing="wide"
              textTransform="uppercase"
            >
              {copy.acceptLabel}
            </chakra.button>
            <chakra.button
              type="button"
              onClick={() => choose('rejected')}
              flex={{ sm: 1 }}
              borderWidth="thin"
              borderColor="ink"
              borderRadius="full"
              background="transparent"
              color="ink"
              paddingX="lg"
              paddingY="md"
              fontSize="sm"
              fontWeight="semibold"
              letterSpacing="wide"
              textTransform="uppercase"
            >
              {copy.rejectLabel}
            </chakra.button>
          </Flex>

          <ChakraLink
            asChild
            display="inline-flex"
            marginTop="md"
            color="inkSoft"
            fontSize="sm"
            textDecoration="underline"
          >
            <NextLink href={privacyPath}>{copy.privacyLabel}</NextLink>
          </ChakraLink>
        </Box>
      ) : null}
    </>
  );
}
