import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@chakra-ui/react';
import { ModalProvider, useModal } from './ModalProvider';
import { Modal } from './Modal';

function ModalTrigger() {
  const { openModal } = useModal();
  return (
    <Button
      onClick={() =>
        openModal(
          'Arte Digital',
          'Digital painting',
          [
            '/imgs/art/digital/Red.jpg',
            '/imgs/art/digital/espiral.jpg',
          ],
          0
        )
      }
    >
      Open Modal
    </Button>
  );
}

const meta: Meta = {
  title: 'Components/Modal',
  decorators: [
    (Story) => (
      <ModalProvider>
        <ModalTrigger />
        <Modal />
        <Story />
      </ModalProvider>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <div style={{ padding: '4rem' }}>Click the button above to open the modal</div>
  ),
};
