import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ModalProvider, Modal } from '@/components/Modal';
import { SceneStrip } from './SceneStrip';

const scenes = [
  { name: 'Forest', image: '/imgs/forest.webp' },
  { name: 'Cave', image: '/imgs/cave.webp' },
  { name: 'River', image: '/imgs/river.webp' },
];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      {children}
      <Modal />
    </ModalProvider>
  );
}

describe('SceneStrip', () => {
  it('renders all scene names', () => {
    renderWithChakra(
      <Wrapper>
        <SceneStrip scenes={scenes} />
      </Wrapper>
    );
    expect(screen.getByText('Forest')).toBeInTheDocument();
    expect(screen.getByText('Cave')).toBeInTheDocument();
    expect(screen.getByText('River')).toBeInTheDocument();
  });

  it('renders section title when provided', () => {
    renderWithChakra(
      <Wrapper>
        <SceneStrip scenes={scenes} sectionTitle="SCENES" />
      </Wrapper>
    );
    expect(screen.getByRole('heading', { name: 'SCENES' })).toBeInTheDocument();
  });

  it('renders previous and next arrow buttons', () => {
    renderWithChakra(
      <Wrapper>
        <SceneStrip scenes={scenes} />
      </Wrapper>
    );
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('clicking a scene opens the modal with that image', () => {
    renderWithChakra(
      <Wrapper>
        <SceneStrip scenes={scenes} galleryId="test-gallery" />
      </Wrapper>
    );
    fireEvent.click(screen.getByTestId('scene-card-1'));
    // Modal renders an <img> with the selected scene src
    const imgs = screen.getAllByRole('img') as HTMLImageElement[];
    const found = imgs.some((img) => img.getAttribute('src') === '/imgs/cave.webp');
    expect(found).toBe(true);
  });
});
