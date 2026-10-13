import type { ComponentPropsWithoutRef } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithChakra as render } from '@/test-utils';
import {
  COOKIE_SETTINGS_EVENT,
  CookieConsent,
  type CookieConsentCopy,
} from './CookieConsent';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('next/script', () => ({
  default: (allProps: ComponentPropsWithoutRef<'script'> & { strategy?: string }) => {
    const { children, strategy, ...props } = allProps;
    void strategy;
    return <script {...props}>{children}</script>;
  },
}));

vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => <span data-testid="vercel-analytics" />,
}));

const copy: CookieConsentCopy = {
  title: 'Sua privacidade',
  description: 'Escolha se autoriza métricas opcionais.',
  essentialLabel: 'Essenciais',
  essentialDescription: 'Mantêm o site funcionando.',
  analyticsLabel: 'Análises opcionais',
  analyticsDescription: 'Ajudam a melhorar o site.',
  acceptLabel: 'Aceitar análises',
  rejectLabel: 'Recusar',
  privacyLabel: 'Privacidade e termos',
};

describe('CookieConsent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not load analytics before consent and stores rejection', async () => {
    render(<CookieConsent copy={copy} privacyPath="/pt/privacy" />);

    expect(await screen.findByRole('dialog', { name: copy.title })).toBeInTheDocument();
    expect(document.querySelector('#google-analytics-library')).not.toBeInTheDocument();
    expect(document.querySelector('#microsoft-clarity')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: copy.rejectLabel }));

    expect(screen.queryByRole('dialog', { name: copy.title })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('guitta-analytics-consent-v1')).toContain('rejected');

    window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
    expect(await screen.findByRole('dialog', { name: copy.title })).toBeInTheDocument();
  });

  it('loads all analytics services after consent', async () => {
    render(<CookieConsent copy={copy} privacyPath="/pt/privacy" />);

    fireEvent.click(await screen.findByRole('button', { name: copy.acceptLabel }));

    await waitFor(() => {
      expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
      expect(document.querySelector('#google-analytics-library')).toBeInTheDocument();
      expect(document.querySelector('#microsoft-clarity')).toBeInTheDocument();
    });
    expect(window.localStorage.getItem('guitta-analytics-consent-v1')).toContain('accepted');
  });
});
