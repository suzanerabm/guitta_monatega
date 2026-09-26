import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { KammaraAppBanner } from './KammaraAppBanner';

const baseProps = {
  worldName: "LUNN'P1",
  eyebrow: 'Aplicativo Kammara',
  title: 'Quer explorar Kammara em maior profundidade?',
  description: [
    '**Kammara vai muito além do que você vê aqui.**',
    'Para curiosos e exploradores, o app abre uma nova camada do universo.',
    '**Baixe gratuitamente na App Store e no Google Play.**',
  ],
  image: '/imgs/kammara/lunnp1/_subsystems/0.jpg',
  crestGlyph: '⊙—⊹—⊙',
  color: '#00e676',
  darkColor: '#002e14',
};

describe('KammaraAppBanner', () => {
  it('shows localized copy and disabled store controls without URLs', () => {
    renderWithChakra(
      <KammaraAppBanner
        {...baseProps}
        stores={[
          { id: 'apple', label: 'App Store', url: '' },
          { id: 'android', label: 'Google Play', url: '' },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: baseProps.title.toUpperCase() }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Kammara vai muito além do que você vê aqui.' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Para curiosos e exploradores/)).toBeInTheDocument();
    expect(screen.getByLabelText('App Store — em breve')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Google Play — em breve')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders an external store link when a URL is configured', () => {
    renderWithChakra(
      <KammaraAppBanner
        {...baseProps}
        stores={[{ id: 'apple', label: 'App Store', url: 'https://apps.apple.com/' }]}
      />,
    );

    expect(screen.getByRole('link', { name: "App Store — LUNN'P1" })).toHaveAttribute(
      'href',
      'https://apps.apple.com/',
    );
  });
});
