import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@chakra-ui/react';
import { ModalProvider, useModal } from './ModalProvider';
import { Modal } from './Modal';
import { ModalKammara } from './ModalKammara';

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
        <ModalKammara />
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

function KammaraTrigger() {
  const { registerGallery, openKammaraGallery } = useModal();
  return (
    <Button
      onClick={() => {
        registerGallery('km-demo', [
          "/imgs/kammara/lunnp1/_scenes/Erú'Rin_e_Lúm'Esha_plantando.jpg",
          '/imgs/kammara/lunnp1/_scenes/cena_com_frutas_flutuantes.jpg',
          '/imgs/kammara/lunnp1/_scenes/regiao_EXTERMO_NORTE.jpg',
        ], ['Plantando', 'Frutas Flutuantes', 'Extremo Norte']);
        openKammaraGallery({
          galleryId: 'km-demo',
          startIndex: 0,
          color: '#00e676',
          darkColor: '#002e14',
          crestGlyph: '⊙',
          heroTitle: "LUNN'P1",
          heroText: 'Cenas do planeta-jardim',
        });
      }}
    >
      Open Kammara Modal
    </Button>
  );
}

export const Kammara: StoryObj = {
  decorators: [
    (Story) => (
      <ModalProvider>
        <KammaraTrigger />
        <Modal />
        <ModalKammara />
        <Story />
      </ModalProvider>
    ),
  ],
  render: () => (
    <div style={{ padding: '4rem' }}>Click the button above to open the Kammara modal</div>
  ),
};
