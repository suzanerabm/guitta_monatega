import { screen, act, fireEvent } from '@testing-library/react';
import { renderWithChakra as render } from '@/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KammaraRoulette, type KammaraRouletteItem } from './KammaraRoulette';

const items: KammaraRouletteItem[] = [
  { id: 'a', icon: '⊙', label: 'Origem', title: 'Origem' },
  { id: 'b', icon: '⊶', label: 'Cultura', title: 'Cultura' },
  { id: 'c', icon: '⊷', label: 'Geografia', title: 'Geografia' },
];

/** Opacity of the orbital sphere buttons (skips the display "star"). */
function orbitalOpacities() {
  // Orbital buttons carry the item labels; the display sphere mirrors the
  // active item's label too, so we read all glyph buttons and inspect their
  // inline opacity (only the orbitals set it — the star has none).
  return screen
    .getAllByRole('button')
    .map((b) => b.style.opacity)
    .filter((o) => o !== '');
}

describe('KammaraRoulette', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('mounts and shows the orbital spheres open', () => {
    render(
      <KammaraRoulette
        items={items}
        activeIndex={0}
        onSelect={() => {}}
        color="#8ab4ff"
        darkColor="#101828"
      />,
    );
    act(() => { vi.advanceTimersByTime(0); });
    // All orbitals visible right after mount (rouletteOpen starts true).
    expect(orbitalOpacities().every((o) => o === '1')).toBe(true);
  });

  it('reabre completo ao clicar na estrelinha durante a animação de saída (bug mobile)', () => {
    render(
      <KammaraRoulette
        items={items}
        activeIndex={0}
        onSelect={() => {}}
        color="#8ab4ff"
        darkColor="#101828"
      />,
    );
    act(() => { vi.advanceTimersByTime(0); });

    // Deixa o auto-hide disparar: passa dos 2500ms (setShooting(true)) e entra
    // na janela dos 600ms da animação — mas NÃO a completa. Aqui `shooting`
    // está true, então as orbitais estão com opacity 0.
    act(() => { vi.advanceTimersByTime(2500 + 200); });
    expect(orbitalOpacities().every((o) => o === '0')).toBe(true);

    // Toca a estrelinha (display sphere) NO MEIO da animação de saída.
    const star = screen.getAllByRole('button')[0];
    act(() => { fireEvent.click(star); });

    // Após reabrir, as orbitais precisam voltar a ficar visíveis...
    expect(orbitalOpacities().every((o) => o === '1')).toBe(true);

    // ...e continuar visíveis: o timer interno da saída (600ms) foi cancelado,
    // então NÃO deve fechar logo depois.
    act(() => { vi.advanceTimersByTime(600); });
    expect(orbitalOpacities().every((o) => o === '1')).toBe(true);
  });
});
