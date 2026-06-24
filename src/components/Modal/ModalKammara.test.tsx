import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useEffect } from 'react';
import { renderWithChakra } from '@/test-utils';
import { ModalProvider, useModal } from '@/components/Modal';
import { ModalKammara } from './ModalKammara';

// Opens a kammara gallery on mount so ModalKammara has state to render.
function OpenOnMount() {
  const { openKammaraGallery, registerGallery } = useModal();
  useEffect(() => {
    registerGallery('test-km', ['/imgs/a.webp', '/imgs/b.webp']);
    openKammaraGallery({
      galleryId: 'test-km',
      startIndex: 0,
      color: '#00e676',
      darkColor: '#002e14',
      textColor: '#c6eed6',
      crestGlyph: '⊙',
      heroTitle: "LUNN'P1",
    });
  }, [openKammaraGallery, registerGallery]);
  return null;
}

function render() {
  return renderWithChakra(
    <ModalProvider>
      <OpenOnMount />
      <ModalKammara />
    </ModalProvider>,
  );
}

describe('ModalKammara', () => {
  // Force a clear desktop viewport so the modal renders its desktop layout
  // (single bottom nav with Previous/Next). jsdom's default 1024x768 would be
  // read as a short landscape phone by useMobileModal and show the mobile
  // side-arrows instead, duplicating the Next label.
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1280,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      writable: true,
      value: 800,
    });
  });

  it('shows the current image when open', () => {
    render();
    const imgs = screen.getAllByRole('img') as HTMLImageElement[];
    const found = imgs.some((img) => (img.getAttribute('src') ?? '').includes('/imgs/a.webp'));
    expect(found).toBe(true);
  });

  it('advances to the next image when Next is clicked', () => {
    render();
    fireEvent.click(screen.getByLabelText('Next'));
    const imgs = screen.getAllByRole('img') as HTMLImageElement[];
    const found = imgs.some((img) => (img.getAttribute('src') ?? '').includes('/imgs/b.webp'));
    expect(found).toBe(true);
  });

  it('closes when the close button is clicked', () => {
    render();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });
});
