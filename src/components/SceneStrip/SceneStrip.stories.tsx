import type { Meta, StoryObj } from '@storybook/react';
import { ModalProvider, Modal } from '@/components/Modal';
import { SceneStrip } from './SceneStrip';

const meta: Meta<typeof SceneStrip> = {
  title: 'Components/SceneStrip',
  component: SceneStrip,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <ModalProvider>
        <Story />
        <Modal />
      </ModalProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SceneStrip>;

// Real scenes from LUNN'P1 (Kammara)
const scenes = [
  { name: 'Plantando', image: "/imgs/characters/kammara/lunnp1/_scenes/Erú'Rin_e_Lúm'Esha_plantando.jpg" },
  { name: 'Frutas Flutuantes', image: '/imgs/characters/kammara/lunnp1/_scenes/cena_com_frutas_flutuantes.jpg' },
  { name: 'Extremo Norte', image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_EXTERMO_NORTE.jpg' },
  { name: 'Região Leste', image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_leste.jpg' },
  { name: 'Leste Aérea', image: '/imgs/characters/kammara/lunnp1/_scenes/regiao_leste_aerea.jpg' },
];

export const Default: Story = { args: { scenes } };

export const WithTitle: Story = {
  args: { scenes, sectionTitle: 'SCENES' },
};
