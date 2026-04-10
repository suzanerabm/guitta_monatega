import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithChakra } from '@/test-utils';
import { ModalProvider, useModal } from './ModalProvider';
import { Modal } from './Modal';
import { useEffect } from 'react';

function TestConsumer() {
  const { openGallery, registerGallery } = useModal();
  useEffect(() => {
    registerGallery('test', ['/img1.jpg', '/img2.jpg', '/img3.jpg']);
  }, [registerGallery]);
  return (
    <button onClick={() => openGallery('test', 0, 'Test Gallery', 'Digital')}>
      Open
    </button>
  );
}

function TestModal() {
  return (
    <ModalProvider>
      <TestConsumer />
      <Modal />
    </ModalProvider>
  );
}

describe('Modal', () => {
  it('opens gallery on trigger', () => {
    renderWithChakra(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img1.jpg');
  });

  it('navigates to next image', () => {
    renderWithChakra(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByLabelText('Next'));
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img2.jpg');
  });

  it('wraps around on prev from first image', () => {
    renderWithChakra(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.click(screen.getByLabelText('Previous'));
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img3.jpg');
  });

  it('closes on Escape keyboard', () => {
    renderWithChakra(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByRole('img')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('navigates with arrow keys', () => {
    renderWithChakra(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    let img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img2.jpg');
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img1.jpg');
  });

  it('shows image counter', () => {
    renderWithChakra(<TestModal />);
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
