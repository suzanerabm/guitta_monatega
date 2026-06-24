import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
